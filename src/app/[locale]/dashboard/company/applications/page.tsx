'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AccessibilityProvider from '@/components/Accesibilidad/AccessibilityProvider'
import Link from 'next/link'

interface Application {
  id: string
  job_id: string
  candidate_id: string
  status: string
  ai_score: number | null
  match_percentage: number | null
  created_at: string
  job_title: string
  candidate_name: string
  candidate_email: string
}

export default function AllApplicationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('recent')

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

  const fetchApplications = async (userId: string) => {
    try {
      // Obtener todas las vacantes de la empresa
      const { data: vacancies, error: vacanciesError } = await supabase
        .from('job_vacancies')
        .select('id, title')
        .eq('company_id', userId)

      if (vacanciesError) throw vacanciesError

      const vacancyIds = vacancies?.map(v => v.id) || []

      if (vacancyIds.length === 0) {
        setApplications([])
        setLoading(false)
        return
      }

      // Obtener todas las aplicaciones a esas vacantes
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('job_applications')
        .select('*')
        .in('job_id', vacancyIds)
        .order('created_at', { ascending: false })

      if (applicationsError) throw applicationsError

      // Obtener información de candidatos
      const candidateIds = [...new Set(applicationsData?.map(app => app.candidate_id) || [])]
      
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, email')
        .in('user_id', candidateIds)

      // Mapear con información de vacante y candidato
      const formattedApplications = applicationsData?.map((app: any) => {
        const vacancy = vacancies.find(v => v.id === app.job_id)
        const profile = profiles?.find(p => p.user_id === app.candidate_id)
        return {
          id: app.id,
          job_id: app.job_id,
          candidate_id: app.candidate_id,
          status: app.status,
          ai_score: app.ai_score,
          match_percentage: app.match_percentage,
          created_at: app.created_at,
          job_title: vacancy?.title || 'Vacante eliminada',
          candidate_name: profile?.full_name || 'Sin nombre',
          candidate_email: profile?.email || ''
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
    switch (sortBy) {
      case 'score':
        return (b.ai_score || 0) - (a.ai_score || 0)
      case 'match':
        return (b.match_percentage || 0) - (a.match_percentage || 0)
      case 'recent':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

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
    reviewing: 'Revisando',
    shortlisted: 'Preseleccionado',
    rejected: 'Rechazado',
    accepted: 'Aceptado'
  }

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    reviewed: applications.filter(a => a.status === 'reviewed' || a.status === 'reviewing').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  }

  return (
    <AccessibilityProvider>
      <DashboardLayout user={user}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Todas las Postulaciones
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {applications.length} postulaciones en total
            </p>
          </div>

          {/* Filtros */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todas ({statusCounts.all})</option>
                <option value="pending">Pendientes ({statusCounts.pending})</option>
                <option value="reviewed">Revisadas ({statusCounts.reviewed})</option>
                <option value="shortlisted">Preseleccionadas ({statusCounts.shortlisted})</option>
                <option value="accepted">Aceptadas ({statusCounts.accepted})</option>
                <option value="rejected">Rechazadas ({statusCounts.rejected})</option>
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
                <option value="recent">Más recientes</option>
                <option value="score">Mejor score IA</option>
                <option value="match">Mayor match</option>
              </select>
            </div>
          </div>

          {sortedApplications.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No hay postulaciones
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Las postulaciones aparecerán aquí cuando los candidatos apliquen a tus vacantes
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {sortedApplications.map((application) => (
                <Link
                  key={application.id}
                  href={`/dashboard/company/vacancies/${application.job_id}`}
                  className="block bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {application.candidate_name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[application.status]}`}>
                          {statusLabels[application.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        📧 {application.candidate_email}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                        💼 {application.job_title}
                      </p>
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
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {application.ai_score}/100
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {application.match_percentage}% match
                        </div>
                      </div>
                    )}
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
