-- Permitir a los candidatos eliminar (cancelar) y actualizar sus propias aplicaciones
-- Este script agrega las políticas RLS que faltaban

-- Primero eliminar las políticas si ya existen (por si se ejecuta dos veces)
DROP POLICY IF EXISTS "Candidates can delete their own applications" ON job_applications;
DROP POLICY IF EXISTS "Candidates can update their own applications" ON job_applications;

-- Crear la política para permitir DELETE (cancelar postulación)
CREATE POLICY "Candidates can delete their own applications" ON job_applications
  FOR DELETE
  USING (auth.uid() = candidate_id);

-- Crear la política para permitir UPDATE (cambiar CV, etc.)
CREATE POLICY "Candidates can update their own applications" ON job_applications
  FOR UPDATE
  USING (auth.uid() = candidate_id)
  WITH CHECK (auth.uid() = candidate_id);

-- Verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'job_applications'
ORDER BY cmd, policyname;
