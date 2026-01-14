'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AccessibilityProvider from '@/components/Accesibilidad/AccessibilityProvider'

export default function CompanyAnalyticsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalVacancies: 0,
    activeVacancies: 0,
    totalApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    pendingApplications: 0,
    avgAiScore: 0,
    topSkills: [] as { skill: string; count: number }[]
  })

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
    await fetchAnalytics(session.user.id)
  }

  const fetchAnalytics = async (companyId: string) => {
    try {
      // Total vacantes
      const { data: vacancies, error: vacanciesError } = await supabase
        .from('job_vacancies')
        .select('id, status, skills_required')
        .eq('company_id', companyId)

      if (vacanciesError) throw vacanciesError

      // Total aplicaciones
      const { data: applications, error: applicationsError } = await supabase
        .from('job_applications')
        .select(`
          id,
          status,
          ai_score,
          job_vacancies!inner (
            company_id
          )
        `)
        .eq('job_vacancies.company_id', companyId)

      if (applicationsError) throw applicationsError

      // Calcular estadísticas
      const totalVacancies = vacancies?.length || 0
      const activeVacancies = vacancies?.filter(v => v.status === 'open').length || 0
      const totalApplications = applications?.length || 0
      const acceptedApplications = applications?.filter(a => a.status === 'accepted').length || 0
      const rejectedApplications = applications?.filter(a => a.status === 'rejected').length || 0
      const pendingApplications = applications?.filter(a => a.status === 'pending').length || 0

      const scoresWithValues = applications?.filter(a => a.ai_score !== null) || []
      const avgAiScore = scoresWithValues.length > 0
        ? scoresWithValues.reduce((sum, a) => sum + (a.ai_score || 0), 0) / scoresWithValues.length
        : 0

      // Top skills
      const skillsCount: Record<string, number> = {}
      vacancies?.forEach(v => {
        v.skills_required?.forEach((skill: string) => {
          skillsCount[skill] = (skillsCount[skill] || 0) + 1
        })
      })

      const topSkills = Object.entries(skillsCount)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)

      setStats({
        totalVacancies,
        activeVacancies,
        totalApplications,
        acceptedApplications,
        rejectedApplications,
        pendingApplications,
        avgAiScore: Math.round(avgAiScore),
        topSkills
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
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
              Estadísticas de Reclutamiento
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Métricas y análisis de tus procesos de contratación
            </p>
          </div>

          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalVacancies}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Vacantes
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {stats.activeVacancies} activas
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.totalApplications}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Postulaciones
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {stats.pendingApplications} pendientes
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.acceptedApplications}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Candidatos Aceptados
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {stats.totalApplications > 0 
                  ? Math.round((stats.acceptedApplications / stats.totalApplications) * 100) 
                  : 0}% del total
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.avgAiScore}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Score Promedio IA
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                De 100 puntos posibles
              </p>
            </div>
          </div>

          {/* Gráfico de estados */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Estado de Postulaciones
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Pendientes</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {stats.pendingApplications}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ 
                        width: `${stats.totalApplications > 0 
                          ? (stats.pendingApplications / stats.totalApplications) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Aceptados</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {stats.acceptedApplications}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ 
                        width: `${stats.totalApplications > 0 
                          ? (stats.acceptedApplications / stats.totalApplications) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rechazados</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {stats.rejectedApplications}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ 
                        width: `${stats.totalApplications > 0 
                          ? (stats.rejectedApplications / stats.totalApplications) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Skills */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Habilidades Más Solicitadas
              </h3>
              {stats.topSkills.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No hay datos disponibles
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.topSkills.map((skill, index) => (
                    <div key={skill.skill} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                          {index + 1}.
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {skill.skill}
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                        {skill.count} {skill.count === 1 ? 'vacante' : 'vacantes'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-xl text-white">
            <h3 className="text-xl font-bold mb-2">
              ¿Listo para encontrar más talento?
            </h3>
            <p className="mb-4 text-blue-100">
              Publica una nueva vacante y comienza a recibir candidatos calificados con análisis de IA.
            </p>
            <button
              onClick={() => router.push('/dashboard/company/vacancies')}
              className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Publicar Nueva Vacante
            </button>
          </div>
        </div>
      </DashboardLayout>
    </AccessibilityProvider>
  )
}
