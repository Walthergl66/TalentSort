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
  const [analyzing, setAnalyzing] = useState<string | null>(null)

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

  const fetchVacancyAndApplications = async () => {
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

      console.log('📋 Applications fetched:', {
        count: applicationsData?.length || 0,
        data: applicationsData
      })

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError)
        throw applicationsError
      }

      if (!applicationsData || applicationsData.length === 0) {
        console.log('⚠️ No applications found for vacancy:', vacancyId)
        setApplications([])
        return
      }

      // Obtener IDs únicos de candidatos y CVs
      const candidateIds = [...new Set(applicationsData.map(app => app.candidate_id))]
      const cvIds = [...new Set(applicationsData.map(app => app.cv_id).filter(Boolean))]

      console.log('🔍 Fetching profiles for candidate IDs:', candidateIds)

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

      console.log('👥 Profiles fetched:', {
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

      console.log('✅ Formatted applications:', formattedApplications)
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

      console.log('📄 Paso 1: Obteniendo datos del CV con ID:', cvId)

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

      console.log('✅ Texto extraído:', {
        length: cvText.length,
        preview: cvText.substring(0, 150) + '...',
        hasSkills: !!(cvData.skills && cvData.skills.length > 0),
        hasSummary: !!cvData.summary
      })

      console.log('🤖 Paso 2: Enviando a análisis IA')

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

      console.log('📡 Respuesta de API:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      })

      if (!response.ok) {
        let errorDetails;
        try {
          errorDetails = await response.json()
        } catch {
          errorDetails = { error: await response.text() }
        }
        console.error('❌ AI API error completo:', errorDetails)
        throw new Error(errorDetails.detalles || errorDetails.error || 'El servicio de análisis no está disponible')
      }

      const aiResult = await response.json()
      console.log('✅ Resultado recibido:', {
        hasScore: !!aiResult.score,
        hasMatchPercentage: !!aiResult.match_percentage,
        hasAnalysis: !!aiResult.analysis
      })

      console.log('📊 Resultados del análisis:', {
        score: aiResult.score,
        match_percentage: aiResult.match_percentage
      })

      console.log('💾 Paso 3: Guardando resultados en el ranking')

      // Paso 3: Actualizar aplicación con resultados y crear ranking
      const { error: updateError } = await supabase
        .from('job_applications')
        .update({
          ai_score: aiResult.score || 0,
          match_percentage: aiResult.match_percentage || 0,
          ai_analysis: aiResult.analysis || {},
          status: 'reviewing'
        })
        .eq('id', applicationId)

      if (updateError) {
        console.error('Error updating application:', updateError)
        throw new Error('No se pudo actualizar la aplicación')
      }

      await fetchVacancyAndApplications()
      alert('✅ Análisis completado exitosamente\n\n' +
            `Puntuación: ${aiResult.score || 0}/100\n` +
            `Match: ${aiResult.match_percentage || 0}%`)
    } catch (error: any) {
      console.error('Error analyzing candidate:', error)
      
      // Determinar mensaje específico basado en el error
      let errorMessage = 'El servicio de análisis IA no está disponible.'
      if (error.message?.includes('overloaded')) {
        errorMessage = 'El servicio de IA está temporalmente sobrecargado. Por favor, intenta de nuevo en unos minutos.'
      }
      
      // Si el servicio de IA no está disponible, permitir marcar como "en revisión" manualmente
      const shouldContinue = confirm(
        `⚠️ ${errorMessage}\n\n` +
        '¿Deseas marcar esta aplicación como "En revisión" para revisarla manualmente?'
      )
      
      if (shouldContinue) {
        try {
          const { error: updateError } = await supabase
            .from('job_applications')
            .update({
              status: 'reviewing',
              ai_score: null,
              match_percentage: null
            })
            .eq('id', applicationId)

          if (updateError) {
            console.error('Error updating application:', updateError)
            alert('❌ No se pudo actualizar la aplicación')
          } else {
            await fetchVacancyAndApplications()
            alert('✅ Aplicación marcada para revisión manual')
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

  // Sort applications by AI score
  const sortedApplications = [...applications].sort((a, b) => {
    if (a.ai_score === null) return 1
    if (b.ai_score === null) return -1
    return b.ai_score - a.ai_score
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
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {vacancy.title}
              </h1>
              <div className="flex items-center gap-4">
                <p className="text-gray-600 dark:text-gray-400">
                  {applications.length} postulaciones
                </p>
                {applications.some(app => app.ai_score !== null) && (
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium">
                    🏆 Ranking habilitado
                  </span>
                )}
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
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700"
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
                        📧 {application.candidate_email}
                      </p>
                      {application.candidate_phone && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          📞 {application.candidate_phone}
                        </p>
                      )}
                      {application.candidate_location && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          📍 {application.candidate_location}
                        </p>
                      )}
                      {application.candidate_position && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          💼 {application.candidate_position}
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

                    {application.ai_score !== null && (
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end mb-1">
                          {index === 0 && (
                            <span className="text-2xl">🥇</span>
                          )}
                          {index === 1 && (
                            <span className="text-2xl">🥈</span>
                          )}
                          {index === 2 && (
                            <span className="text-2xl">🥉</span>
                          )}
                          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {application.ai_score}/100
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {application.match_percentage}% match
                        </div>
                        <div className="mt-2">
                          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                              style={{ width: `${application.match_percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {application.ai_analysis && (
                    <div className="mb-4 space-y-4">
                      {/* Header del análisis */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">🤖</span>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                            Análisis Detallado de IA
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Evaluación completa basada en el CV y requisitos de la vacante
                        </p>
                      </div>

                      {/* Evaluación formal */}
                      {application.ai_analysis.evaluation && (
                        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg border-2 border-blue-300 dark:border-blue-700 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">📊</span>
                            <strong className="text-blue-900 dark:text-blue-300 font-bold text-lg">
                              Evaluación Profesional
                            </strong>
                          </div>
                          <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                            {application.ai_analysis.evaluation}
                          </p>
                        </div>
                      )}

                      {/* Recomendación ejecutiva */}
                      {application.ai_analysis.recommendation && (
                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 p-5 rounded-lg border-2 border-indigo-300 dark:border-indigo-700">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">🎯</span>
                            <strong className="text-indigo-900 dark:text-indigo-300 font-bold text-lg">
                              Recomendación Final
                            </strong>
                          </div>
                          <p className="text-base text-gray-800 dark:text-gray-200 font-medium">
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
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">✅</span>
                            <strong className="text-green-900 dark:text-green-300 font-semibold">
                              Fortalezas Identificadas
                            </strong>
                          </div>
                          <ul className="space-y-2">
                            {application.ai_analysis.strengths.map((s: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <span className="text-green-600 dark:text-green-400 mt-1">●</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Áreas de mejora */}
                      {application.ai_analysis.weaknesses && application.ai_analysis.weaknesses.length > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">⚠️</span>
                            <strong className="text-yellow-900 dark:text-yellow-300 font-semibold">
                              Áreas de Mejora Detectadas
                            </strong>
                          </div>
                          <ul className="space-y-2">
                            {application.ai_analysis.weaknesses.map((w: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <span className="text-yellow-600 dark:text-yellow-400 mt-1">●</span>
                                <span>{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recomendaciones específicas */}
                      {application.ai_analysis.recommendations && application.ai_analysis.recommendations.length > 0 && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xl">💡</span>
                            <strong className="text-purple-900 dark:text-purple-300 font-semibold">
                              Recomendaciones de Acción
                            </strong>
                          </div>
                          <ul className="space-y-2">
                            {application.ai_analysis.recommendations.map((r: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <span className="text-purple-600 dark:text-purple-400 mt-1">●</span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {application.cv_file_name && (
                      <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        📄 {application.cv_file_name}
                      </span>
                    )}

                    {application.ai_score === null && application.cv_id && (
                      <button
                        onClick={() => handleAnalyzeCandidate(application.id, application.cv_id)}
                        disabled={analyzing === application.id}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-lg transition-colors"
                      >
                        {analyzing === application.id ? '⏳ Analizando...' : '🤖 Analizar con IA'}
                      </button>
                    )}
                    
                    {!application.cv_id && (
                      <span className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 italic">
                        ⚠️ Postulación sin CV adjunto
                      </span>
                    )}

                    {application.status === 'pending' && application.ai_score !== null && (
                      <button
                        onClick={() => handleStatusChange(application.id, 'shortlisted')}
                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                      >
                        ⭐ Preseleccionar
                      </button>
                    )}

                    {application.status === 'shortlisted' && (
                      <button
                        onClick={() => handleStatusChange(application.id, 'accepted')}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                      >
                        ✅ Aceptar
                      </button>
                    )}

                    {application.ai_score !== null && application.cv_id && !['rejected', 'accepted'].includes(application.status) && (
                      <button
                        onClick={() => handleAnalyzeCandidate(application.id, application.cv_id)}
                        disabled={analyzing === application.id}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-lg transition-colors"
                      >
                        {analyzing === application.id ? '⏳ Volver a analizar...' : '🔄 Volver a analizar'}
                      </button>
                    )}

                    {!['rejected', 'accepted'].includes(application.status) && (
                      <button
                        onClick={() => handleStatusChange(application.id, 'rejected')}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      >
                        ❌ Rechazar
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
