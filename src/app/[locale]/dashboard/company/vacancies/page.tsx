'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { JobVacancy } from '@/types/database'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AccessibilityProvider from '@/components/Accesibilidad/AccessibilityProvider'
import JobVacancyForm from '@/components/jobs/JobVacancyForm'

export default function CompanyVacanciesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [vacancies, setVacancies] = useState<JobVacancy[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVacancy, setEditingVacancy] = useState<JobVacancy | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      router.push('/')
      return
    }

    // Verificar que el usuario sea empresa
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
    await fetchVacancies(session.user.id)
  }

  const fetchVacancies = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('job_vacancies')
        .select('*')
        .eq('company_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setVacancies(data || [])
    } catch (error) {
      console.error('Error fetching vacancies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveVacancy = async (vacancy: JobVacancy) => {
    setShowForm(false)
    setEditingVacancy(null)
    if (user) await fetchVacancies(user.id)
  }

  const handleEditVacancy = (vacancy: JobVacancy) => {
    setEditingVacancy(vacancy)
    setShowForm(true)
  }

  const handleDeleteVacancy = async (vacancyId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta vacante?')) return

    try {
      const { error } = await supabase
        .from('job_vacancies')
        .delete()
        .eq('id', vacancyId)

      if (error) throw error
      if (user) await fetchVacancies(user.id)
    } catch (error) {
      console.error('Error deleting vacancy:', error)
      alert('Error al eliminar la vacante')
    }
  }

  const handleChangeStatus = async (vacancyId: string, newStatus: 'open' | 'closed' | 'draft') => {
    try {
      const { error } = await supabase
        .from('job_vacancies')
        .update({ status: newStatus })
        .eq('id', vacancyId)

      if (error) throw error
      if (user) await fetchVacancies(user.id)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error al cambiar el estado')
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Mis Vacantes
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gestiona tus ofertas de empleo
              </p>
            </div>
            {!showForm && (
              <button
                onClick={() => {
                  setEditingVacancy(null)
                  setShowForm(true)
                }}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva Vacante
              </button>
            )}
          </div>

          {showForm ? (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {editingVacancy ? 'Editar Vacante' : 'Nueva Vacante'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingVacancy(null)
                  }}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  ✕ Cancelar
                </button>
              </div>
              <JobVacancyForm
                companyId={user.id}
                vacancy={editingVacancy}
                onSave={handleSaveVacancy}
                onCancel={() => {
                  setShowForm(false)
                  setEditingVacancy(null)
                }}
              />
            </div>
          ) : vacancies.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                No tienes vacantes publicadas
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Comienza creando tu primera oferta de empleo
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Crear Primera Vacante
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {vacancies.map((vacancy) => (
                <VacancyCard
                  key={vacancy.id}
                  vacancy={vacancy}
                  onEdit={handleEditVacancy}
                  onDelete={handleDeleteVacancy}
                  onChangeStatus={handleChangeStatus}
                />
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AccessibilityProvider>
  )
}

interface VacancyCardProps {
  vacancy: JobVacancy
  onEdit: (vacancy: JobVacancy) => void
  onDelete: (vacancyId: string) => void
  onChangeStatus: (vacancyId: string, status: 'open' | 'closed' | 'draft') => void
}

function VacancyCard({ vacancy, onEdit, onDelete, onChangeStatus }: VacancyCardProps) {
  const statusColors = {
    open: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    closed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  const statusLabels = {
    open: 'Abierta',
    closed: 'Cerrada',
    draft: 'Borrador'
  }

  const employmentTypeLabels: Record<string, string> = {
    'full-time': 'Tiempo Completo',
    'part-time': 'Medio Tiempo',
    'contract': 'Contrato',
    'freelance': 'Freelance'
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {vacancy.title}
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[vacancy.status]}`}>
              {statusLabels[vacancy.status]}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {vacancy.location}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {employmentTypeLabels[vacancy.employment_type]}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {vacancy.applications_count} postulaciones
            </span>
          </div>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
        {vacancy.description}
      </p>

      {vacancy.skills_required.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {vacancy.skills_required.slice(0, 6).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onEdit(vacancy)}
          className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        >
          Editar
        </button>
        
        {vacancy.status === 'draft' && (
          <button
            onClick={() => onChangeStatus(vacancy.id, 'open')}
            className="px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
          >
            Publicar
          </button>
        )}
        
        {vacancy.status === 'open' && (
          <button
            onClick={() => onChangeStatus(vacancy.id, 'closed')}
            className="px-4 py-2 text-sm font-medium text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        )}
        
        {vacancy.status === 'closed' && (
          <button
            onClick={() => onChangeStatus(vacancy.id, 'open')}
            className="px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
          >
            Reabrir
          </button>
        )}
        
        <button
          onClick={() => onDelete(vacancy.id)}
          className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-auto"
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}
