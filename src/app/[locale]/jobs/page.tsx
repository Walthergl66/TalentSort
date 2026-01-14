'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { JobVacancy } from '@/types/database'
import Link from 'next/link'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AccessibilityProvider from '@/components/Accesibilidad/AccessibilityProvider'

export default function JobsPage() {
  const [user, setUser] = useState<any>(null)
  const [vacancies, setVacancies] = useState<JobVacancy[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    employment_type: '' as '' | 'full-time' | 'part-time' | 'contract' | 'freelance'
  })

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (!loading) fetchVacancies()
  }, [filters])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user ?? null)
    await fetchVacancies()
  }

  const fetchVacancies = async () => {
    try {
      let query = supabase
        .from('job_vacancies')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }

      if (filters.employment_type) {
        query = query.eq('employment_type', filters.employment_type)
      }

      const { data, error } = await query

      if (error) throw error
      setVacancies(data || [])
    } catch (error) {
      console.error('Error fetching vacancies:', error)
    } finally {
      setLoading(false)
    }
  }

  const employmentTypeLabels = {
    'full-time': 'Tiempo Completo',
    'part-time': 'Medio Tiempo',
    'contract': 'Contrato',
    'freelance': 'Freelance'
  }

  return (
    <AccessibilityProvider>
      <DashboardLayout user={user}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Buscar Empleos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Encuentra tu próximo trabajo entre {vacancies.length} vacantes disponibles
            </p>
          </div>

          {/* Filtros */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buscar
                </label>
                <input
                  type="text"
                  placeholder="Título o palabra clave..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  placeholder="Ciudad o región..."
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Empleo
                </label>
                <select
                  value={filters.employment_type}
                  onChange={(e) => setFilters({ ...filters, employment_type: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="">Todos</option>
                  <option value="full-time">Tiempo Completo</option>
                  <option value="part-time">Medio Tiempo</option>
                  <option value="contract">Contrato</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Vacantes */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando vacantes...</p>
            </div>
          ) : vacancies.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No se encontraron vacantes</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Intenta cambiar tus filtros de búsqueda
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {vacancies.map((vacancy) => (
                <JobVacancyCard key={vacancy.id} vacancy={vacancy} />
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AccessibilityProvider>
  )
}

interface JobVacancyCardProps {
  vacancy: JobVacancy
}

function JobVacancyCard({ vacancy }: JobVacancyCardProps) {
  const employmentTypeLabels: Record<string, string> = {
    'full-time': 'Tiempo Completo',
    'part-time': 'Medio Tiempo',
    'contract': 'Contrato',
    'freelance': 'Freelance'
  }

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Salario a convenir'
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `Desde $${min.toLocaleString()}`
    return `Hasta $${max?.toLocaleString()}`
  }

  return (
    <Link href={`/jobs/${vacancy.id}`}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {vacancy.title}
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {employmentTypeLabels[vacancy.employment_type] || vacancy.employment_type}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                📍 {vacancy.location}
              </span>
              {vacancy.experience_years_min > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  {vacancy.experience_years_min}+ años experiencia
                </span>
              )}
            </div>
          </div>
          <div className="text-right ml-4">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatSalary(vacancy.salary_min ?? null, vacancy.salary_max ?? null)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(vacancy.created_at).toLocaleDateString('es', { 
                day: 'numeric', 
                month: 'short' 
              })}
            </p>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {vacancy.description}
        </p>

        {vacancy.skills_required.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {vacancy.skills_required.slice(0, 5).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
              >
                {skill}
              </span>
            ))}
            {vacancy.skills_required.length > 5 && (
              <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                +{vacancy.skills_required.length - 5} más
              </span>
            )}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm">
            Ver detalles y postular →
          </button>
        </div>
      </div>
    </Link>
  )
}
