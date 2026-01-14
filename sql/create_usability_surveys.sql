-- Tablas para evaluación de usabilidad
-- CSAT, NASA-TLX y SUS

-- Tabla para respuestas CSAT (Customer Satisfaction)
CREATE TABLE IF NOT EXISTS usability_csat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Respuestas (escala 1-5)
  satisfaccion_global INTEGER CHECK (satisfaccion_global BETWEEN 1 AND 5),
  facilidad_uso INTEGER CHECK (facilidad_uso BETWEEN 1 AND 5),
  claridad_informacion INTEGER CHECK (claridad_informacion BETWEEN 1 AND 5),
  fluidez_interaccion INTEGER CHECK (fluidez_interaccion BETWEEN 1 AND 5),
  confianza_usuario INTEGER CHECK (confianza_usuario BETWEEN 1 AND 5),
  rapidez_percibida INTEGER CHECK (rapidez_percibida BETWEEN 1 AND 5),
  consistencia INTEGER CHECK (consistencia BETWEEN 1 AND 5),
  control_percibido INTEGER CHECK (control_percibido BETWEEN 1 AND 5),
  estetica_visual INTEGER CHECK (estetica_visual BETWEEN 1 AND 5),
  comodidad_uso INTEGER CHECK (comodidad_uso BETWEEN 1 AND 5),
  claridad_retroalimentacion INTEGER CHECK (claridad_retroalimentacion BETWEEN 1 AND 5),
  satisfaccion_resultado INTEGER CHECK (satisfaccion_resultado BETWEEN 1 AND 5),
  experiencia_general INTEGER CHECK (experiencia_general BETWEEN 1 AND 5),
  
  -- Comentarios adicionales
  comentarios TEXT,
  
  -- Metadata
  user_role TEXT,
  page_context TEXT,
  device_type TEXT,
  browser_info TEXT
);

-- Tabla para respuestas NASA-TLX (Task Load Index)
CREATE TABLE IF NOT EXISTS usability_nasa_tlx (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Respuestas (escala 1-10)
  demanda_mental INTEGER CHECK (demanda_mental BETWEEN 1 AND 10),
  demanda_fisica INTEGER CHECK (demanda_fisica BETWEEN 1 AND 10),
  demanda_temporal INTEGER CHECK (demanda_temporal BETWEEN 1 AND 10),
  rendimiento INTEGER CHECK (rendimiento BETWEEN 1 AND 10),
  esfuerzo INTEGER CHECK (esfuerzo BETWEEN 1 AND 10),
  frustracion INTEGER CHECK (frustracion BETWEEN 1 AND 10),
  sobrecarga_informativa INTEGER CHECK (sobrecarga_informativa BETWEEN 1 AND 10),
  complejidad_percibida INTEGER CHECK (complejidad_percibida BETWEEN 1 AND 10),
  fatiga_mental INTEGER CHECK (fatiga_mental BETWEEN 1 AND 10),
  atencion_requerida INTEGER CHECK (atencion_requerida BETWEEN 1 AND 10),
  
  -- Información de la tarea
  task_name TEXT,
  task_duration_seconds INTEGER,
  task_completed BOOLEAN,
  comentarios TEXT,
  
  -- Metadata
  user_role TEXT,
  device_type TEXT
);

-- Tabla para respuestas SUS (System Usability Scale)
CREATE TABLE IF NOT EXISTS usability_sus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Respuestas (escala 1-5)
  uso_frecuente INTEGER CHECK (uso_frecuente BETWEEN 1 AND 5),
  complejidad_innecesaria INTEGER CHECK (complejidad_innecesaria BETWEEN 1 AND 5),
  facilidad_uso INTEGER CHECK (facilidad_uso BETWEEN 1 AND 5),
  necesidad_ayuda INTEGER CHECK (necesidad_ayuda BETWEEN 1 AND 5),
  integracion_funcional INTEGER CHECK (integracion_funcional BETWEEN 1 AND 5),
  inconsistencia INTEGER CHECK (inconsistencia BETWEEN 1 AND 5),
  aprendizaje_rapido INTEGER CHECK (aprendizaje_rapido BETWEEN 1 AND 5),
  complicacion INTEGER CHECK (complicacion BETWEEN 1 AND 5),
  confianza INTEGER CHECK (confianza BETWEEN 1 AND 5),
  curva_aprendizaje INTEGER CHECK (curva_aprendizaje BETWEEN 1 AND 5),
  
  -- Puntaje SUS calculado (0-100)
  sus_score DECIMAL(5,2),
  
  -- Comentarios
  comentarios TEXT,
  
  -- Metadata
  user_role TEXT,
  session_duration_minutes INTEGER,
  pages_visited INTEGER,
  device_type TEXT
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_csat_user ON usability_csat(user_id);
CREATE INDEX IF NOT EXISTS idx_csat_created ON usability_csat(created_at);
CREATE INDEX IF NOT EXISTS idx_nasa_user ON usability_nasa_tlx(user_id);
CREATE INDEX IF NOT EXISTS idx_nasa_created ON usability_nasa_tlx(created_at);
CREATE INDEX IF NOT EXISTS idx_sus_user ON usability_sus(user_id);
CREATE INDEX IF NOT EXISTS idx_sus_created ON usability_sus(created_at);

-- Row Level Security
ALTER TABLE usability_csat ENABLE ROW LEVEL SECURITY;
ALTER TABLE usability_nasa_tlx ENABLE ROW LEVEL SECURITY;
ALTER TABLE usability_sus ENABLE ROW LEVEL SECURITY;

-- Políticas: usuarios pueden ver solo sus propias respuestas
CREATE POLICY "Users can view own CSAT responses"
  ON usability_csat FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own CSAT responses"
  ON usability_csat FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own NASA-TLX responses"
  ON usability_nasa_tlx FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own NASA-TLX responses"
  ON usability_nasa_tlx FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own SUS responses"
  ON usability_sus FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own SUS responses"
  ON usability_sus FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para administradores (ver todos los resultados)
CREATE POLICY "Admins can view all CSAT responses"
  ON usability_csat FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view all NASA-TLX responses"
  ON usability_nasa_tlx FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can view all SUS responses"
  ON usability_sus FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );
