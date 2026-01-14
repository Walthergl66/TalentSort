'use client'


import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AccessibilityProvider from '@/components/Accesibilidad/AccessibilityProvider'


export default function CandidateApplicationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [cvsData, setCvsData] = useState<any[]>([]);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/');
      return;
    }
    setUser(session.user);
    await fetchApplications(session.user.id);
  };

  const handleRefresh = async () => {
    if (!user?.id) return;
    setRefreshing(true);
    await fetchApplications(user.id);
    setRefreshing(false);
  };

  const fetchApplications = async (userId: string) => {
    try {
      // Primero obtener las aplicaciones básicas
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('job_applications')
        .select('id, status, ai_score, match_percentage, created_at, job_id, cv_id')
        .eq('candidate_id', userId)
        .order('created_at', { ascending: false });

      if (applicationsError) {
        console.error('Error en job_applications:', applicationsError);
        throw applicationsError;
      }

      if (!applicationsData || applicationsData.length === 0) {
        setApplications([]);
        setCvsData([]);
        return;
      }

      // Obtener información de las vacantes
      const jobIds = [...new Set(applicationsData.map(app => app.job_id).filter(Boolean))];
      const { data: jobsData, error: jobsError } = await supabase
        .from('job_vacancies')
        .select('id, title, description, skills_required, experience_years_min, company_id')
        .in('id', jobIds);

      if (jobsError) {
        console.error('Error en job_vacancies:', jobsError);
      }

      // Obtener información de las empresas
      const companyIds = [...new Set((jobsData || []).map(job => job.company_id).filter(Boolean))];
      const { data: companiesData, error: companiesError } = await supabase
        .from('user_profiles')
        .select('user_id, company_name')
        .in('user_id', companyIds);

      if (companiesError) {
        console.error('Error en user_profiles:', companiesError);
      }

      // Obtener información de los CVs
      const cvIds = [...new Set(applicationsData.map(app => app.cv_id).filter(Boolean))];
      const { data: cvsData, error: cvsError } = await supabase
        .from('user_cvs')
        .select('id, file_name')
        .in('id', cvIds);

      if (cvsError) {
        console.error('Error en user_cvs:', cvsError);
      }

      // Crear mapas para búsqueda rápida
      const jobsMap = new Map((jobsData || []).map(job => [job.id, job]));
      const companiesMap = new Map((companiesData || []).map(company => [company.user_id, company]));
      const cvsMap = new Map((cvsData || []).map(cv => [cv.id, cv]));

      // Transformar los datos combinando toda la información
      const transformedApplications = applicationsData.map(app => {
        const job = jobsMap.get(app.job_id);
        const company = job ? companiesMap.get(job.company_id) : null;
        const cv = cvsMap.get(app.cv_id);

        return {
          ...app,
          job_title: job?.title || 'Sin título',
          job_description: job?.description || '',
          required_skills: job?.skills_required || [],
          required_experience: job?.experience_years_min || 0,
          company_name: company?.company_name || 'Empresa no especificada',
          cv_file_name: cv?.file_name || 'No disponible',
          applied_date: app.created_at
        };
      });

      setApplications(transformedApplications);

      // También cargar todos los CVs del usuario para el selector
      const { data: allUserCvs } = await supabase
        .from('user_cvs')
        .select('id, file_name')
        .eq('user_id', userId);

      setCvsData(allUserCvs || []);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      console.error('Error details:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filterStatus === 'all') return true;
    return app.status === filterStatus;
  });

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    shortlisted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    reviewed: 'En Revisión',
    shortlisted: 'Preseleccionado',
    rejected: 'Rechazado',
    accepted: 'Aceptado'
  };

  const statusIcons: Record<string, string> = {
    pending: '',
    reviewed: '',
    shortlisted: '',
    rejected: '',
    accepted: ''
  };

  const analizarPostulacion = async (applicationId: string, cvId: string, jobId: string) => {
    if (!user) return;

    setAnalyzingId(applicationId);
    
    try {
      // Encontrar la aplicación actual para obtener los datos del trabajo
      const currentApp = applications.find(app => app.id === applicationId);
      if (!currentApp) {
        alert('No se encontró la postulación.');
        return;
      }

      // 1. Obtener el texto del CV
      const { data: cvData, error: cvError } = await supabase
        .from('user_cvs')
        .select('id, cv_text, file_name')
        .eq('id', cvId)
        .single();

      if (cvError) {
        console.error('Error al obtener CV:', cvError);
        alert('Error al cargar el CV. Por favor, intenta de nuevo.');
        return;
      }

      if (!cvData) {
        alert('No se encontró el CV. Por favor, verifica que el CV esté subido correctamente.');
        return;
      }

      console.log('[applications] CV obtenido:', {
        id: cvData.id,
        file_name: cvData.file_name,
        has_cv_text: !!cvData.cv_text,
        cv_text_length: cvData.cv_text?.length || 0
      });

      // Si el CV no tiene texto extraído, ofrecer re-procesarlo
      if (!cvData.cv_text) {
        const shouldReprocess = confirm(
          'Este CV no ha sido procesado para extraer su contenido.\n\n' +
          '¿Deseas procesarlo ahora para poder analizarlo con IA?'
        );

        if (!shouldReprocess) {
          return;
        }

        // Llamar a la API de extracción de texto
        try {
          console.log('[applications] Reprocesando CV...');
          const extractResponse = await fetch('/api/extract-cv-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cv_id: cvId })
          });

          if (!extractResponse.ok) {
            throw new Error('Error al procesar el CV');
          }

          const extractResult = await extractResponse.json();
          console.log('[applications] CV reprocesado:', extractResult);

          if (!extractResult.text) {
            alert('No se pudo extraer texto del CV. El archivo podría estar dañado o en un formato no compatible.');
            return;
          }

          // Actualizar el cvData con el texto extraído
          cvData.cv_text = extractResult.text;
          
        } catch (extractError) {
          console.error('Error al reprocesar CV:', extractError);
          alert('Error al procesar el CV. Por favor, intenta subir el CV nuevamente.');
          return;
        }
      }

      // 2. Usar los datos del trabajo desde la aplicación actual
      const jobData = {
        title: currentApp.job_title || 'Posición no especificada',
        description: currentApp.job_description || '',
        required_skills: currentApp.required_skills || [],
        required_experience: currentApp.required_experience || 0
      };

      console.log('[applications] Datos del trabajo obtenidos:', {
        title: jobData.title,
        hasDescription: !!jobData.description,
        skillsCount: jobData.required_skills.length,
        experience: jobData.required_experience
      });

      // 3. Llamar a la API de análisis
      const response = await fetch('/api/analyze-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cv_text: cvData.cv_text,
          job_description: `${jobData.title}\n\n${jobData.description || ''}`,
          required_skills: jobData.required_skills,
          required_experience: jobData.required_experience
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
        console.error('Error de la API:', errorData);
        
        // Detectar error de cuota excedida
        if (response.status === 500 && errorData.error?.includes('RESOURCE_EXHAUSTED')) {
          alert('La cuota diaria de análisis de IA se ha agotado.\n\nPor favor, intenta de nuevo mañana o contacta al administrador para aumentar el límite.');
        } else {
          alert(`Error al analizar el CV: ${errorData.error || 'Error desconocido'}`);
        }
        return;
      }

      const analysisResult = await response.json();

      // 4. Guardar el resultado en la base de datos
      const { error: updateError } = await supabase
        .from('job_applications')
        .update({
          ai_score: analysisResult.score || 0,
          match_percentage: analysisResult.match_percentage || 0,
          ai_analysis: analysisResult
        })
        .eq('id', applicationId);

      if (updateError) {
        console.error('Error al guardar análisis:', updateError);
      }

      // 5. Actualizar el estado local
      setApplications(applications.map(app => 
        app.id === applicationId 
          ? { 
              ...app, 
              ai_score: analysisResult.score || 0,
              match_percentage: analysisResult.match_percentage || 0,
              ai_analysis: analysisResult
            }
          : app
      ));

      // 6. Mostrar resultado al usuario
      const score = analysisResult.score || 0;
      const matchPercentage = analysisResult.match_percentage || 0;
      const califica = score >= 7 || matchPercentage >= 70;

      alert(
        `Análisis completado:\n\n` +
        `Puntaje: ${score}/10\n` +
        `Compatibilidad: ${matchPercentage}%\n\n` +
        (califica 
          ? 'Calificas para este puesto. Tu perfil es compatible con los requisitos.'
          : 'Tu perfil no cumple completamente con los requisitos. Considera mejorar tu CV o postularte a otras posiciones más afines.')
      );

    } catch (error) {
      console.error('Error al analizar:', error);
      alert('Ocurrió un error al analizar tu CV. Por favor, intenta de nuevo.');
    } finally {
      setAnalyzingId(null);
    }
  };

  const cancelarPostulacion = async (applicationId: string) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta postulación? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      console.log('[cancelar] Intentando cancelar aplicación:', applicationId);
      console.log('[cancelar] Usuario ID:', user?.id);
      
      const { data, error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', applicationId)
        .eq('candidate_id', user.id)
        .select(); // Agregar select para ver qué se eliminó

      console.log('[cancelar] Resultado de delete:', { data, error });

      if (error) {
        console.error('[cancelar] Error de Supabase:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.warn('[cancelar] No se eliminó ningún registro. Posible problema de permisos RLS.');
        alert('No se pudo cancelar la postulación. Esto puede ser un problema de permisos. Por favor, contacta al soporte.');
        return;
      }

      // Actualizar el estado local
      setApplications(applications.filter(app => app.id !== applicationId));
      alert('Postulación cancelada exitosamente');
      
      console.log('[cancelar] Postulación cancelada exitosamente');
    } catch (error: any) {
      console.error('[cancelar] Error al cancelar postulación:', error);
      alert(`Error al cancelar la postulación: ${error.message || 'Error desconocido'}`);
    }
  };

  if (loading) {
    return (
      <AccessibilityProvider>
        <DashboardLayout user={user}>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </AccessibilityProvider>
    );
  }

  return (
    <AccessibilityProvider>
      <DashboardLayout user={user}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Mis Postulaciones
              </h1>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
              >
                <svg 
                  className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {refreshing ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Seguimiento del estado de tus aplicaciones
            </p>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {applications.length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Total
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {applications.filter(a => a.status === 'pending').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Pendientes
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {applications.filter(a => a.status === 'shortlisted').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Preseleccionados
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {applications.filter(a => a.status === 'accepted').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Aceptados
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
                {applications.filter(a => a.status === 'rejected').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Rechazados
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrar por estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="reviewed">En Revisión</option>
              <option value="shortlisted">Preseleccionados</option>
              <option value="rejected">Rechazados</option>
              <option value="accepted">Aceptados</option>
            </select>
          </div>

          {/* Lista de aplicaciones */}
          {filteredApplications.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No hay postulaciones
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Comienza a aplicar a vacantes para ver tu progreso aquí
              </p>
              <button
                onClick={() => router.push('/jobs')}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Buscar Empleos
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xl font-bold">
                            {app.company_name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                            {app.job_title || 'Sin título'}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {app.company_name || 'Empresa no especificada'}
                          </p>
                        </div>
                      </div>
                      {/* Botón para analizar con IA */}
                      <div className="flex gap-2 mt-2">
                        <button
                          className="px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
                          onClick={() => analizarPostulacion(app.id, app.cv_id, app.job_id)}
                          disabled={analyzingId === app.id}
                        >
                          {analyzingId === app.id ? (
                            <>
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Analizando...
                            </>
                          ) : (
                            'Analizar con IA'
                          )}
                        </button>

                        <button
                          className="px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm flex items-center gap-1"
                          onClick={() => cancelarPostulacion(app.id)}
                          title="Cancelar postulación"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Cancelar
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-3">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Aplicado el {new Date(app.applied_date).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>CV usado: <span className="font-semibold">{app.cv_file_name || 'No disponible'}</span></span>
                        </span>
                        <select
                          value={app.cv_id || ''}
                          onChange={async (e) => {
                            const newCVId = e.target.value
                            
                            // Validar que no esté vacío
                            if (!newCVId) {
                              alert('Por favor selecciona un CV válido');
                              return;
                            }
                            
                            // Actualizar la postulación en la base de datos
                            try {
                              const { data: updateData, error: updateError } = await supabase
                                .from('job_applications')
                                .update({ cv_id: newCVId })
                                .eq('id', app.id)
                                .select()

                              console.log('updateData:', updateData)
                              console.log('updateError:', updateError)

                              if (updateError) {
                                console.error('Error updating application CV:', updateError)
                                alert('Error al actualizar el CV de la postulación');
                                return
                              }

                              if (!updateData || updateData.length === 0) {
                                console.warn('Update returned no rows; possible permission/RLS issue')
                              }

                              // Actualización optimista del estado local para reflejar el cambio inmediatamente
                              const newFileName = cvsData?.find((c: any) => c.id === newCVId)?.file_name || ''
                              setApplications(prev => prev.map(a => a.id === app.id ? { ...a, cv_id: newCVId, cv_file_name: newFileName } : a))

                              // Re-sincronizar por si hay otros cambios
                              await fetchApplications(user.id)
                              
                              alert('CV actualizado exitosamente');
                            } catch (err) {
                              console.error('Exception updating application CV:', err)
                              alert('Error al actualizar el CV de la postulación');
                            }
                          }}
                          className="ml-2 px-2 py-1 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="">Seleccionar CV...</option>
                          {cvsData?.map((cv: any) => (
                            <option key={cv.id} value={cv.id}>{cv.file_name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Mostrar resultado del análisis si existe */}
                      {app.ai_score !== null && app.ai_score > 0 && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                              Análisis de IA
                            </h4>
                            <div className="flex gap-3">
                              <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                  {app.ai_score}/10
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Puntaje</div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                  {app.match_percentage || 0}%
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Match</div>
                              </div>
                            </div>
                          </div>
                          
                          {(app.ai_score >= 7 || (app.match_percentage && app.match_percentage >= 70)) ? (
                            <div className="flex items-start gap-2 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
                              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <div className="text-sm text-green-800 dark:text-green-300">
                                <strong>¡Excelente!</strong> Tu perfil es altamente compatible con este puesto. Mantén esta postulación activa.
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg">
                              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <div className="text-sm text-yellow-800 dark:text-yellow-300">
                                <strong>Atención:</strong> Tu perfil no cumple completamente los requisitos. Considera mejorar tu CV o cancelar esta postulación para enfocarte en otras más afines.
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-3">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[app.status]}`}>
                        {statusIcons[app.status]} {statusLabels[app.status]}
                      </span>
                    </div>
                  </div>

                  {app.status === 'accepted' && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-green-800 dark:text-green-300 font-semibold">
                        Felicidades, has sido aceptado para esta posición. La empresa se pondrá en contacto contigo pronto.
                      </p>
                    </div>
                  )}

                  {app.status === 'shortlisted' && (
                    <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <p className="text-purple-800 dark:text-purple-300 font-semibold">
                        Has sido preseleccionado. Mantente atento a futuras comunicaciones.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AccessibilityProvider>
  )
}