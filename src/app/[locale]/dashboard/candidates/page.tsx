'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AccessibilityProvider from '@/components/Accesibilidad/AccessibilityProvider'
import SearchBar from '@/components/SearchBar'

export default function CandidatesPage() {
  const router = useRouter()
  const t = useTranslations('dashboard.candidatesPage')
  const tp = useTranslations('profile')
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('')
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [allSkills, setAllSkills] = useState<string[]>([])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/')
        return
      }

      setUser(session.user)

      // Obtener el perfil del usuario para saber su rol
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single()

      if (profile) {
        setUserRole(profile.role)
        // Llamar fetchCandidates con el rol obtenido
        await fetchCandidatesWithRole(profile.role)
      }
    }

    checkAuth()
  }, [router])

  const fetchCandidatesWithRole = async (role: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase.from('candidate_cvs').select('*')

      // Si es empresa, mostrar TODOS los CVs
      // Si es candidato, mostrar solo sus propios CVs
      if (role !== 'company') {
        query = query.eq('user_id', user.id)
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      if (searchTerm) {
        query = query.or(`candidate_name.ilike.%${searchTerm}%,skills.cs.{${searchTerm}}`)
      }

      query = query.order(sortBy, { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Error fetching candidates:', error)
        return
      }

      setCandidates(data || [])
      
      // Extraer todas las habilidades únicas para sugerencias
      const skillsSet = new Set<string>()
      data?.forEach(candidate => {
        if (Array.isArray(candidate.skills)) {
          candidate.skills.forEach((skill: string) => skillsSet.add(skill))
        }
      })
      setAllSkills(Array.from(skillsSet))
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCandidates = async () => {
    if (userRole) {
      await fetchCandidatesWithRole(userRole)
    }
  }

  useEffect(() => {
    if (user && userRole) {
      fetchCandidates()
    }
  }, [searchTerm, statusFilter, sortBy, user, userRole])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processed': return 'bg-blue-100 text-blue-800'
      case 'reviewed': return 'bg-purple-100 text-purple-800'
      case 'shortlisted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const updateCandidateStatus = async (candidateId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('candidate_cvs')
        .update({ status: newStatus })
        .eq('id', candidateId)

      if (error) {
        console.error('Error updating status:', error)
        return
      }

      // Actualizar el estado local
      setCandidates(prev => 
        prev.map(candidate => 
          candidate.id === candidateId 
            ? { ...candidate, status: newStatus }
            : candidate
        )
      )
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (loading) {
    return (
      <AccessibilityProvider>
        <DashboardLayout user={user}>
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </DashboardLayout>
      </AccessibilityProvider>
    )
  }

  return (
    <AccessibilityProvider>
      <DashboardLayout user={user}>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {userRole === 'company' ? '🔍 Buscar Talentos' : t('title')}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {userRole === 'company' 
                  ? 'Explora y descubre los mejores talentos disponibles'
                  : t('subtitle')
                }
              </p>
            </div>
            {userRole !== 'company' && (
              <button
                onClick={() => router.push('/dashboard/candidates/upload')}
                className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {t('uploadNewCv')}
              </button>
            )}
          </div>

          {/* Filtros y búsqueda mejorados */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="space-y-4">
              {/* Barra de búsqueda principal */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('searchLabel')}
                </label>
                <SearchBar
                  onSearch={(query) => setSearchTerm(query)}
                  placeholder={t('searchPlaceholder')}
                  suggestions={allSkills}
                  variant="default"
                  showSuggestions={true}
                />
              </div>

              {/* Filtros adicionales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="pending">Pendiente</option>
                    <option value="processed">Procesado</option>
                    <option value="reviewed">Revisado</option>
                    <option value="shortlisted">Lista corta</option>
                    <option value="rejected">Rechazado</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ordenar por
                  </label>
                  <select
                    id="sort-by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="created_at">Fecha de carga</option>
                    <option value="ai_score">Puntuación IA</option>
                    <option value="candidate_name">Nombre</option>
                    <option value="experience_years">Años experiencia</option>
                  </select>
                </div>
              </div>

              {/* Resumen de filtros activos */}
              {(searchTerm || statusFilter !== 'all') && (
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Filtros activos:</span>
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full">
                      {searchTerm}
                      <button
                        onClick={() => setSearchTerm('')}
                        className="hover:text-blue-900 dark:hover:text-blue-100"
                        aria-label="Limpiar búsqueda"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-sm rounded-full">
                      {statusFilter}
                      <button
                        onClick={() => setStatusFilter('all')}
                        className="hover:text-purple-900 dark:hover:text-purple-100"
                        aria-label="Limpiar filtro de estado"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Lista de candidatos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {candidates.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Candidato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Experiencia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Puntuación IA
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Habilidades
                      </th>
                      {userRole !== 'company' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Acciones
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {candidates.map((candidate) => (
                      <tr key={candidate.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                                  {candidate.candidate_name?.charAt(0) || 'C'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {candidate.candidate_name || 'Sin nombre'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {candidate.candidate_email || 'Sin email'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {candidate.experience_years} años
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {candidate.current_position || 'Sin posición actual'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-semibold ${getScoreColor(candidate.ai_score)}`}>
                            {candidate.ai_score}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(candidate.status)}`}>
                            {candidate.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {(candidate.skills || []).slice(0, 3).map((skill: string, index: number) => (
                              <span key={index} className="inline-flex px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                {skill}
                              </span>
                            ))}
                            {(candidate.skills || []).length > 3 && (
                              <span className="inline-flex px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                +{(candidate.skills || []).length - 3} más
                              </span>
                            )}
                          </div>
                        </td>
                        {userRole !== 'company' && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <select
                                value={candidate.status}
                                onChange={(e) => updateCandidateStatus(candidate.id, e.target.value)}
                                className="text-xs border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="pending">Pendiente</option>
                                <option value="processed">Procesado</option>
                                <option value="reviewed">Revisado</option>
                                <option value="shortlisted">Lista corta</option>
                                <option value="rejected">Rechazado</option>
                              </select>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {userRole === 'company' 
                    ? 'No hay talentos disponibles en este momento'
                    : 'No se encontraron candidatos'
                  }
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {userRole === 'company'
                    ? (searchTerm || statusFilter !== 'all' 
                        ? 'Intenta ajustar los filtros de búsqueda'
                        : 'Aún no hay CVs cargados en el sistema'
                      )
                    : (searchTerm || statusFilter !== 'all' 
                        ? 'Intenta ajustar los filtros de búsqueda'
                        : 'Sube tu primer CV para comenzar'
                      )
                  }
                </p>
                {userRole !== 'company' && (
                  <button
                    onClick={() => router.push('/dashboard/candidates/upload')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Subir CV
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </AccessibilityProvider>
  )
}