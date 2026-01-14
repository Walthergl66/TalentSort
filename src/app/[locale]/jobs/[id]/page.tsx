'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AccessibilityProvider from '@/components/Accesibilidad/AccessibilityProvider'

interface JobVacancy {
  id: string
  title: string
  description: string
  requirements: string[]
  skills_required: string[]
  experience_years: number
  salary_min?: number
  salary_max?: number
  location: string
  employment_type: string
  status: string
  company_id: string
  created_at: string
}

interface CandidateCV {
  id: string
  file_name: string
  created_at: string
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params?.id as string

  const [user, setUser] = useState<any>(null)
  const [vacancy, setVacancy] = useState<JobVacancy | null>(null)
  const [loading, setLoading] = useState(true)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [userCVs, setUserCVs] = useState<CandidateCV[]>([])
  const [selectedCVId, setSelectedCVId] = useState<string>('')
  const [applying, setApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [jobId])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user ?? null)
    await fetchVacancy()
    
    if (session?.user) {
      await checkIfApplied(session.user.id)
      await fetchUserCVs(session.user.id)
    }
  }

  const fetchVacancy = async () => {
    try {
      const { data, error } = await supabase
        .from('job_vacancies')
        .select('*')
        .eq('id', jobId)
        .single()

      if (error) throw error
      
      // Asegurar que requirements y skills_required sean arrays
      if (data) {
        const processedData = {
          ...data,
          requirements: Array.isArray(data.requirements) ? data.requirements : [],
          skills_required: Array.isArray(data.skills_required) ? data.skills_required : []
        }
        setVacancy(processedData)
      }
    } catch (error) {
      console.error('Error fetching vacancy:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkIfApplied = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('candidate_id', userId)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error
      setHasApplied(!!data)
    } catch (error) {
      console.error('Error checking application:', error)
    }
  }

  const fetchUserCVs = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_cvs')
        .select('id, file_name, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching CVs:', error)
        setUserCVs([])
        return
      }
      
      setUserCVs(data || [])
      if (data && data.length > 0) {
        setSelectedCVId(data[0].id)
      }
    } catch (error) {
      console.error('Error in fetchUserCVs:', error)
      setUserCVs([])
    }
  }

  const handleApply = async () => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (!selectedCVId) {
      alert('Por favor selecciona un CV')
      return
    }

    setApplying(true)

    try {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          candidate_id: user.id,
          cv_id: selectedCVId,
          status: 'pending'
        })

      if (error) throw error

      setHasApplied(true)
      setShowApplyModal(false)
      alert('¡Aplicación enviada exitosamente!')
    } catch (error: any) {
      console.error('Error applying:', error)
      alert('Error al enviar la aplicación: ' + error.message)
    } finally {
      setApplying(false)
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

  if (!vacancy) {
    return (
      <AccessibilityProvider>
        <DashboardLayout user={user}>
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Vacante no encontrada
            </h2>
          </div>
        </DashboardLayout>
      </AccessibilityProvider>
    )
  }

  const employmentTypeLabels: Record<string, string> = {
    'full-time': 'Tiempo Completo',
    'part-time': 'Medio Tiempo',
    'contract': 'Contrato',
    'freelance': 'Freelance'
  }

  return (
    <AccessibilityProvider>
      <DashboardLayout user={user}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.back()}
            className="mb-6 text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2"
          >
            ← Volver a vacantes
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {vacancy.title}
              </h1>

              <div className="flex flex-wrap gap-4 mb-6 text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{vacancy.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{employmentTypeLabels[vacancy.employment_type]}</span>
                </div>

                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    {vacancy.salary_min && vacancy.salary_max 
                      ? `$${vacancy.salary_min.toLocaleString()} - $${vacancy.salary_max.toLocaleString()}`
                      : 'Salario a convenir'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>{vacancy.experience_years} años de experiencia</span>
                </div>
              </div>

              {!user ? (
                <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-blue-800 dark:text-blue-300">
                    <a href="/auth/login" className="font-semibold underline">Inicia sesión</a> para aplicar a esta vacante
                  </p>
                </div>
              ) : hasApplied ? (
                <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-800 dark:text-green-300 font-semibold">
                    Ya aplicaste a esta vacante
                  </p>
                </div>
              ) : vacancy.status === 'open' ? (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="mb-8 w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Aplicar a esta vacante
                </button>
              ) : (
                <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300">
                    Esta vacante está cerrada
                  </p>
                </div>
              )}

              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Descripción
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {vacancy.description}
                  </p>
                </section>

                {Array.isArray(vacancy.requirements) && vacancy.requirements.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                      Requisitos
                    </h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                      {vacancy.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {Array.isArray(vacancy.skills_required) && vacancy.skills_required.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                      Habilidades Requeridas
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {vacancy.skills_required.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>

        {showApplyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Aplicar a {vacancy.title}
              </h3>

              {userCVs.length === 0 ? (
                <div className="mb-4">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    No tienes CVs cargados. Por favor sube un CV primero.
                  </p>
                  <button
                    onClick={() => router.push('/dashboard/cv/upload')}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Subir CV
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Selecciona tu CV
                    </label>
                    <select
                      value={selectedCVId}
                      onChange={(e) => setSelectedCVId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {userCVs.map((cv) => (
                        <option key={cv.id} value={cv.id}>
                          {cv.file_name} ({new Date(cv.created_at).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleApply}
                      disabled={applying}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
                    >
                      {applying ? 'Enviando...' : 'Enviar Aplicación'}
                    </button>
                    <button
                      onClick={() => setShowApplyModal(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </DashboardLayout>
    </AccessibilityProvider>
  )
}
