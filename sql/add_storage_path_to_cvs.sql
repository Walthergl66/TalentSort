-- Agregar campo storage_path para guardar la ruta del archivo en Supabase Storage
ALTER TABLE user_cvs 
ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Crear índice para búsquedas
CREATE INDEX IF NOT EXISTS idx_user_cvs_storage_path ON user_cvs(storage_path);

-- Comentario
COMMENT ON COLUMN user_cvs.storage_path IS 'Ruta del archivo CV en Supabase Storage (ej: cvs/user-id/filename.pdf)';
