'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AccessibilityProvider from '@/components/Accesibilidad/AccessibilityProvider'
import { LabelWithTooltip } from '@/components/common/Tooltip'

interface Application {
  id: string
  status: string
  ai_score: number | null
  match_percentage: number | null
  created_at: string
  job_title?: string
  company_name?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    bio: '',
    experience_years: 0,
    skills: [],
    education: [],
    certifications: [],
    languages: [],
    social_links: {
      linkedin: '',
      github: '',
      portfolio: '',
      twitter: ''
    },
    preferences: {
      job_type: 'full-time',
      remote_work: true,
      salary_expectation: '',
      availability: 'immediate',
      willing_to_relocate: false
    },
    profile_completeness: 0
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [newSkill, setNewSkill] = useState('')
  const [isCompany, setIsCompany] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [loadingApplications, setLoadingApplications] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/')
        return
      }

      setUser(session.user)
      await fetchProfile(session.user.id)
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single()
      if (profileData?.role === 'company') {
        setIsCompany(true)
      } else {
        await fetchApplications(session.user.id)
      }
    }

    checkAuth()
  }, [router])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
        return
      }

      if (data) {
        setProfile((prev: any) => ({ ...prev, ...data }))
      } else {
        const initialProfile = {
          user_id: userId,
          email: user?.email || '',
          full_name: user?.user_metadata?.full_name || '',
          profile_completeness: 10
        }
        
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert(initialProfile)
          .select()
          .single()

        if (createError) {
          console.error('Error creating profile:', createError)
        } else {
          setProfile((prev: any) => ({ ...prev, ...newProfile }))
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async (userId: string) => {
    setLoadingApplications(true)
    try {
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('job_applications')
        .select('id, status, ai_score, match_percentage, created_at, job_id')
        .eq('candidate_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError)
        return
      }

      if (!applicationsData || applicationsData.length === 0) {
        setApplications([])
        return
      }

      const jobIds = applicationsData.map(app => app.job_id).filter(Boolean)
      const { data: jobsData } = await supabase
        .from('job_vacancies')
        .select('id, title, company_id')
        .in('id', jobIds)

      const companyIds = (jobsData || []).map(job => job.company_id).filter(Boolean)
      const { data: companiesData } = await supabase
        .from('user_profiles')
        .select('user_id, company_name, full_name')
        .in('user_id', companyIds)

      const jobsMap = new Map((jobsData || []).map(job => [job.id, job]))
      const companiesMap = new Map((companiesData || []).map(company => [company.user_id, company]))

      const transformedApplications = applicationsData.map(app => {
        const job = jobsMap.get(app.job_id)
        const company = job ? companiesMap.get(job.company_id) : null
        
        return {
          ...app,
          job_title: job?.title || 'Sin título',
          company_name: company?.company_name || company?.full_name || 'Empresa no especificada'
        }
      })

      setApplications(transformedApplications)
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoadingApplications(false)
    }
  }

  const calculateCompleteness = (profileData: any) => {
    let completeness = 0
    const fields = [
      'full_name', 'phone', 'location', 'title', 'bio',
      'social_links.linkedin', 'preferences.salary_expectation'
    ]
    
    fields.forEach(field => {
      const keys = field.split('.')
      let value = profileData
      keys.forEach(key => {
        value = value?.[key]
      })
      if (value && value.toString().trim()) {
        completeness += 100 / fields.length
      }
    })

    if (profileData.skills?.length > 0) completeness += 15
    if (profileData.education?.length > 0) completeness += 10
    if (profileData.languages?.length > 0) completeness += 5

    return Math.min(100, Math.round(completeness))
  }

  const saveProfile = async () => {
    if (!user) return

    setSaving(true)
    try {
      const completeness = calculateCompleteness(profile)
      const profileData = {
        ...profile,
        profile_completeness: completeness,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('user_profiles')
        .upsert(profileData)

      if (error) {
        console.error('Error saving profile:', error)
        alert('Error al guardar el perfil')
        return
      }

      setProfile(profileData)
      alert('Perfil guardado exitosamente')
    } catch (error) {
      console.error('Error:', error)
      alert('Error al guardar el perfil')
    } finally {
      setSaving(false)
    }
  }

  const addSkill = () => {
    if (!newSkill.trim()) return
    
    setProfile((prev: any) => ({
      ...prev,
      skills: [...(prev.skills || []), newSkill.trim()]
    }))
    setNewSkill('')
  }

  const removeSkill = (index: number) => {
    setProfile((prev: any) => ({
      ...prev,
      skills: prev.skills.filter((_: any, i: number) => i !== index)
    }))
  }

  const addEducation = () => {
    setProfile((prev: any) => ({
      ...prev,
      education: [
        ...(prev.education || []),
        {
          institution: '',
          degree: '',
          field: '',
          year_start: '',
          year_end: '',
          current: false
        }
      ]
    }))
  }

  const updateEducation = (index: number, field: string, value: any) => {
    setProfile((prev: any) => ({
      ...prev,
      education: prev.education.map((edu: any, i: number) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }))
  }

  const removeEducation = (index: number) => {
    setProfile((prev: any) => ({
      ...prev,
      education: prev.education.filter((_: any, i: number) => i !== index)
    }))
  }

  const addLanguage = () => {
    setProfile((prev: any) => ({
      ...prev,
      languages: [
        ...(prev.languages || []),
        { language: '', level: 'intermediate' }
      ]
    }))
  }

  const updateLanguage = (index: number, field: string, value: string) => {
    setProfile((prev: any) => ({
      ...prev,
      languages: prev.languages.map((lang: any, i: number) => 
        i === index ? { ...lang, [field]: value } : lang
      )
    }))
  }

  const removeLanguage = (index: number) => {
    setProfile((prev: any) => ({
      ...prev,
      languages: prev.languages.filter((_: any, i: number) => i !== index)
    }))
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    shortlisted: 'bg-purple-100 text-purple-800',
    rejected: 'bg-red-100 text-red-800',
    accepted: 'bg-green-100 text-green-800'
  }

  const statusLabels: Record<string, string> = {
    pending: 'Pendiente',
    reviewed: 'En Revisión',
    shortlisted: 'Preseleccionado',
    rejected: 'Rechazado',
    accepted: 'Aceptado'
  }

  const candidateTabs = [
    { id: 'overview', name: 'Resumen', icon: '📊' },
    { id: 'personal', name: 'Información Personal', icon: '👤' },
    { id: 'professional', name: 'Experiencia', icon: '💼' },
    { id: 'education', name: 'Educación', icon: '🎓' },
    { id: 'skills', name: 'Habilidades', icon: '🎯' },
    { id: 'preferences', name: 'Preferencias', icon: '⚙️' }
  ]

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

  // Vista para Empresas
  if (isCompany) {
    return (
      <AccessibilityProvider>
        <DashboardLayout user={user}>
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Información de la Empresa</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Completa los datos de tu empresa para mejorar tu presencia ante los candidatos
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <LabelWithTooltip label="Nombre de la Empresa" tooltip="Nombre legal o comercial de la empresa" required htmlFor="company_name" />
                  <input
                    id="company_name"
                    type="text"
                    value={profile.full_name || ''}
                    onChange={(e) => setProfile((prev: any) => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: TalentSort S.A. de C.V."
                  />
                </div>
                <div>
                  <LabelWithTooltip label="Correo de contacto" tooltip="Email principal de la empresa" htmlFor="email" />
                  <input
                    id="email"
                    type="email"
                    value={profile.email || ''}
                    onChange={(e) => setProfile((prev: any) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="empresa@email.com"
                  />
                </div>
                <div>
                  <LabelWithTooltip label="Teléfono de empresa" tooltip="Número de contacto empresarial" htmlFor="phone" />
                  <input
                    id="phone"
                    type="tel"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile((prev: any) => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+52 123 456 7890"
                  />
                </div>
                <div>
                  <LabelWithTooltip label="Ubicación" tooltip="Ciudad y país donde opera la empresa" htmlFor="location" />
                  <input
                    id="location"
                    type="text"
                    value={profile.location || ''}
                    onChange={(e) => setProfile((prev: any) => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ciudad, País"
                  />
                </div>
                <div>
                  <LabelWithTooltip label="Sitio Web" tooltip="Página web de la empresa" htmlFor="website" />
                  <input
                    id="website"
                    type="url"
                    value={profile.social_links?.portfolio || ''}
                    onChange={(e) => setProfile((prev: any) => ({ 
                      ...prev, 
                      social_links: { ...prev.social_links, portfolio: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://www.empresa.com"
                  />
                </div>
                <div>
                  <LabelWithTooltip label="LinkedIn" tooltip="Perfil de LinkedIn de la empresa" htmlFor="linkedin" />
                  <input
                    id="linkedin"
                    type="url"
                    value={profile.social_links?.linkedin || ''}
                    onChange={(e) => setProfile((prev: any) => ({ 
                      ...prev, 
                      social_links: { ...prev.social_links, linkedin: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>
                <div className="md:col-span-2">
                  <LabelWithTooltip label="Descripción de la empresa" tooltip="Breve descripción, misión y valores" htmlFor="bio" />
                  <textarea
                    id="bio"
                    value={profile.bio || ''}
                    onChange={(e) => setProfile((prev: any) => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe la misión, visión y valores de tu empresa..."
                  />
                </div>
              </div>
              <div className="border-t border-gray-200 px-6 py-4 mt-6">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </AccessibilityProvider>
    )
  }

  // Vista para Candidatos
  return (
    <AccessibilityProvider>
      <DashboardLayout user={user}>
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mi Perfil Profesional</h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona tu información profesional y mejora tu visibilidad
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <button
                onClick={() => router.push('/dashboard/profile/preview')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Vista Previa
              </button>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>

          {/* Tabs de navegación */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
              {candidateTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Contenido de las tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Tab: Resumen */}
            {activeTab === 'overview' && (
              <div className="p-6 space-y-6">
                {/* Card de perfil */}
                <div className="flex items-start space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-white">
                      {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900">
                      {profile.full_name || 'Sin nombre'}
                    </h2>
                    <p className="text-gray-600">{profile.title || 'Título no especificado'}</p>
                    <div className="flex items-center mt-2 text-sm text-gray-500 space-x-4">
                      {profile.location && (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {profile.location}
                        </span>
                      )}
                      {profile.email && (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {profile.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-1">Perfil completado</div>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${profile.profile_completeness || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {profile.profile_completeness || 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Resumen rápido */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{profile.skills?.length || 0}</div>
                    <div className="text-sm text-gray-600">Habilidades</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{profile.experience_years || 0}</div>
                    <div className="text-sm text-gray-600">Años de experiencia</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{profile.languages?.length || 0}</div>
                    <div className="text-sm text-gray-600">Idiomas</div>
                  </div>
                </div>

                {/* Mis Solicitudes Recientes */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Mis Postulaciones Recientes</h3>
                    <button
                      onClick={() => router.push('/dashboard/applications')}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Ver todas →
                    </button>
                  </div>
                  
                  {loadingApplications ? (
                    <div className="animate-pulse space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                      ))}
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-gray-600 mb-3">No tienes postulaciones aún</p>
                      <button
                        onClick={() => router.push('/jobs')}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Explorar empleos →
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {applications.map((app) => (
                        <div key={app.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <div>
                            <h4 className="font-medium text-gray-900">{app.job_title}</h4>
                            <p className="text-sm text-gray-500">{app.company_name}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            {app.match_percentage && (
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900">
                                  {app.match_percentage}% match
                                </div>
                              </div>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[app.status] || 'bg-gray-100 text-gray-800'}`}>
                              {statusLabels[app.status] || app.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Información Personal */}
            {activeTab === 'personal' && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <LabelWithTooltip label="Nombre completo" tooltip="Tu nombre como aparecerá en tu perfil" required htmlFor="full_name" />
                    <input
                      id="full_name"
                      type="text"
                      value={profile.full_name || ''}
                      onChange={(e) => setProfile((prev: any) => ({ ...prev, full_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div>
                    <LabelWithTooltip label="Título profesional" tooltip="Tu cargo o especialización" htmlFor="title" />
                    <input
                      id="title"
                      type="text"
                      value={profile.title || ''}
                      onChange={(e) => setProfile((prev: any) => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Desarrollador Full Stack"
                    />
                  </div>
                  <div>
                    <LabelWithTooltip label="Correo electrónico" tooltip="Tu correo de contacto" htmlFor="email" />
                    <input
                      id="email"
                      type="email"
                      value={profile.email || ''}
                      onChange={(e) => setProfile((prev: any) => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  <div>
                    <LabelWithTooltip label="Teléfono" tooltip="Número de contacto" htmlFor="phone" />
                    <input
                      id="phone"
                      type="tel"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile((prev: any) => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+52 123 456 7890"
                    />
                  </div>
                  <div>
                    <LabelWithTooltip label="Ubicación" tooltip="Ciudad y país de residencia" htmlFor="location" />
                    <input
                      id="location"
                      type="text"
                      value={profile.location || ''}
                      onChange={(e) => setProfile((prev: any) => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ciudad de México, México"
                    />
                  </div>
                  <div>
                    <LabelWithTooltip label="Años de experiencia" tooltip="Experiencia laboral total" htmlFor="experience_years" />
                    <input
                      id="experience_years"
                      type="number"
                      min="0"
                      max="50"
                      value={profile.experience_years || 0}
                      onChange={(e) => setProfile((prev: any) => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <LabelWithTooltip label="Biografía / Resumen profesional" tooltip="Una breve descripción sobre ti" htmlFor="bio" />
                    <textarea
                      id="bio"
                      value={profile.bio || ''}
                      onChange={(e) => setProfile((prev: any) => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe tu experiencia, logros y lo que te apasiona..."
                    />
                  </div>
                </div>

                {/* Redes Sociales */}
                <div className="mt-8">
                  <h3 className="text-md font-semibold text-gray-900 mb-4">Redes Sociales y Portafolio</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <LabelWithTooltip label="LinkedIn" tooltip="URL de tu perfil de LinkedIn" htmlFor="linkedin" />
                      <input
                        id="linkedin"
                        type="url"
                        value={profile.social_links?.linkedin || ''}
                        onChange={(e) => setProfile((prev: any) => ({ 
                          ...prev, 
                          social_links: { ...prev.social_links, linkedin: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    <div>
                      <LabelWithTooltip label="GitHub" tooltip="URL de tu perfil de GitHub" htmlFor="github" />
                      <input
                        id="github"
                        type="url"
                        value={profile.social_links?.github || ''}
                        onChange={(e) => setProfile((prev: any) => ({ 
                          ...prev, 
                          social_links: { ...prev.social_links, github: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://github.com/..."
                      />
                    </div>
                    <div>
                      <LabelWithTooltip label="Portafolio" tooltip="URL de tu sitio web o portafolio" htmlFor="portfolio" />
                      <input
                        id="portfolio"
                        type="url"
                        value={profile.social_links?.portfolio || ''}
                        onChange={(e) => setProfile((prev: any) => ({ 
                          ...prev, 
                          social_links: { ...prev.social_links, portfolio: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://miportafolio.com"
                      />
                    </div>
                    <div>
                      <LabelWithTooltip label="Twitter/X" tooltip="URL de tu perfil de Twitter" htmlFor="twitter" />
                      <input
                        id="twitter"
                        type="url"
                        value={profile.social_links?.twitter || ''}
                        onChange={(e) => setProfile((prev: any) => ({ 
                          ...prev, 
                          social_links: { ...prev.social_links, twitter: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Educación */}
            {activeTab === 'education' && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Educación</h2>
                  <button
                    onClick={addEducation}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    + Agregar Educación
                  </button>
                </div>

                {profile.education?.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No has agregado educación aún</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile.education?.map((edu: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Institución</label>
                            <input
                              type="text"
                              value={edu.institution || ''}
                              onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Universidad o institución"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <input
                              type="text"
                              value={edu.degree || ''}
                              onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Licenciatura, Maestría, etc."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Campo de estudio</label>
                            <input
                              type="text"
                              value={edu.field || ''}
                              onChange={(e) => updateEducation(index, 'field', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Ingeniería en Sistemas, etc."
                            />
                          </div>
                          <div className="flex space-x-4">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Año inicio</label>
                              <input
                                type="text"
                                value={edu.year_start || ''}
                                onChange={(e) => updateEducation(index, 'year_start', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="2018"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Año fin</label>
                              <input
                                type="text"
                                value={edu.year_end || ''}
                                onChange={(e) => updateEducation(index, 'year_end', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="2022"
                                disabled={edu.current}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <label className="flex items-center text-sm text-gray-600">
                            <input
                              type="checkbox"
                              checked={edu.current || false}
                              onChange={(e) => updateEducation(index, 'current', e.target.checked)}
                              className="mr-2"
                            />
                            Actualmente estudiando aquí
                          </label>
                          <button
                            onClick={() => removeEducation(index)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Idiomas */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-semibold text-gray-900">Idiomas</h3>
                    <button
                      onClick={addLanguage}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      + Agregar Idioma
                    </button>
                  </div>

                  {profile.languages?.length === 0 ? (
                    <div className="text-center py-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 text-sm">No has agregado idiomas</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {profile.languages?.map((lang: any, index: number) => (
                        <div key={index} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                          <input
                            type="text"
                            value={lang.language || ''}
                            onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Inglés"
                          />
                          <select
                            value={lang.level || 'intermediate'}
                            onChange={(e) => updateLanguage(index, 'level', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="basic">Básico</option>
                            <option value="intermediate">Intermedio</option>
                            <option value="advanced">Avanzado</option>
                            <option value="native">Nativo</option>
                          </select>
                          <button
                            onClick={() => removeLanguage(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Habilidades */}
            {activeTab === 'skills' && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Habilidades</h2>
                
                {/* Agregar nueva habilidad */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Escribe una habilidad y presiona Enter o el botón"
                  />
                  <button
                    onClick={addSkill}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Agregar
                  </button>
                </div>

                {/* Lista de habilidades */}
                <div className="flex flex-wrap gap-2">
                  {profile.skills?.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        onClick={() => removeSkill(index)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {profile.skills?.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">No has agregado habilidades aún</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Agrega habilidades técnicas y blandas relevantes
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Preferencias */}
            {activeTab === 'preferences' && (
              <div className="p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Preferencias Laborales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de empleo</label>
                    <select
                      value={profile.preferences?.job_type || 'full-time'}
                      onChange={(e) => setProfile((prev: any) => ({ 
                        ...prev, 
                        preferences: { ...prev.preferences, job_type: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="full-time">Tiempo completo</option>
                      <option value="part-time">Medio tiempo</option>
                      <option value="contract">Contrato</option>
                      <option value="freelance">Freelance</option>
                      <option value="internship">Pasantía</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidad</label>
                    <select
                      value={profile.preferences?.availability || 'immediate'}
                      onChange={(e) => setProfile((prev: any) => ({ 
                        ...prev, 
                        preferences: { ...prev.preferences, availability: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="immediate">Inmediata</option>
                      <option value="2-weeks">2 semanas</option>
                      <option value="1-month">1 mes</option>
                      <option value="negotiable">Negociable</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expectativa salarial</label>
                    <input
                      type="text"
                      value={profile.preferences?.salary_expectation || ''}
                      onChange={(e) => setProfile((prev: any) => ({ 
                        ...prev, 
                        preferences: { ...prev.preferences, salary_expectation: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="$30,000 - $40,000 MXN"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.preferences?.remote_work || false}
                        onChange={(e) => setProfile((prev: any) => ({ 
                          ...prev, 
                          preferences: { ...prev.preferences, remote_work: e.target.checked }
                        }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Trabajo remoto</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.preferences?.willing_to_relocate || false}
                        onChange={(e) => setProfile((prev: any) => ({ 
                          ...prev, 
                          preferences: { ...prev.preferences, willing_to_relocate: e.target.checked }
                        }))}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Dispuesto a reubicarse</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Experiencia Profesional */}
            {activeTab === 'professional' && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Experiencia Profesional</h2>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-yellow-800">Tu experiencia se extrae de tu CV</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Para actualizar tu experiencia profesional, sube un CV actualizado en la sección &quot;Mi CV&quot;.
                        Nuestro sistema de IA extraerá automáticamente tu experiencia laboral.
                      </p>
                      <button
                        onClick={() => router.push('/dashboard/cv')}
                        className="mt-3 text-sm text-yellow-800 font-medium hover:text-yellow-900"
                      >
                        Ir a Mi CV →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </AccessibilityProvider>
  )
}
