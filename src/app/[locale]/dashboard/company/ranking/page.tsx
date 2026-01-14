'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AccessibilityProvider from '@/components/Accesibilidad/AccessibilityProvider'
import Link from 'next/link'

interface RankedCandidate {
  id: string
  candidate_name: string
  candidate_email: string
  ai_score: number
  match_percentage: number
  job_title: string
  job_id: string
  status: string
  created_at: string
  ai_analysis: any
}

export default function RankingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userName, setUserName] = useState<string>('')
  const [candidates, setCandidates] = useState<RankedCandidate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVacancy, setSelectedVacancy] = useState<string>('all')
  const [vacancies, setVacancies] = useState<any[]>([])

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role, full_name')
        .eq('user_id', session.user.id)
        .single()

      if (profileError) {
        console.error('Error fetching profile:', profileError)
        router.push('/dashboard')
        return
      }

      if (profile?.role !== 'company') {
        router.push('/dashboard')
        return
      }

      setUser(session.user)
      setUserName(profile?.full_name || session.user.email?.split('@')[0] || 'Usuario')
      await fetchData(session.user.id)
    } catch (error) {
      console.error('Error in checkAuth:', error)
      router.push('/dashboard')
    }
  }

  const fetchData = async (userId: string) => {
    try {
      // Obtener vacantes
      const { data: vacanciesData, error: vacanciesError } = await supabase
        .from('job_vacancies')
        .select('id, title, status')
        .eq('company_id', userId)
        .order('created_at', { ascending: false })

      if (vacanciesError) throw vacanciesError
      setVacancies(vacanciesData || [])

      const vacancyIds = vacanciesData?.map(v => v.id) || []

      if (vacancyIds.length === 0) {
        setCandidates([])
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

      // Obtener información de postulantes
      const candidateIds = [...new Set(applicationsData?.map(app => app.candidate_id) || [])]
      
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, email')
        .in('user_id', candidateIds)

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
      }

      const formattedCandidates = applicationsData?.map((app: any) => {
        const vacancy = vacanciesData?.find(v => v.id === app.job_id)
        const profile = profiles?.find(p => p.user_id === app.candidate_id)
        
        return {
          id: app.id,
          candidate_name: profile?.full_name || profile?.email?.split('@')[0] || 'Postulante',
          candidate_email: profile?.email || '',
          ai_score: app.ai_score,
          match_percentage: app.match_percentage,
          job_title: vacancy?.title || 'Vacante eliminada',
          job_id: app.job_id,
          status: app.status,
          created_at: app.created_at,
          ai_analysis: app.ai_analysis
        }
      }) || []

      setCandidates(formattedCandidates)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCandidates = selectedVacancy === 'all' 
    ? candidates 
    : candidates.filter(c => c.job_id === selectedVacancy)

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

  const getRankBadge = (index: number) => {
    if (index === 0) return '🥇'
    if (index === 1) return '🥈'
    if (index === 2) return '🥉'
    return `#${index + 1}`
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <AccessibilityProvider>
      <DashboardLayout user={user}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🏆 Ranking de Postulantes IA - {userName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Los mejores postulantes ordenados por análisis de inteligencia artificial
            </p>
          </div>

          {/* Filtro de vacante */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filtrar por vacante
            </label>
            <select
              value={selectedVacancy}
              onChange={(e) => setSelectedVacancy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todas las vacantes ({candidates.length})</option>
              {vacancies.map((vacancy) => {
                const count = candidates.filter(c => c.job_id === vacancy.id).length
                return (
                  <option key={vacancy.id} value={vacancy.id}>
                    {vacancy.title} ({count})
                  </option>
                )
              })}
            </select>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
              <div className="text-3xl font-bold mb-2">{filteredCandidates.length}</div>
              <div className="text-blue-100">Postulantes analizados</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
              <div className="text-3xl font-bold mb-2">
                {filteredCandidates.filter(c => c.ai_score >= 80).length}
              </div>
              <div className="text-green-100">Con score excelente (≥80)</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
              <div className="text-3xl font-bold mb-2">
                {filteredCandidates.length > 0 
                  ? Math.round(filteredCandidates.reduce((sum, c) => sum + c.ai_score, 0) / filteredCandidates.length)
                  : 0}
              </div>
              <div className="text-purple-100">Score promedio</div>
            </div>
          </div>

          {filteredCandidates.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No hay postulantes analizados aún
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Los postulantes aparecerán aquí después de analizar sus CVs con IA
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCandidates.map((candidate, index) => (
                <Link
                  key={candidate.id}
                  href={`/dashboard/company/vacancies/${candidate.job_id}`}
                  className="block bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Ranking Badge */}
                    <div className="text-3xl font-bold">
                      {getRankBadge(index)}
                    </div>

                    {/* Info del postulante */}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                        {candidate.candidate_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {candidate.candidate_email}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-3">
                        💼 {candidate.job_title}
                      </p>

                      {/* Análisis IA */}
                      {candidate.ai_analysis && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          {candidate.ai_analysis.recommendation && (
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              <strong>💡 Recomendación:</strong> {candidate.ai_analysis.recommendation}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Scores */}
                    <div className="text-right">
                      <div className={`text-4xl font-bold ${getScoreColor(candidate.ai_score)}`}>
                        {candidate.ai_score}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Score IA
                      </div>
                      <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                        {candidate.match_percentage}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Match
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AccessibilityProvider>
  )
}
