-- Script para limpiar postulaciones con CVs que no existen
-- Ejecutar DESPUÉS de fix_cv_foreign_key.sql

-- 1. Ver postulaciones con CVs inválidos
SELECT 
  ja.id,
  ja.candidate_id,
  ja.cv_id,
  ja.job_id,
  ja.created_at
FROM job_applications ja
WHERE ja.cv_id IS NOT NULL 
  AND ja.cv_id NOT IN (SELECT id FROM user_cvs);

-- 2. Eliminar postulaciones con CVs inválidos
-- NOTA: Descomenta la siguiente línea solo si quieres eliminar estas postulaciones
-- DELETE FROM job_applications WHERE cv_id IS NOT NULL AND cv_id NOT IN (SELECT id FROM user_cvs);

-- 3. O actualizar a NULL en lugar de eliminar (opción más segura)
UPDATE job_applications 
SET cv_id = NULL 
WHERE cv_id IS NOT NULL 
  AND cv_id NOT IN (SELECT id FROM user_cvs);
