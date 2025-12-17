
-- Habilitar extensión UUID si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de perfiles de usuario (se vincula con auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'recruiter' CHECK (role IN ('recruiter', 'admin', 'manager')),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar información de los CVs
CREATE TABLE candidate_cvs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Ruta en storage
  file_size INTEGER,
  file_type TEXT DEFAULT 'application/pdf',
  
  -- Información extraída por IA
  candidate_name TEXT,
  candidate_email TEXT,
  candidate_phone TEXT,
  candidate_location TEXT,
  experience_years INTEGER DEFAULT 0,
  skills TEXT[],
  education_level TEXT,
  education_details JSONB,
  position_applied TEXT,
  current_position TEXT,
  summary TEXT,
  
  -- Puntuación y clasificación IA
  ai_score INTEGER DEFAULT 0 CHECK (ai_score >= 0 AND ai_score <= 100),
  relevance_score INTEGER DEFAULT 0,
  skill_match_percentage INTEGER DEFAULT 0,
  
  -- Metadatos y estado
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'reviewed', 'rejected', 'shortlisted')),
  tags TEXT[],
  extracted_data JSONB, -- Datos crudos extraídos por IA
  processing_errors TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de posiciones de trabajo
CREATE TABLE job_positions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  required_skills TEXT[],
  preferred_skills TEXT[],
  min_experience INTEGER DEFAULT 0,
  max_experience INTEGER DEFAULT 10,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed')),
  location TEXT,
  department TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de matching entre CVs y posiciones
CREATE TABLE cv_position_matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cv_id UUID REFERENCES candidate_cvs(id) ON DELETE CASCADE,
  position_id UUID REFERENCES job_positions(id) ON DELETE CASCADE,
  match_score INTEGER DEFAULT 0 CHECK (match_score >= 0 AND match_score <= 100),
  skill_match_percentage INTEGER DEFAULT 0,
  experience_match BOOLEAN DEFAULT false,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cv_id, position_id)
);

-- Índices para optimizar consultas
CREATE INDEX idx_candidate_cvs_user_id ON candidate_cvs(user_id);
CREATE INDEX idx_candidate_cvs_experience ON candidate_cvs(experience_years);
CREATE INDEX idx_candidate_cvs_skills ON candidate_cvs USING GIN(skills);
CREATE INDEX idx_candidate_cvs_status ON candidate_cvs(status);
CREATE INDEX idx_candidate_cvs_score ON candidate_cvs(ai_score);
CREATE INDEX idx_candidate_cvs_created_at ON candidate_cvs(created_at DESC);

CREATE INDEX idx_job_positions_user_id ON job_positions(user_id);
CREATE INDEX idx_job_positions_status ON job_positions(status);
CREATE INDEX idx_job_positions_skills ON job_positions USING GIN(required_skills);

CREATE INDEX idx_cv_matches_cv_id ON cv_position_matches(cv_id);
CREATE INDEX idx_cv_matches_position_id ON cv_position_matches(position_id);
CREATE INDEX idx_cv_matches_score ON cv_position_matches(match_score DESC);

-- Políticas RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_position_matches ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para candidate_cvs
CREATE POLICY "Users can view own CVs" ON candidate_cvs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own CVs" ON candidate_cvs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own CVs" ON candidate_cvs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own CVs" ON candidate_cvs
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para job_positions
CREATE POLICY "Users can view own positions" ON job_positions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own positions" ON job_positions
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para cv_position_matches
CREATE POLICY "Users can view own matches" ON cv_position_matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM candidate_cvs 
      WHERE candidate_cvs.id = cv_position_matches.cv_id 
      AND candidate_cvs.user_id = auth.uid()
    )
  );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidate_cvs_updated_at BEFORE UPDATE ON candidate_cvs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_positions_updated_at BEFORE UPDATE ON job_positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear perfil automáticamente después del registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage configuration para CVs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cvs', 'cvs', false);

-- Políticas para storage
CREATE POLICY "Users can upload own CVs" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'cvs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view own CVs" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'cvs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update own CVs" ON storage.objects
FOR UPDATE TO authenticated USING (
  bucket_id = 'cvs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete own CVs" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'cvs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);