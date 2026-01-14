-- Permitir a los candidatos actualizar el cv_id de sus propias aplicaciones
-- Este script agrega la política RLS faltante para que los candidatos puedan cambiar el CV usado en sus postulaciones

-- Verificar políticas actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'job_applications'
ORDER BY policyname;

-- Eliminar política anterior si existe
DROP POLICY IF EXISTS "Candidates can update their applications" ON job_applications;

-- Crear política que permite a candidatos actualizar sus propias aplicaciones
CREATE POLICY "Candidates can update their applications" ON job_applications
  FOR UPDATE 
  USING (auth.uid() = candidate_id)
  WITH CHECK (auth.uid() = candidate_id);

-- Verificar que la política se creó correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'job_applications' AND policyname = 'Candidates can update their applications'
ORDER BY policyname;
