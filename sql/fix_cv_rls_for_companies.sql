-- Permitir que las empresas vean los CVs de candidatos que aplicaron a sus vacantes
-- Primero eliminar la política si existe
DROP POLICY IF EXISTS "Companies can view CVs of applicants" ON user_cvs;

-- Crear la política nueva
CREATE POLICY "Companies can view CVs of applicants" ON user_cvs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM job_applications ja
      JOIN job_vacancies jv ON ja.job_id = jv.id
      WHERE ja.cv_id = user_cvs.id
      AND jv.company_id = auth.uid()
    )
  );
