-- ============================================================================
-- SCRIPT DE INICIALIZACIÓN COMPLETA DE BASE DE DATOS
-- Sistema de Reclutamiento con IA - TalentSort
-- ============================================================================
-- INSTRUCCIONES:
-- 1. Abre Supabase Dashboard > SQL Editor
-- 2. Copia y pega este script completo
-- 3. Ejecuta todo de una vez
-- ============================================================================

-- ============================================================================
-- 1. FUNCIONES AUXILIARES
-- ============================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 2. TABLA: user_profiles (Perfiles de Usuarios)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role VARCHAR(20) DEFAULT 'candidate' CHECK (role IN ('company', 'candidate')),
  full_name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  title TEXT,
  bio TEXT,
  company_name TEXT, -- Para empresas
  company_size TEXT, -- Para empresas: 'small', 'medium', 'large', 'enterprise'
  industry TEXT, -- Para empresas
  experience_years INTEGER DEFAULT 0,
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  education JSONB DEFAULT '[]'::JSONB,
  certifications JSONB DEFAULT '[]'::JSONB,
  languages JSONB DEFAULT '[]'::JSONB,
  social_links JSONB DEFAULT '{
    "linkedin": "",
    "github": "",
    "portfolio": "",
    "twitter": ""
  }'::JSONB,
  preferences JSONB DEFAULT '{
    "job_type": "full-time",
    "remote_work": true,
    "salary_expectation": "",
    "availability": "immediate",
    "willing_to_relocate": false
  }'::JSONB,
  profile_completeness INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(location);
CREATE INDEX IF NOT EXISTS idx_user_profiles_title ON user_profiles(title);
CREATE INDEX IF NOT EXISTS idx_user_profiles_experience_years ON user_profiles(experience_years);
CREATE INDEX IF NOT EXISTS idx_user_profiles_completeness ON user_profiles(profile_completeness);
CREATE INDEX IF NOT EXISTS idx_user_profiles_skills ON user_profiles USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferences ON user_profiles USING GIN (preferences);
CREATE INDEX IF NOT EXISTS idx_user_profiles_education ON user_profiles USING GIN (education);

-- RLS para user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;
CREATE POLICY "Users can delete their own profile" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular completitud del perfil
CREATE OR REPLACE FUNCTION calculate_profile_completeness()
RETURNS TRIGGER AS $$
DECLARE
  completeness INTEGER := 0;
BEGIN
  -- Campos básicos
  IF NEW.full_name IS NOT NULL AND NEW.full_name != '' THEN
    completeness := completeness + 15;
  END IF;
  
  IF NEW.email IS NOT NULL AND NEW.email != '' THEN
    completeness := completeness + 10;
  END IF;
  
  IF NEW.phone IS NOT NULL AND NEW.phone != '' THEN
    completeness := completeness + 10;
  END IF;
  
  IF NEW.location IS NOT NULL AND NEW.location != '' THEN
    completeness := completeness + 10;
  END IF;
  
  IF NEW.title IS NOT NULL AND NEW.title != '' THEN
    completeness := completeness + 15;
  END IF;
  
  IF NEW.bio IS NOT NULL AND NEW.bio != '' THEN
    completeness := completeness + 10;
  END IF;
  
  -- Habilidades
  IF array_length(NEW.skills, 1) > 0 THEN
    completeness := completeness + 15;
  END IF;
  
  -- Educación
  IF jsonb_array_length(NEW.education) > 0 THEN
    completeness := completeness + 10;
  END IF;
  
  -- Idiomas
  IF jsonb_array_length(NEW.languages) > 0 THEN
    completeness := completeness + 5;
  END IF;

  -- Enlaces profesionales
  IF NEW.social_links->>'linkedin' IS NOT NULL AND NEW.social_links->>'linkedin' != '' THEN
    completeness := completeness + 10;
  END IF;

  NEW.profile_completeness := LEAST(completeness, 100);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_profile_completeness_trigger ON user_profiles;
CREATE TRIGGER calculate_profile_completeness_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_profile_completeness();

-- ============================================================================
-- 3. TABLA: candidate_cvs (CVs de Candidatos)
-- ============================================================================

-- Eliminar tabla si existe para recrearla limpiamente
DROP TABLE IF EXISTS candidate_cvs CASCADE;

CREATE TABLE candidate_cvs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  cv_text TEXT NOT NULL,
  candidate_name TEXT NOT NULL DEFAULT '',
  candidate_email TEXT NOT NULL DEFAULT '',
  candidate_phone TEXT,
  candidate_location TEXT,
  experience_years INTEGER DEFAULT 0,
  skills TEXT[] DEFAULT '{}',
  education_level TEXT,
  current_position TEXT,
  summary TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para candidate_cvs
CREATE INDEX idx_candidate_cvs_user_id ON candidate_cvs(user_id);
CREATE INDEX idx_candidate_cvs_is_active ON candidate_cvs(is_active);

-- RLS para candidate_cvs
ALTER TABLE candidate_cvs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own CVs" ON candidate_cvs;
CREATE POLICY "Users can view their own CVs" ON candidate_cvs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own CVs" ON candidate_cvs;
CREATE POLICY "Users can insert their own CVs" ON candidate_cvs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own CVs" ON candidate_cvs;
CREATE POLICY "Users can update their own CVs" ON candidate_cvs
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own CVs" ON candidate_cvs;
CREATE POLICY "Users can delete their own CVs" ON candidate_cvs
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_candidate_cvs_updated_at ON candidate_cvs;
CREATE TRIGGER update_candidate_cvs_updated_at 
  BEFORE UPDATE ON candidate_cvs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. TABLA: job_vacancies (Vacantes de Trabajo)
-- ============================================================================

-- Eliminar tabla si existe para recrearla limpiamente
DROP TABLE IF EXISTS job_vacancies CASCADE;

CREATE TABLE job_vacancies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  skills_required TEXT[] DEFAULT '{}',
  experience_years_min INTEGER DEFAULT 0,
  experience_years_max INTEGER,
  salary_min DECIMAL(10,2),
  salary_max DECIMAL(10,2),
  location TEXT NOT NULL,
  employment_type VARCHAR(20) CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'freelance')) DEFAULT 'full-time',
  status VARCHAR(20) CHECK (status IN ('open', 'closed', 'draft')) DEFAULT 'draft',
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closes_at TIMESTAMP WITH TIME ZONE
);

-- Índices para job_vacancies
CREATE INDEX idx_job_vacancies_company_id ON job_vacancies(company_id);
CREATE INDEX idx_job_vacancies_status ON job_vacancies(status);
CREATE INDEX idx_job_vacancies_location ON job_vacancies(location);
CREATE INDEX idx_job_vacancies_employment_type ON job_vacancies(employment_type);

-- RLS para job_vacancies
ALTER TABLE job_vacancies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view open vacancies" ON job_vacancies;
CREATE POLICY "Anyone can view open vacancies" ON job_vacancies
  FOR SELECT USING (status = 'open' OR auth.uid() = company_id);

DROP POLICY IF EXISTS "Companies can insert their own vacancies" ON job_vacancies;
CREATE POLICY "Companies can insert their own vacancies" ON job_vacancies
  FOR INSERT WITH CHECK (auth.uid() = company_id);

DROP POLICY IF EXISTS "Companies can update their own vacancies" ON job_vacancies;
CREATE POLICY "Companies can update their own vacancies" ON job_vacancies
  FOR UPDATE USING (auth.uid() = company_id);

DROP POLICY IF EXISTS "Companies can delete their own vacancies" ON job_vacancies;
CREATE POLICY "Companies can delete their own vacancies" ON job_vacancies
  FOR DELETE USING (auth.uid() = company_id);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_job_vacancies_updated_at ON job_vacancies;
CREATE TRIGGER update_job_vacancies_updated_at 
  BEFORE UPDATE ON job_vacancies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. TABLA: job_applications (Postulaciones)
-- ============================================================================

-- Eliminar tabla si existe para recrearla limpiamente
DROP TABLE IF EXISTS job_applications CASCADE;

CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES job_vacancies(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cv_id UUID REFERENCES candidate_cvs(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'reviewing', 'shortlisted', 'rejected', 'accepted')) DEFAULT 'pending',
  ai_score DECIMAL(5,2),
  match_percentage DECIMAL(5,2),
  ai_analysis JSONB,
  cover_letter TEXT,
  notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(job_id, candidate_id)
);

-- Índices para job_applications
CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_candidate_id ON job_applications(candidate_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_job_applications_ai_score ON job_applications(ai_score DESC);

-- RLS para job_applications
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Candidates can view their own applications" ON job_applications;
CREATE POLICY "Candidates can view their own applications" ON job_applications
  FOR SELECT USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Companies can view applications to their jobs" ON job_applications;
CREATE POLICY "Companies can view applications to their jobs" ON job_applications
  FOR SELECT USING (
    auth.uid() IN (
      SELECT company_id FROM job_vacancies WHERE id = job_applications.job_id
    )
  );

DROP POLICY IF EXISTS "Candidates can create applications" ON job_applications;
CREATE POLICY "Candidates can create applications" ON job_applications
  FOR INSERT WITH CHECK (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Candidates can update their applications" ON job_applications;
CREATE POLICY "Candidates can update their applications" ON job_applications
  FOR UPDATE USING (auth.uid() = candidate_id);

DROP POLICY IF EXISTS "Companies can update applications status" ON job_applications;
CREATE POLICY "Companies can update applications status" ON job_applications
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT company_id FROM job_vacancies WHERE id = job_applications.job_id
    )
  );

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
CREATE TRIGGER update_job_applications_updated_at 
  BEFORE UPDATE ON job_applications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. STORAGE BUCKET: CVs
-- ============================================================================

-- Crear bucket para CVs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cvs', 'cvs', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para CVs
DROP POLICY IF EXISTS "Users can upload their own CVs" ON storage.objects;
CREATE POLICY "Users can upload their own CVs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cvs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can view their own CVs" ON storage.objects;
CREATE POLICY "Users can view their own CVs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'cvs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Companies can view CVs of applicants" ON storage.objects;
CREATE POLICY "Companies can view CVs of applicants" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'cvs'
    AND auth.uid() IN (
      SELECT jv.company_id 
      FROM job_applications ja
      JOIN job_vacancies jv ON ja.job_id = jv.id
      JOIN candidate_cvs cv ON ja.cv_id = cv.id
      WHERE cv.file_path = name
    )
  );

DROP POLICY IF EXISTS "Users can delete their own CVs" ON storage.objects;
CREATE POLICY "Users can delete their own CVs" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'cvs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- 7. COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================================================

COMMENT ON TABLE user_profiles IS 'Perfiles completos de usuarios (candidatos y empresas)';
COMMENT ON TABLE candidate_cvs IS 'CVs de candidatos con texto extraído por IA';
COMMENT ON TABLE job_vacancies IS 'Vacantes de trabajo publicadas por empresas';
COMMENT ON TABLE job_applications IS 'Postulaciones de candidatos a vacantes con análisis de IA';

-- ============================================================================
-- ✅ SCRIPT COMPLETADO
-- ============================================================================
-- Verifica que todo se ejecutó correctamente mirando la consola de Supabase
-- ============================================================================
