-- Agregar columna cv_text a user_cvs para almacenar el texto extraído del PDF
ALTER TABLE user_cvs 
ADD COLUMN IF NOT EXISTS cv_text TEXT;

-- Agregar índice para búsquedas de texto si es necesario
CREATE INDEX IF NOT EXISTS idx_user_cvs_cv_text ON user_cvs USING gin(to_tsvector('spanish', cv_text));

-- Comentario para documentación
COMMENT ON COLUMN user_cvs.cv_text IS 'Texto completo extraído del CV mediante OCR para análisis de IA';
