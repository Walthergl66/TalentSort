'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AccessibilityProvider from '@/components/Accesibilidad/AccessibilityProvider'

interface Application {
  id: string
  candidate_id: string
  cv_id: string
  status: string
  ai_score: number | null
  match_percentage: number | null
  ai_analysis: any
  created_at: string
  candidate_name: string
  candidate_email: string
  candidate_phone: string
  candidate_location: string
  candidate_experience: string
  candidate_position: string
  cv_file_name: string
}

export default function VacancyApplicationsPage() {
  const params = useParams()
  const router = useRouter()
  const vacancyId = params?.id as string

  const [user, setUser] = useState<any>(null)
  const [vacancy, setVacancy] = useState<any>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [analyzing, setAnalyzing] = useState<string | null>(null)
  const [expandedAnalysis, setExpandedAnalysis] = useState<Set<string>>(new Set())

  useEffect(() => {
    checkAuth()
  }, [vacancyId])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/')
      return
    }

    setUser(session.user)
    await fetchVacancyAndApplications()
  }

  const toggleAnalysis = (applicationId: string) => {
    setExpandedAnalysis(prev => {
      const newSet = new Set(prev)
      if (newSet.has(applicationId)) {
        newSet.delete(applicationId)
      } else {
        newSet.add(applicationId)
      }
      return newSet
    })
  }

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true)
    await fetchVacancyAndApplications()
    setRefreshing(false)
  }

  const fetchVacancyAndApplications = async (): Promise<void> => {
    try {
      // Fetch vacancy
      const { data: vacancyData, error: vacancyError } = await supabase
        .from('job_vacancies')
        .select('*')
        .eq('id', vacancyId)
        .single()

      if (vacancyError) {
        console.error('Error fetching vacancy:', vacancyError)
        throw vacancyError
      }
      
      if (!vacancyData) {
        console.error('No vacancy data found')
        return
      }
      
      // Procesar requirements y skills_required para asegurar que sean arrays
      const processedVacancy = {
        ...vacancyData,
        requirements: Array.isArray(vacancyData.requirements) ? vacancyData.requirements : [],
        skills_required: Array.isArray(vacancyData.skills_required) ? vacancyData.skills_required : []
      }
      setVacancy(processedVacancy)

      // Fetch applications
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('job_applications')
        .select('*')
        .eq('job_id', vacancyId)
        .order('created_at', { ascending: false })

      console.log('[vacancies/id] Applications fetched:', {
        count: applicationsData?.length || 0,
        data: applicationsData
      })

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError)
        throw applicationsError
      }

      if (!applicationsData || applicationsData.length === 0) {
        console.log('[vacancies/id] No applications found for vacancy:', vacancyId)
        setApplications([])
        return
      }

      // Obtener IDs únicos de candidatos y CVs
      const candidateIds = [...new Set(applicationsData.map(app => app.candidate_id))]
      const cvIds = [...new Set(applicationsData.map(app => app.cv_id).filter(Boolean))]

      console.log('[vacancies/id] Fetching profiles for candidate IDs:', candidateIds)

      // Obtener información de candidatos
      let profilesData: Array<{
        user_id: string
        full_name: string | null
        email: string | null
        phone: string | null
        location: string | null
        experience_years: number | null
        title: string | null
      }> = []
      if (candidateIds.length > 0) {
        const { data, error: profilesError } = await supabase
          .from('user_profiles')
          .select('user_id, full_name, email, phone, location, experience_years, title')
          .in('user_id', candidateIds)

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError)
        } else {
          profilesData = data || []
        }
      }

      console.log('[vacancies/id] Profiles fetched:', {
        count: profilesData?.length || 0,
        profiles: profilesData
      })

      // Obtener información de CVs si hay IDs
      let cvsData: Array<{ id: string; file_name: string }> = []
      if (cvIds.length > 0) {
        const { data, error: cvsError } = await supabase
          .from('user_cvs')
          .select('id, file_name')
          .in('id', cvIds)
        
        if (cvsError) {
          console.error('Error fetching CVs:', cvsError)
        }
        cvsData = data || []
      }

      const formattedApplications = applicationsData.map((app: any) => {
        const profile = profilesData?.find(p => p.user_id === app.candidate_id)
        const cv = cvsData.find(c => c.id === app.cv_id)
        
        return {
          id: app.id,
          candidate_id: app.candidate_id,
          cv_id: app.cv_id,
          status: app.status,
          ai_score: app.ai_score,
          match_percentage: app.match_percentage,
          ai_analysis: app.ai_analysis,
          created_at: app.created_at,
          candidate_name: profile?.full_name || 'Candidato sin nombre',
          candidate_email: profile?.email || 'Sin email',
          candidate_phone: profile?.phone || '',
          candidate_location: profile?.location || '',
          candidate_experience: profile?.experience_years ? `${profile.experience_years} años` : '',
          candidate_position: profile?.title || '',
          cv_file_name: cv?.file_name || ''
        }
      })

      console.log('[vacancies/id] Formatted applications:', formattedApplications)
      setApplications(formattedApplications)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeCandidate = async (applicationId: string, cvId: string) => {
    setAnalyzing(applicationId)

    try {
      // Validar que haya cv_id
      if (!cvId) {
        throw new Error('Este candidato no ha subido un CV')
      }

      console.log('[vacancies/id] Paso 1: Obteniendo datos del CV con ID:', cvId)

      // Obtener datos del CV directamente
      const { data: cvData, error: cvError } = await supabase
        .from('user_cvs')
        .select('file_name, summary, skills, experience_years, current_position, candidate_name, candidate_email')
        .eq('id', cvId)
        .maybeSingle()

      if (cvError) {
        console.error('Error fetching CV:', cvError)
        throw new Error('Error al consultar el CV: ' + cvError.message)
      }

      if (!cvData) {
        throw new Error('El CV no existe en la base de datos')
      }

      // Construir texto del CV para la IA siempre con toda la información
      const cvText = `
INFORMACIÓN DEL CANDIDATO
Nombre: ${cvData.candidate_name || 'No especificado'}
Email: ${cvData.candidate_email || 'No especificado'}
Posición actual: ${cvData.current_position || 'No especificada'}
Años de experiencia: ${cvData.experience_years || 0}

HABILIDADES
${cvData.skills && cvData.skills.length > 0 ? cvData.skills.join(', ') : 'No especificadas'}

RESUMEN PROFESIONAL
${cvData.summary || 'El candidato ha presentado su currículum para evaluación.'}

ARCHIVO CV
Nombre del archivo: ${cvData.file_name || 'No disponible'}
      `.trim()

      console.log('[vacancies/id] Texto extraído:', {
        length: cvText.length,
        preview: cvText.substring(0, 150) + '...',
        hasSkills: !!(cvData.skills && cvData.skills.length > 0),
        hasSummary: !!cvData.summary
      })

      console.log('[vacancies/id] Paso 2: Enviando a análisis IA')

      // Paso 2: Analizar con IA
      const response = await fetch('/api/analyze-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cv_text: cvText,
          job_description: vacancy?.description || 'Evaluar perfil del candidato',
          required_skills: vacancy?.skills_required || [],
          required_experience: vacancy?.experience_years_min || 0,
          requirements: vacancy?.requirements || []
        })
      })

      console.log('[vacancies/id] Respuesta de API:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (!response.ok) {
        let errorDetails: any = { 
          error: `Error ${response.status}`, 
          statusText: response.statusText 
        };
        
        try {
          const contentType = response.headers.get('content-type');
          const responseText = await response.text();
          
          if (contentType?.includes('application/json') && responseText) {
            try {
              errorDetails = JSON.parse(responseText);
            } catch {
              errorDetails.error = responseText;
            }
          } else {
            errorDetails.error = responseText || errorDetails.error;
          }
        } catch (parseError) {
          console.error('[vacancies/id] Error al leer respuesta:', parseError);
        }
        
        console.error('[vacancies/id] AI API error completo:', errorDetails);
        console.error('[vacancies/id] Error status:', response.status);
        console.error('[vacancies/id] Error statusText:', response.statusText);
        
        throw new Error(errorDetails.detalles || errorDetails.error || `Error ${response.status}: El servicio de análisis no está disponible`);
      }

      const aiResult = await response.json()
      console.log('[vacancies/id] Resultado recibido:', {
        hasScore: 'score' in aiResult,
        hasMatchPercentage: 'match_percentage' in aiResult,
        hasAnalysis: !!aiResult.analysis
      })

      console.log('[vacancies/id] Resultados del análisis:', {
        score: aiResult.score,
        match_percentage: aiResult.match_percentage
      })

      console.log('[vacancies/id] Paso 3: Guardando resultados en el ranking')

      // Paso 3: Actualizar aplicación con resultados del análisis de la empresa
      const { error: updateError } = await supabase
        .from('job_applications')
        .update({
          ai_analysis: {
            score: aiResult.score || 0,
            match_percentage: aiResult.match_percentage || 0,
            analysis: aiResult.analysis || 'No disponible',
            skills_match: aiResult.skills_match || 'No disponible',
            experience_analysis: aiResult.experience_analysis || 'No disponible'
          },
          status: 'reviewing'
        })
        .eq('id', applicationId)

      if (updateError) {
        console.error('Error updating application:', updateError)
        throw new Error('No se pudo actualizar la aplicación')
      }

      await fetchVacancyAndApplications()
      
      // Mostrar resumen breve
      const scoreText = aiResult.score ? `${aiResult.score}/10` : 'N/A';
      const matchText = aiResult.match_percentage ? `${aiResult.match_percentage}%` : 'N/A';
      
      alert('Análisis completado exitosamente\n\n' +
            `Puntuación: ${scoreText}\n` +
            `Compatibilidad: ${matchText}\n\n` +
            `Revisa el análisis detallado abajo para más información.`);
    } catch (error: any) {
      console.error('Error analyzing candidate:', error)
      
      // Determinar mensaje específico basado en el error
      let errorMessage = 'El servicio de análisis IA no está disponible en este momento.'
      let errorDetails = ''
      
      if (error.message?.includes('QUOTA_EXCEEDED') || error.message?.includes('cuota') || error.message?.includes('quota')) {
        // Error de cuota excedida
        errorMessage = '🚫 Cuota de IA Agotada'
        errorDetails = 'El servicio de IA ha alcanzado su límite de uso diario (20 análisis gratis).\n\n' +
                      'Opciones:\n' +
                      '• Espera hasta mañana para que se renueve la cuota\n' +
                      '• Contacta al administrador para actualizar el plan\n' +
                      '• Evalúa manualmente mientras tanto'
      } else if (error.message?.includes('después de')) {
        // Error de reintentos agotados
        errorMessage = '⚠️ El servicio de IA no respondió después de varios intentos.'
        errorDetails = 'El servidor de IA externo está experimentando problemas técnicos. Esto suele ser temporal.'
      } else if (error.message?.includes('500')) {
        errorMessage = '⚠️ El servicio de IA está temporalmente fuera de servicio.'
        errorDetails = 'Error del servidor externo (Error 500). Por favor, intenta de nuevo en unos minutos.'
      } else if (error.message?.includes('overloaded')) {
        errorMessage = '⚠️ El servicio de IA está sobrecargado.'
        errorDetails = 'Hay muchas solicitudes en este momento. Intenta nuevamente en unos minutos.'
      } else if (error.message?.includes('timeout') || error.message?.includes('AbortError')) {
        errorMessage = '⚠️ La solicitud al servicio de IA tardó demasiado.'
        errorDetails = 'El servidor no respondió a tiempo. Intenta nuevamente.'
      }
      
      // Mostrar diálogo más informativo
      const shouldContinue = confirm(
        `${errorMessage}\n\n` +
        `${errorDetails}\n\n` +
        `¿Marcar esta aplicación como "En revisión" para evaluarla manualmente?`
      )
      
      if (shouldContinue) {
        try {
          const { error: updateError } = await supabase
            .from('job_applications')
            .update({
              status: 'reviewing',
              ai_analysis: null
            })
            .eq('id', applicationId)

          if (updateError) {
            console.error('Error updating application:', updateError)
            alert('❌ No se pudo actualizar la aplicación')
          } else {
            await fetchVacancyAndApplications()
            alert('✅ Aplicación marcada para revisión manual\n\nPuedes revisar el CV del candidato y tomar una decisión basada en tu criterio.')
          }
        } catch (updateErr) {
          console.error('Update error:', updateErr)
          alert('❌ Error al actualizar la aplicación')
        }
      }
    } finally {
      setAnalyzing(null)
    }
  }

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', applicationId)

      if (error) throw error
      await fetchVacancyAndApplications()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error al actualizar estado')
    }
  }

  const downloadCV = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('cvs')
        .download(filePath)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading CV:', error)
      alert('Error al descargar CV')
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

  // Sort applications by AI score (from company analysis)
  const sortedApplications = [...applications].sort((a, b) => {
    const scoreA = a.ai_analysis?.score
    const scoreB = b.ai_analysis?.score
    
    if (scoreA === undefined || scoreA === null) return 1
    if (scoreB === undefined || scoreB === null) return -1
    return scoreB - scoreA
  })

  return (
    <AccessibilityProvider>
      <DashboardLayout user={user}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.push('/dashboard/company/vacancies')}
            className="mb-6 text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
          >
            ← Volver a mis vacantes
          </button>

          {vacancy && (
            <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {vacancy.title}
                  </h1>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      📋 {applications.length} {applications.length === 1 ? 'postulación' : 'postulaciones'}
                    </span>
                    {applications.some(app => app.ai_analysis?.score !== undefined) && (
                      <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                        ⭐ Con ranking de IA
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all shadow-sm hover:shadow"
                >
                  <svg 
                    className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {refreshing ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </div>
          )}

          {applications.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No hay postulaciones aún
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Las postulaciones aparecerán aquí cuando los candidatos apliquen
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedApplications.map((application, index) => (
                <div
                  key={application.id}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {application.ai_score !== null && (
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            #{index + 1}
                          </span>
                        )}
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {application.candidate_name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[application.status]}`}>
                          {statusLabels[application.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {application.candidate_email}
                      </p>
                      {application.candidate_phone && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {application.candidate_phone}
                        </p>
                      )}
                      {application.candidate_location && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {application.candidate_location}
                        </p>
                      )}
                      {application.candidate_position && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {application.candidate_position}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Aplicó el {new Date(application.created_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    {/* Mostrar puntuación solo si la empresa ha analizado (existe ai_analysis.score) */}
                    {application.ai_analysis && application.ai_analysis.score !== undefined && (
                      <div className="text-right bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                        <div className="flex items-center gap-2 justify-end mb-2">
                          {index === 0 && (
                            <span className="text-xl">🥇</span>
                          )}
                          {index === 1 && (
                            <span className="text-xl">🥈</span>
                          )}
                          {index === 2 && (
                            <span className="text-xl">🥉</span>
                          )}
                          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {application.ai_analysis.score}/10
                          </div>
                        </div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {application.ai_analysis.match_percentage}% compatibilidad
                        </div>
                        <div className="w-32">
                          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-blue-500 via-purple-500 to-purple-600 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                              style={{ width: `${application.ai_analysis.match_percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Mostrar análisis SOLO si la empresa lo ha generado (tiene el campo analysis) */}
                  {application.ai_analysis && application.ai_analysis.analysis && (
                    <div className="mb-4">
                      {/* Header del análisis con botón para expandir/colapsar */}
                      <button
                        onClick={() => toggleAnalysis(application.id)}
                        className="w-full bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:scale-110 transition-transform">
                              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                            <div className="text-left">
                              <h4 className="text-base font-bold text-gray-900 dark:text-white">
                                🤖 Análisis Detallado de IA
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {expandedAnalysis.has(application.id) ? 'Ocultar detalles' : 'Ver evaluación completa'}
                              </p>
                            </div>
                          </div>
                          <svg 
                            className={`w-5 h-5 text-blue-600 dark:text-blue-400 transition-transform duration-200 ${expandedAnalysis.has(application.id) ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      
                      {/* Contenido colapsable */}
                      {expandedAnalysis.has(application.id) && (
                        <div className="mt-4 space-y-4">

                      {/* Evaluación formal */}
                      {application.ai_analysis.evaluation && (
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                            <strong className="text-blue-900 dark:text-blue-300 font-bold text-base">
                              📊 Evaluación Profesional
                            </strong>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {application.ai_analysis.evaluation}
                          </p>
                        </div>
                      )}

                      {/* Recomendación ejecutiva */}
                      {application.ai_analysis.recommendation && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-xl border border-green-200 dark:border-green-800 shadow-sm">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <strong className="text-green-900 dark:text-green-300 font-bold text-base">
                              ✅ Recomendación Final
                            </strong>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                            {application.ai_analysis.recommendation}
                          </p>
                        </div>
                      )}

                      {/* Resumen de compatibilidad */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg border border-gray-300 dark:border-gray-600">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                              {application.ai_score}/100
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">
                              Puntuación General
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                              {application.match_percentage}%
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium">
                              Compatibilidad
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Fortalezas */}
                      {application.ai_analysis.strengths && application.ai_analysis.strengths.length > 0 && (
                        <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <strong className="text-green-900 dark:text-green-300 font-semibold text-sm">
                              ✨ Fortalezas Identificadas
                            </strong>
                          </div>
                          <ul className="space-y-2">
                            {application.ai_analysis.strengths.map((s: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Análisis detallado de la IA */}
                      {application.ai_analysis.analysis && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <strong className="text-gray-900 dark:text-gray-200 font-semibold text-sm">
                              📝 Análisis Detallado
                            </strong>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                            {application.ai_analysis.analysis}
                          </p>
                        </div>
                      )}

                      {/* Coincidencia de habilidades */}
                      {application.ai_analysis.skills_match && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                            </svg>
                            <strong className="text-purple-900 dark:text-purple-300 font-semibold">
                              Análisis de Habilidades
                            </strong>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {application.ai_analysis.skills_match}
                          </p>
                        </div>
                      )}

                      {/* Análisis de experiencia */}
                      {application.ai_analysis.experience_analysis && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                              <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                            </svg>
                            <strong className="text-green-900 dark:text-green-300 font-semibold">
                              Análisis de Experiencia
                            </strong>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {application.ai_analysis.experience_analysis}
                          </p>
                        </div>
                      )}

                      {/* Áreas de mejora */}
                      {application.ai_analysis.weaknesses && application.ai_analysis.weaknesses.length > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <strong className="text-yellow-900 dark:text-yellow-300 font-semibold text-sm">
                              ⚠️ Áreas de Mejora
                            </strong>
                          </div>
                          <ul className="space-y-2">
                            {application.ai_analysis.weaknesses.map((w: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                                <span>{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recomendaciones específicas */}
                      {application.ai_analysis.recommendations && application.ai_analysis.recommendations.length > 0 && (
                        <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <strong className="text-purple-900 dark:text-purple-300 font-semibold text-sm">
                              💡 Próximos Pasos Sugeridos
                            </strong>
                          </div>
                          <ul className="space-y-2">
                            {application.ai_analysis.recommendations.map((r: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {application.cv_file_name && (
                      <span className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        📎 {application.cv_file_name}
                      </span>
                    )}

                    {(!application.ai_analysis || !application.ai_analysis.analysis) && application.cv_id && (
                      <button
                        onClick={() => handleAnalyzeCandidate(application.id, application.cv_id)}
                        disabled={analyzing === application.id}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed rounded-lg transition-all shadow-sm hover:shadow"
                      >
                        {analyzing === application.id ? (
                          <>
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analizando...
                          </>
                        ) : (
                          <>
                            🤖 Analizar con IA
                          </>
                        )}
                      </button>
                    )}
                    
                    {!application.cv_id && (
                      <span className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg italic">
                        ⚠️ Sin CV adjunto
                      </span>
                    )}

                    {application.status === 'pending' && application.ai_analysis?.score !== undefined && (
                      <button
                        onClick={() => handleStatusChange(application.id, 'shortlisted')}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-all shadow-sm hover:shadow"
                      >
                        ⭐ Preseleccionar
                      </button>
                    )}

                    {application.status === 'shortlisted' && (
                      <button
                        onClick={() => handleStatusChange(application.id, 'accepted')}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all shadow-sm hover:shadow"
                      >
                        ✅ Aceptar
                      </button>
                    )}

                    {application.ai_analysis && application.ai_analysis.analysis && application.cv_id && !['rejected', 'accepted'].includes(application.status) && (
                      <button
                        onClick={() => handleAnalyzeCandidate(application.id, application.cv_id)}
                        disabled={analyzing === application.id}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-lg transition-colors"
                      >
                        {analyzing === application.id ? 'Volver a analizar...' : 'Volver a analizar'}
                      </button>
                    )}

                    {!['rejected', 'accepted'].includes(application.status) && (
                      <button
                        onClick={() => handleStatusChange(application.id, 'rejected')}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      >
                        Rechazar
                      </button>
                    )}
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
