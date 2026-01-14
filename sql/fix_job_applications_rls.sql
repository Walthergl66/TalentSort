-- Script para corregir las políticas RLS de job_applications
-- Esto permite que las empresas vean las postulaciones a sus vacantes

-- 1. Eliminar TODAS las políticas existentes de job_applications
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'job_applications'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON job_applications', pol.policyname);
    END LOOP;
END $$;

-- 2. Crear nuevas políticas correctas

-- 2. Crear nuevas políticas correctas

-- Permitir a los candidatos ver sus propias aplicaciones
CREATE POLICY "Candidates can view their own applications" ON job_applications
  FOR SELECT 
  USING (auth.uid() = candidate_id);

-- Permitir a los candidatos crear aplicaciones
CREATE POLICY "Candidates can insert applications" ON job_applications
  FOR INSERT 
  WITH CHECK (auth.uid() = candidate_id);

-- Permitir a las empresas ver las aplicaciones a sus vacantes
CREATE POLICY "Companies can view applications to their jobs" ON job_applications
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM job_vacancies 
      WHERE job_vacancies.id = job_applications.job_id 
      AND job_vacancies.company_id = auth.uid()
    )
  );

-- Permitir a las empresas actualizar aplicaciones (para cambiar status, agregar análisis IA)
CREATE POLICY "Companies can update applications to their jobs" ON job_applications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM job_vacancies 
      WHERE job_vacancies.id = job_applications.job_id 
      AND job_vacancies.company_id = auth.uid()
    )
  );

-- 3. Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'job_applications'
ORDER BY policyname;
