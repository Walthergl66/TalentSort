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
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [cvsData, setCvsData] = useState<any[]>([]);
  const [aiResult, setAiResult] = useState<any>(null);

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

  const fetchApplications = async (userId: string) => {
    try {
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('job_applications')
        .select(`id, status, ai_score, match_percentage, created_at, job_id, cv_id`)
        .eq('candidate_id', userId)
        .order('created_at', { ascending: false });
      const { data: cvsDataResp } = await supabase
        .from('user_cvs')
        .select('id, file_name')
        .eq('user_id', userId);
      if (applicationsError) throw applicationsError;
      setApplications(applicationsData || []);
      setCvsData(cvsDataResp || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filterStatus === 'all') return true;
    return app.status === filterStatus;
  });

  // ...puedes agregar aquí el resto de la lógica y helpers...

  return (
    <AccessibilityProvider>
      <DashboardLayout user={user}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mostrar resultado IA si existe */}
          {aiResult && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <h2 className="font-bold mb-2">Resultado IA</h2>
              <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(aiResult, null, 2)}</pre>
            </div>
          )}
          {/* ...resto del render, lista de aplicaciones, etc... */}
        </div>
      </DashboardLayout>
    </AccessibilityProvider>
  );
}

  return (
    <AccessibilityProvider>
      <DashboardLayout user={user}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mostrar resultado IA si existe */}
          {aiResult && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <h2 className="font-bold mb-2">Resultado IA</h2>
              <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(aiResult, null, 2)}</pre>
              </div>
          )}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Mis Postulaciones
            </h1>
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
                            {app.company_name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                            {app.job_title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            {app.company_name}
                          </p>
                        </div>
                      </div>
                      {/* Botón para analizar con IA */}
                      <button
                        className="mt-2 px-4 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                        onClick={async () => {
                          // Aquí puedes adaptar los datos según tu modelo real
                          await analizarCV(
                            app.cv_file_name || 'CV no disponible',
                            app.job_title || 'Sin descripción',
                            undefined,
                            undefined
                          );
                        }}
                      >
                        Analizar con IA
                      </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
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
                          <span>CV usado: <span className="font-semibold">{app.cv_file_name}</span></span>
                        </span>
                        <select
                          value={app.cv_id || ''}
                          onChange={async (e) => {
                            const newCVId = e.target.value
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
                            } catch (err) {
                              console.error('Exception updating application CV:', err)
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
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-3">
                      <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[app.status]}`}>
                        {statusIcons[app.status]} {statusLabels[app.status]}
                      </span>

                      {app.ai_score !== null && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {app.ai_score}/100
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Score IA
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {app.status === 'accepted' && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-green-800 dark:text-green-300 font-semibold">
                        🎉 ¡Felicidades! Has sido aceptado para esta posición. La empresa se pondrá en contacto contigo pronto.
                      </p>
                    </div>
                  )}

                  {app.status === 'shortlisted' && (
                    <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <p className="text-purple-800 dark:text-purple-300 font-semibold">
                        ⭐ Has sido preseleccionado. Mantente atento a futuras comunicaciones.
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
