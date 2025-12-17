'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AccessibilityProvider from '@/components/Accesibilidad/AccessibilityProvider'
import { LabelWithTooltip } from '@/components/common/Tooltip'

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
  const [activeTab, setActiveTab] = useState('personal')
  const [newSkill, setNewSkill] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/')
        return
      }

      setUser(session.user)
      await fetchProfile(session.user.id)
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

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching profile:', error)
        return
      }

      if (data) {
        setProfile((prev: any) => ({ ...prev, ...data }))
      } else {
        // Crear perfil inicial si no existe
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

  const tabs = [
    { id: 'personal', name: 'Información Personal', icon: '👤' },
    { id: 'professional', name: 'Experiencia Profesional', icon: '💼' },
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

  return (
    <AccessibilityProvider>
      <DashboardLayout user={user}>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Mi Perfil Profesional
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona tu información profesional y mejora tu visibilidad
              </p>
            </div>
            
            {/* Completeness indicator */}
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    Completitud del perfil
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        profile.profile_completeness >= 80 ? 'bg-green-500' :
                        profile.profile_completeness >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${profile.profile_completeness}%` }}
                    ></div>
                  </div>
                </div>
                <div className={`text-lg font-bold ${
                  profile.profile_completeness >= 80 ? 'text-green-600' :
                  profile.profile_completeness >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {profile.profile_completeness}%
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
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

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {activeTab === 'personal' && (
              <div className="p-6 space-y-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Información Personal
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <LabelWithTooltip
                      label="Nombre Completo"
                      tooltip="Tu nombre completo tal como aparece en documentos oficiales"
                      required
                      htmlFor="full_name"
                    />
                    <input
                      id="full_name"
                      type="text"
                      value={profile.full_name || ''}
                      onChange={(e) => setProfile((prev: any) => ({ ...prev, full_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <LabelWithTooltip
                      label="Email"
                      tooltip="Tu correo electrónico principal de contacto. Los reclutadores te contactarán a este email."
                      htmlFor="email"
                    />
                    <input
                      id="email"
                      type="email"
                      value={profile.email || ''}
                      onChange={(e) => setProfile((prev: any) => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <LabelWithTooltip
                      label="Teléfono"
                      tooltip="Tu número de teléfono con código de país. Ejemplo: +52 123 456 7890"
                      htmlFor="phone"
                    />
                    <input
                      id="phone"
                      type="tel"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile((prev: any) => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div>
                    <LabelWithTooltip
                      label="Ubicación"
                      tooltip="Tu ciudad y país actual. Esto ayuda a encontrar oportunidades cercanas."
                      htmlFor="location"
                    />
                    <input
                      id="location"
                      type="text"
                      value={profile.location || ''}
                      onChange={(e) => setProfile((prev: any) => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ciudad, País"
                    />
                  </div>
                </div>

                <div>
                  <LabelWithTooltip
                    label="Título Profesional"
                    tooltip="Tu cargo o posición profesional actual. Ejemplo: Desarrollador Full Stack Senior, Ingeniero de Software"
                    htmlFor="title"
                  />
                  <input
                    id="title"
                    type="text"
                    value={profile.title || ''}
                    onChange={(e) => setProfile((prev: any) => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Desarrollador Full Stack Senior"
                  />
                </div>

                <div>
                  <LabelWithTooltip
                    label="Biografía Profesional"
                    tooltip="Resume tu experiencia, logros principales y objetivos profesionales en 2-3 párrafos breves."
                    htmlFor="bio"
                  />
                  <textarea
                    id="bio"
                    value={profile.bio || ''}
                    onChange={(e) => setProfile((prev: any) => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe tu experiencia, logros y objetivos profesionales..."
                  />
                </div>

                {/* Social Links */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">
                    Enlaces Profesionales
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <LabelWithTooltip
                        label="LinkedIn"
                        tooltip="Tu perfil profesional de LinkedIn. Aumenta tu visibilidad ante reclutadores."
                        htmlFor="linkedin"
                      />
                      <input
                        id="linkedin"
                        type="url"
                        value={profile.social_links?.linkedin || ''}
                        onChange={(e) => setProfile((prev: any) => ({
                          ...prev,
                          social_links: { ...prev.social_links, linkedin: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://linkedin.com/in/tuperfil"
                      />
                    </div>
                    <div>
                      <LabelWithTooltip
                        label="GitHub"
                        tooltip="Tu perfil de GitHub. Esencial para desarrolladores - muestra tus proyectos y contribuciones."
                        htmlFor="github"
                      />
                      <input
                        id="github"
                        type="url"
                        value={profile.social_links?.github || ''}
                        onChange={(e) => setProfile((prev: any) => ({
                          ...prev,
                          social_links: { ...prev.social_links, github: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://github.com/tuusuario"
                      />
                    </div>
                    <div>
                      <LabelWithTooltip
                        label="Portfolio"
                        tooltip="Tu sitio web personal o portfolio profesional donde muestras tus trabajos y proyectos."
                        htmlFor="portfolio"
                      />
                      <input
                        id="portfolio"
                        type="url"
                        value={profile.social_links?.portfolio || ''}
                        onChange={(e) => setProfile((prev: any) => ({
                          ...prev,
                          social_links: { ...prev.social_links, portfolio: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://tuportfolio.com"
                      />
                    </div>
                    <div>
                      <LabelWithTooltip
                        label="Twitter"
                        tooltip="Tu cuenta profesional de Twitter/X (opcional). Útil para networking profesional."
                        htmlFor="twitter"
                      />
                      <input
                        id="twitter"
                        type="url"
                        value={profile.social_links?.twitter || ''}
                        onChange={(e) => setProfile((prev: any) => ({
                          ...prev,
                          social_links: { ...prev.social_links, twitter: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://twitter.com/tuusuario"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'professional' && (
              <div className="p-6 space-y-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Experiencia Profesional
                </h3>
                
                <div>
                  <LabelWithTooltip
                    label="Años de Experiencia"
                    tooltip="Selecciona tu total de años de experiencia profesional. Esto ayuda a las empresas a evaluar tu nivel de seniority."
                    htmlFor="experience_years"
                  />
                  <select
                    id="experience_years"
                    value={profile.experience_years || 0}
                    onChange={(e) => setProfile((prev: any) => ({ ...prev, experience_years: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0}>Sin experiencia profesional</option>
                    <option value={1}>Menos de 1 año</option>
                    <option value={2}>1-2 años</option>
                    <option value={3}>2-3 años</option>
                    <option value={5}>3-5 años</option>
                    <option value={8}>5-8 años</option>
                    <option value={10}>8-10 años</option>
                    <option value={15}>Más de 10 años</option>
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">
                        💼 Próxima actualización
                      </h4>
                      <p className="text-sm text-blue-800 mt-1">
                        Pronto podrás agregar tu historial laboral completo, incluyendo empresas, cargos, 
                        responsabilidades y logros específicos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'education' && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Educación
                  </h3>
                  <button
                    onClick={addEducation}
                    className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
                  >
                    + Agregar
                  </button>
                </div>

                <div className="space-y-4">
                  {(profile.education || []).map((edu: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium text-gray-900">Educación #{index + 1}</h4>
                        <button
                          onClick={() => removeEducation(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Institución
                          </label>
                          <input
                            type="text"
                            value={edu.institution || ''}
                            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Universidad/Instituto"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Título/Grado
                          </label>
                          <input
                            type="text"
                            value={edu.degree || ''}
                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Licenciatura, Máster, etc."
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Campo de Estudio
                          </label>
                          <input
                            type="text"
                            value={edu.field || ''}
                            onChange={(e) => updateEducation(index, 'field', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ingeniería, Administración, etc."
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Año Inicio
                            </label>
                            <input
                              type="number"
                              value={edu.year_start || ''}
                              onChange={(e) => updateEducation(index, 'year_start', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="2020"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Año Fin
                            </label>
                            <input
                              type="number"
                              value={edu.year_end || ''}
                              onChange={(e) => updateEducation(index, 'year_end', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="2024"
                              disabled={edu.current}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={edu.current || false}
                            onChange={(e) => updateEducation(index, 'current', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Actualmente estudiando
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                  
                  {(!profile.education || profile.education.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <p>No has agregado información educativa</p>
                      <button
                        onClick={addEducation}
                        className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Agregar mi primera educación
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Habilidades Técnicas
                  </h3>
                </div>

                {/* Add new skill */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Agregar nueva habilidad (ej: JavaScript, Python, React...)"
                  />
                  <button
                    onClick={addSkill}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Agregar
                  </button>
                </div>

                {/* Skills list */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Mis Habilidades ({(profile.skills || []).length})
                  </h4>
                  {(profile.skills || []).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
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
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <p>No has agregado habilidades técnicas</p>
                      <p className="text-sm mt-1">Agrega tus habilidades para mejorar tu visibilidad</p>
                    </div>
                  )}
                </div>

                {/* Languages */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900">
                      Idiomas
                    </h4>
                    <button
                      onClick={addLanguage}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
                    >
                      + Agregar
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(profile.languages || []).map((lang: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={lang.language || ''}
                          onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Idioma"
                        />
                        <select
                          value={lang.level || 'intermediate'}
                          onChange={(e) => updateLanguage(index, 'level', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="basic">Básico</option>
                          <option value="intermediate">Intermedio</option>
                          <option value="advanced">Avanzado</option>
                          <option value="native">Nativo</option>
                        </select>
                        <button
                          onClick={() => removeLanguage(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    
                    {(!profile.languages || profile.languages.length === 0) && (
                      <div className="text-center py-4 text-gray-500">
                        <p>No has agregado idiomas</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="p-6 space-y-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Preferencias Laborales
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <LabelWithTooltip
                      label="Tipo de Trabajo"
                      tooltip="Especifica el tipo de contratación que buscas: tiempo completo, medio tiempo, freelance, etc."
                      htmlFor="job_type"
                    />
                    <select
                      id="job_type"
                      value={profile.preferences?.job_type || 'full-time'}
                      onChange={(e) => setProfile((prev: any) => ({
                        ...prev,
                        preferences: { ...prev.preferences, job_type: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="full-time">Tiempo Completo</option>
                      <option value="part-time">Medio Tiempo</option>
                      <option value="contract">Por Contrato</option>
                      <option value="freelance">Freelance</option>
                      <option value="internship">Prácticas</option>
                    </select>
                  </div>

                  <div>
                    <LabelWithTooltip
                      label="Expectativa Salarial (mensual)"
                      tooltip="Indica tu rango salarial esperado en tu moneda local. Esto ayuda a las empresas a hacer ofertas acordes a tus expectativas. Ejemplo: $50,000 - $70,000"
                      htmlFor="salary_expectation"
                    />
                    <input
                      id="salary_expectation"
                      type="text"
                      value={profile.preferences?.salary_expectation || ''}
                      onChange={(e) => setProfile((prev: any) => ({
                        ...prev,
                        preferences: { ...prev.preferences, salary_expectation: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="$50,000 - $70,000"
                    />
                  </div>

                  <div>
                    <LabelWithTooltip
                      label="Disponibilidad"
                      tooltip="Indica cuándo podrías comenzar a trabajar. 'Inmediata' significa que puedes empezar en menos de 2 semanas."
                      htmlFor="availability"
                    />
                    <select
                      id="availability"
                      value={profile.preferences?.availability || 'immediate'}
                      onChange={(e) => setProfile((prev: any) => ({
                        ...prev,
                        preferences: { ...prev.preferences, availability: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="immediate">Inmediata</option>
                      <option value="2-weeks">2 semanas</option>
                      <option value="1-month">1 mes</option>
                      <option value="2-months">2 meses</option>
                      <option value="negotiable">Negociable</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="remote-work"
                      checked={profile.preferences?.remote_work || false}
                      onChange={(e) => setProfile((prev: any) => ({
                        ...prev,
                        preferences: { ...prev.preferences, remote_work: e.target.checked }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remote-work" className="ml-2 text-sm text-gray-900 flex items-center gap-1.5">
                      Abierto a trabajo remoto
                      <LabelWithTooltip
                        label=""
                        tooltip="Indica si estás dispuesto a trabajar de forma remota/desde casa. Esto amplia tus oportunidades a nivel nacional e internacional."
                        htmlFor=""
                      />
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="willing-relocate"
                      checked={profile.preferences?.willing_to_relocate || false}
                      onChange={(e) => setProfile((prev: any) => ({
                        ...prev,
                        preferences: { ...prev.preferences, willing_to_relocate: e.target.checked }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="willing-relocate" className="ml-2 text-sm text-gray-900 flex items-center gap-1.5">
                      Dispuesto a reubicarse
                      <LabelWithTooltip
                        label=""
                        tooltip="Indica si estás dispuesto a mudarte a otra ciudad o país por una oportunidad laboral. Algunas empresas ofrecen paquetes de reubicación."
                        htmlFor=""
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Save button */}
            <div className="border-t border-gray-200 px-6 py-4">
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
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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