-- Crear tabla user_cvs para almacenar los CVs de los usuarios/candidatos
CREATE TABLE IF NOT EXISTS user_cvs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT DEFAULT 'application/pdf',
  candidate_name TEXT,
  candidate_email TEXT,
  experience_years INTEGER DEFAULT 0,
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  current_position TEXT,
  summary TEXT,
  ai_score INTEGER DEFAULT 0,
  strengths TEXT[] DEFAULT ARRAY[]::TEXT[],
  areas_improvement TEXT[] DEFAULT ARRAY[]::TEXT[],
  salary_expectation TEXT,
  status TEXT DEFAULT 'processed' CHECK (status IN ('processed', 'analyzing', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_user_cvs_user_id ON user_cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cvs_created_at ON user_cvs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_cvs_ai_score ON user_cvs(ai_score);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_cvs ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para que los usuarios solo puedan ver/modificar sus propios CVs
CREATE POLICY "Users can view their own CVs" ON user_cvs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own CVs" ON user_cvs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CVs" ON user_cvs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CVs" ON user_cvs
  FOR DELETE USING (auth.uid() = user_id);

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_cvs_updated_at 
  BEFORE UPDATE ON user_cvs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentar la tabla
COMMENT ON TABLE user_cvs IS 'Almacena los CVs subidos por los usuarios/candidatos con análisis de IA';
COMMENT ON COLUMN user_cvs.ai_score IS 'Puntuación del CV generada por IA (0-100)';
COMMENT ON COLUMN user_cvs.strengths IS 'Fortalezas identificadas por la IA';
COMMENT ON COLUMN user_cvs.areas_improvement IS 'Áreas de mejora sugeridas por la IA';