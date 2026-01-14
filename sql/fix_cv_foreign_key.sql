-- Script para corregir la clave foránea de job_applications
-- Este script elimina la referencia a candidate_cvs y la actualiza a user_cvs

-- 1. Eliminar la restricción de clave foránea antigua
ALTER TABLE job_applications 
DROP CONSTRAINT IF EXISTS job_applications_cv_id_fkey;

-- 2. Agregar la nueva restricción que apunta a user_cvs
ALTER TABLE job_applications 
ADD CONSTRAINT job_applications_cv_id_fkey 
FOREIGN KEY (cv_id) REFERENCES user_cvs(id) ON DELETE CASCADE;

-- 3. Verificar que la restricción se creó correctamente
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'job_applications'::regclass 
AND conname = 'job_applications_cv_id_fkey';
