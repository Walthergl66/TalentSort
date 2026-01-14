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
  const [isCompany, setIsCompany] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/')
        return
      }

      setUser(session.user)
      await fetchProfile(session.user.id)
      // Detectar si el usuario es empresa
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single()
      if (profileData?.role === 'company') setIsCompany(true)
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isCompany ? 'Información de la Empresa' : 'Mi Perfil Profesional'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {isCompany ? 'Completa los datos de tu empresa para mejorar tu presencia y confianza ante los candidatos.' : 'Gestiona tu información profesional y mejora tu visibilidad'}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {isCompany ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <LabelWithTooltip label="Nombre de la Empresa" tooltip="Nombre legal o comercial de la empresa" required htmlFor="company_name" />
                    <input
                      id="company_name"
                      type="text"
                      value={profile.full_name || ''}
                      onChange={(e) => setProfile((prev: any) => ({ ...prev, full_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ciudad, País"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <LabelWithTooltip label="Descripción de la empresa" tooltip="Breve descripción, misión y valores" htmlFor="bio" />
                    <textarea
                      id="bio"
                      value={profile.bio || ''}
                      onChange={(e) => setProfile((prev: any) => ({ ...prev, bio: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // ...existing code...
              <>{/* Aquí va el formulario original de candidato */}</>
            )}
          </div>
        </div>
      </DashboardLayout>
    </AccessibilityProvider>
  )
}