'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AccessibilityProvider from '@/components/Accesibilidad/AccessibilityProvider'

interface ApplicationAnalysis {
  id: string
  job_title: string
  candidate_name: string
  candidate_email: string
  ai_score: number | null
  match_percentage: number | null
  status: string
  created_at: string
  ai_analysis: any
}

export default function CompanyAnalysisPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [applications, setApplications] = useState<ApplicationAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('score')
  const [reanalyzing, setReanalyzing] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/')
      return
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single()

    if (profile?.role !== 'company') {
      router.push('/dashboard')
      return
    }

    setUser(session.user)
    await fetchApplications(session.user.id)
  }

  const fetchApplications = async (companyId: string) => {
    try {
      // Obtener vacantes de la empresa
      const { data: vacancies, error: vacanciesError } = await supabase
        .from('job_vacancies')
        .select('id, title')
        .eq('company_id', companyId)

      if (vacanciesError) throw vacanciesError

      const vacancyIds = vacancies?.map(v => v.id) || []

      if (vacancyIds.length === 0) {
        setApplications([])
        setLoading(false)
        return
      }

      // Obtener aplicaciones con AI score
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('job_applications')
        .select('*')
        .in('job_id', vacancyIds)
        .not('ai_score', 'is', null)
        .order('ai_score', { ascending: false })

      if (applicationsError) throw applicationsError

      // Obtener información de candidatos
      const candidateIds = [...new Set(applicationsData?.map(app => app.candidate_id) || [])]
      
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, email')
        .in('user_id', candidateIds)

      const formattedApplications = applicationsData?.map((app: any) => {
        const vacancy = vacancies.find(v => v.id === app.job_id)
        const profile = profiles?.find(p => p.user_id === app.candidate_id)
        return {
          id: app.id,
          job_title: vacancy?.title || 'Sin título',
          candidate_name: profile?.full_name || 'Sin nombre',
          candidate_email: profile?.email || '',
          ai_score: app.ai_score,
          match_percentage: app.match_percentage,
          status: app.status,
          created_at: app.created_at,
          ai_analysis: app.ai_analysis
        }
      }) || []

      setApplications(formattedApplications)
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredApplications = applications.filter(app => {
    if (filterStatus === 'all') return true
    return app.status === filterStatus
  })

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortBy === 'score') {
      return (b.ai_score || 0) - (a.ai_score || 0)
    } else if (sortBy === 'match') {
      return (b.match_percentage || 0) - (a.match_percentage || 0)
    } else if (sortBy === 'date') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    return 0
  })

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    shortlisted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
  }

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    reviewed: 'Revisado',
    shortlisted: 'Preseleccionado',
    rejected: 'Rechazado',
    accepted: 'Aceptado'
  }

  const handleReanalyzeApplication = async (applicationId: string) => {
    const confirm = window.confirm(
      '¿Deseas volver a analizar esta aplicación con la IA?\n\n' +
      'Esto actualizará el puntaje y el análisis del candidato.'
    )

    if (!confirm) return

    setReanalyzing(applicationId)
    try {
      console.log('[analysis] Reanalizando aplicación...')

      // Obtener datos de la aplicación
      const { data: appData, error: appError } = await supabase
        .from('job_applications')
        .select('*, job_vacancies(title, description, requirements, skills_required, experience_years_min)')
        .eq('id', applicationId)
        .single()

      if (appError || !appData) {
        throw new Error('No se pudo obtener la aplicación')
      }

      // Obtener CV del candidato
      const { data: cvData, error: cvError } = await supabase
        .from('user_cvs')
        .select('*')
        .eq('user_id', appData.candidate_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (cvError || !cvData) {
        throw new Error('No se pudo obtener el CV del candidato')
      }

      // Construir texto del CV a partir de los datos disponibles
      const cvText = cvData.cv_text || `
INFORMACIÓN DEL CANDIDATO
Nombre: ${cvData.candidate_name || 'No especificado'}
Email: ${cvData.candidate_email || 'No especificado'}
Posición actual: ${cvData.current_position || 'No especificada'}
Años de experiencia: ${cvData.experience_years || 0}

HABILIDADES
${cvData.skills && cvData.skills.length > 0 ? cvData.skills.join(', ') : 'No especificadas'}

RESUMEN
${cvData.summary || 'Sin resumen disponible'}

FORTALEZAS
${cvData.strengths && cvData.strengths.length > 0 ? '- ' + cvData.strengths.join('\n- ') : 'No especificadas'}

ÁREAS DE MEJORA
${cvData.areas_improvement && cvData.areas_improvement.length > 0 ? '- ' + cvData.areas_improvement.join('\n- ') : 'No especificadas'}
      `.trim()

      if (!cvText || cvText.length < 50) {
        throw new Error('No hay suficiente información en el CV para analizar')
      }

      console.log('[analysis] Texto del CV generado:', {
        length: cvText.length,
        candidato: cvData.candidate_name
      })

      // Analizar con IA
      const response = await fetch('/api/analyze-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cv_text: cvText,
          job_description: appData.job_vacancies?.description || '',
          required_skills: appData.job_vacancies?.skills_required || [],
          required_experience: appData.job_vacancies?.experience_years_min || 0,
          requirements: appData.job_vacancies?.requirements || []
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error de API:', errorData)
        throw new Error(errorData.detalles || 'Error al analizar con IA')
      }

      const analysis = await response.json()

      // Actualizar aplicación
      const { error: updateError } = await supabase
        .from('job_applications')
        .update({
          ai_score: analysis.score,
          match_percentage: analysis.match_percentage,
          ai_analysis: analysis.analysis,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)

      if (updateError) {
        throw updateError
      }

      // Recargar datos
      await fetchApplications(user.id)

      alert(
        'Aplicación reanalisada exitosamente\n\n' +
        `Nuevo puntaje: ${analysis.score}/100\n` +
        `Coincidencia: ${analysis.match_percentage}%`
      )

      console.log('[analysis] Reanálisis completado')

    } catch (error: any) {
      console.error('[analysis] Error al reanalizar:', error)
      alert(
        'Error al reanalizar la aplicación\n\n' +
        (error.message || 'Por favor, intenta nuevamente.')
      )
    } finally {
      setReanalyzing(null)
    }
  }

  if (loading) {
    return (
      <AccessibilityProvider>
        <DashboardLayout user={user}>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </AccessibilityProvider>
    )
  }

  return (
    <AccessibilityProvider>
      <DashboardLayout user={user}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Análisis de Postulaciones
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Análisis detallado de candidatos con IA
            </p>
          </div>

          {/* Filtros y ordenamiento */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filtrar por estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="reviewed">Revisado</option>
                <option value="shortlisted">Preseleccionado</option>
                <option value="rejected">Rechazado</option>
                <option value="accepted">Aceptado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="score">Puntaje IA</option>
                <option value="match">% Coincidencia</option>
                <option value="date">Fecha</option>
              </select>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {applications.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Analizadas
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {applications.filter(a => a.status === 'accepted').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Aceptados
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {applications.filter(a => a.status === 'shortlisted').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Preseleccionados
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {applications.filter(a => a.ai_score && a.ai_score >= 80).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Top Candidatos (80+)
              </div>
            </div>
          </div>

          {/* Lista de aplicaciones */}
          {sortedApplications.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No hay análisis disponibles
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Los candidatos analizados con IA aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedApplications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {app.candidate_name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[app.status]}`}>
                          {statusLabels[app.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {app.candidate_email}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Vacante: {app.job_title}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                        {app.ai_score}/100
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {app.match_percentage}% match
                      </div>
                    </div>
                  </div>

                  {app.ai_analysis && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Análisis IA
                      </h4>
                      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                        {app.ai_analysis.strengths && (
                          <div>
                            <strong className="text-green-700 dark:text-green-400">Fortalezas:</strong>
                            <ul className="list-disc list-inside ml-4">
                              {app.ai_analysis.strengths.map((s: string, i: number) => (
                                <li key={i}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {app.ai_analysis.weaknesses && (
                          <div>
                            <strong className="text-orange-700 dark:text-orange-400">Áreas de mejora:</strong>
                            <ul className="list-disc list-inside ml-4">
                              {app.ai_analysis.weaknesses.map((w: string, i: number) => (
                                <li key={i}>{w}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {app.ai_analysis.recommendation && (
                          <div>
                            <strong className="text-blue-700 dark:text-blue-400">Recomendación:</strong> {app.ai_analysis.recommendation}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Botón de Reanalizar */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleReanalyzeApplication(app.id)}
                      disabled={reanalyzing === app.id}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                    >
                      {reanalyzing === app.id ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Reanalizando...
                        </>
                      ) : (
                        <>
                          Volver a Analizar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AccessibilityProvider>
  )
}
