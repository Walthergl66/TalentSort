-- Crear tabla user_profiles para almacenar los perfiles completos de los candidatos
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  location TEXT,
  title TEXT,
  bio TEXT,
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

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles(location);
CREATE INDEX IF NOT EXISTS idx_user_profiles_title ON user_profiles(title);
CREATE INDEX IF NOT EXISTS idx_user_profiles_experience_years ON user_profiles(experience_years);
CREATE INDEX IF NOT EXISTS idx_user_profiles_completeness ON user_profiles(profile_completeness);

-- Índice GIN para búsqueda en habilidades
CREATE INDEX IF NOT EXISTS idx_user_profiles_skills ON user_profiles USING GIN (skills);

-- Índices para campos JSON
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferences ON user_profiles USING GIN (preferences);
CREATE INDEX IF NOT EXISTS idx_user_profiles_education ON user_profiles USING GIN (education);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para que los usuarios solo puedan ver/modificar su propio perfil
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Política adicional para permitir que reclutadores vean perfiles (opcional)
-- CREATE POLICY "Recruiters can view candidate profiles" ON user_profiles
--   FOR SELECT USING (EXISTS (
--     SELECT 1 FROM user_profiles recruiter_profile 
--     WHERE recruiter_profile.user_id = auth.uid() 
--     AND recruiter_profile.preferences->>'user_type' = 'recruiter'
--   ));

-- Crear trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular automáticamente la completitud del perfil
CREATE OR REPLACE FUNCTION calculate_profile_completeness()
RETURNS TRIGGER AS $$
DECLARE
  completeness INTEGER := 0;
  total_fields INTEGER := 10; -- Número total de campos importantes
BEGIN
  -- Verificar campos básicos
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
  
  -- Verificar habilidades
  IF array_length(NEW.skills, 1) > 0 THEN
    completeness := completeness + 15;
  END IF;
  
  -- Verificar educación
  IF jsonb_array_length(NEW.education) > 0 THEN
    completeness := completeness + 10;
  END IF;
  
  -- Verificar idiomas
  IF jsonb_array_length(NEW.languages) > 0 THEN
    completeness := completeness + 5;
  END IF;

  -- Verificar enlaces profesionales (LinkedIn es importante)
  IF NEW.social_links->>'linkedin' IS NOT NULL AND NEW.social_links->>'linkedin' != '' THEN
    completeness := completeness + 10;
  END IF;

  -- Asegurar que no exceda 100%
  NEW.profile_completeness := LEAST(completeness, 100);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para calcular completitud automáticamente
CREATE TRIGGER calculate_profile_completeness_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_profile_completeness();

-- Comentarios para documentar la tabla
COMMENT ON TABLE user_profiles IS 'Perfiles completos de candidatos con información profesional y preferencias';
COMMENT ON COLUMN user_profiles.profile_completeness IS 'Porcentaje de completitud del perfil (0-100)';
COMMENT ON COLUMN user_profiles.skills IS 'Array de habilidades técnicas del candidato';
COMMENT ON COLUMN user_profiles.education IS 'Historial educativo en formato JSON';
COMMENT ON COLUMN user_profiles.languages IS 'Idiomas y niveles en formato JSON';
COMMENT ON COLUMN user_profiles.social_links IS 'Enlaces a perfiles profesionales (LinkedIn, GitHub, etc.)';
COMMENT ON COLUMN user_profiles.preferences IS 'Preferencias laborales del candidato';