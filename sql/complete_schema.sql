-- Schema para el sistema de reclutamiento con IA
-- Ejecutar en Supabase SQL Editor

-- 1. Actualizar tabla de perfiles con rol
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'candidate' CHECK (role IN ('company', 'candidate'));

-- 2. Tabla de CVs de candidatos
CREATE TABLE IF NOT EXISTS candidate_cvs (
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

-- 3. Tabla de vacantes de empresas
CREATE TABLE IF NOT EXISTS job_vacancies (
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

-- 4. Tabla de postulaciones
CREATE TABLE IF NOT EXISTS job_applications (
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

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_candidate_cvs_user_id ON candidate_cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_cvs_is_active ON candidate_cvs(is_active);
CREATE INDEX IF NOT EXISTS idx_job_vacancies_company_id ON job_vacancies(company_id);
CREATE INDEX IF NOT EXISTS idx_job_vacancies_status ON job_vacancies(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_candidate_id ON job_applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_ai_score ON job_applications(ai_score DESC);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_candidate_cvs_updated_at BEFORE UPDATE ON candidate_cvs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_vacancies_updated_at BEFORE UPDATE ON job_vacancies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE candidate_cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Políticas para candidate_cvs
CREATE POLICY "Users can view their own CVs" ON candidate_cvs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CVs" ON candidate_cvs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CVs" ON candidate_cvs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CVs" ON candidate_cvs
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para job_vacancies
CREATE POLICY "Anyone can view open vacancies" ON job_vacancies
  FOR SELECT USING (status = 'open' OR auth.uid() = company_id);

CREATE POLICY "Companies can insert their own vacancies" ON job_vacancies
  FOR INSERT WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Companies can update their own vacancies" ON job_vacancies
  FOR UPDATE USING (auth.uid() = company_id);

CREATE POLICY "Companies can delete their own vacancies" ON job_vacancies
  FOR DELETE USING (auth.uid() = company_id);

-- Políticas para job_applications
CREATE POLICY "Candidates can view their own applications" ON job_applications
  FOR SELECT USING (auth.uid() = candidate_id);

CREATE POLICY "Companies can view applications to their jobs" ON job_applications
  FOR SELECT USING (
    auth.uid() IN (
      SELECT company_id FROM job_vacancies WHERE id = job_applications.job_id
    )
  );

CREATE POLICY "Candidates can create applications" ON job_applications
  FOR INSERT WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "Candidates can update their applications" ON job_applications
  FOR UPDATE USING (auth.uid() = candidate_id);

CREATE POLICY "Companies can update applications status" ON job_applications
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT company_id FROM job_vacancies WHERE id = job_applications.job_id
    )
  );

-- Storage bucket para CVs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cvs', 'cvs', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
CREATE POLICY "Users can upload their own CVs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own CVs" ON storage.objects
  FOR SELECT USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own CVs" ON storage.objects
  FOR DELETE USING (bucket_id = 'cvs' AND auth.uid()::text = (storage.foldername(name))[1]);
