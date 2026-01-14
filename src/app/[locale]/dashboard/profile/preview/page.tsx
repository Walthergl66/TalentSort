'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AccessibilityProvider from '@/components/Accesibilidad/AccessibilityProvider'

export default function ProfilePreviewPage() {
  const router = useRouter()
  const t = useTranslations('profile.preview')
  const ta = useTranslations('actions')
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
        return
      }

      if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCompletenessColor = (completeness: number) => {
    if (completeness >= 80) return 'text-green-600 bg-green-100'
    if (completeness >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getExperienceLevel = (years: number) => {
    if (years === 0) return 'Sin experiencia'
    if (years <= 1) return 'Junior (0-1 años)'
    if (years <= 3) return 'Semi-Senior (2-3 años)'
    if (years <= 7) return 'Senior (4-7 años)'
    return 'Experto (8+ años)'
  }

  if (loading) {
    return (
      <AccessibilityProvider>
        <DashboardLayout user={user}>
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </DashboardLayout>
      </AccessibilityProvider>
    )
  }

  if (!profile) {
    return (
      <AccessibilityProvider>
        <DashboardLayout user={user}>
          <div className="p-6 text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
              <svg className="w-16 h-16 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-medium text-yellow-900 mb-2">
                Perfil no encontrado
              </h3>
              <p className="text-yellow-800 mb-6">
                Necesitas completar tu perfil antes de poder previsualizarlo
              </p>
              <button
                onClick={() => router.push('/dashboard/profile')}
                className="bg-yellow-600 text-white px-6 py-3 rounded-md hover:bg-yellow-700 font-medium"
              >
                Completar mi perfil
              </button>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-800"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Vista Previa del Perfil
                </h1>
                <p className="text-sm text-gray-600">
                  Así es como los reclutadores ven tu perfil
                </p>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/dashboard/profile')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Editar Perfil
            </button>
          </div>

          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {/* Header section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">
                      {profile.full_name || t('nameNotSpecified')}
                    </h2>
                    <p className="text-xl text-blue-100 mt-1">
                      {profile.title || t('titleNotSpecified')}
                    </p>
                    <div className="flex items-center space-x-4 mt-3 text-blue-100">
                      {profile.location && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {profile.location}
                        </div>
                      )}
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                        </svg>
                        {getExperienceLevel(profile.experience_years)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full font-medium ${getCompletenessColor(profile.profile_completeness)}`}>
                    Perfil {profile.profile_completeness}% completo
                  </div>
                </div>
              </div>
            </div>

            {/* Content sections */}
            <div className="p-8 space-y-8">
              {/* Bio */}
              {profile.bio && (
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Sobre mí
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {profile.bio}
                  </p>
                </section>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Contact Info */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Información de Contacto
                  </h3>
                  <dl className="space-y-3">
                    {profile.email && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                        <dd className="text-sm text-gray-900">{profile.email}</dd>
                      </div>
                    )}
                    {profile.phone && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Teléfono</dt>
                        <dd className="text-sm text-gray-900">{profile.phone}</dd>
                      </div>
                    )}
                    {profile.preferences?.salary_expectation && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Expectativa Salarial</dt>
                        <dd className="text-sm text-gray-900">{profile.preferences.salary_expectation}</dd>
                      </div>
                    )}
                    {profile.preferences?.availability && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Disponibilidad</dt>
                        <dd className="text-sm text-gray-900">
                          {profile.preferences.availability === 'immediate' ? 'Inmediata' :
                           profile.preferences.availability === '2-weeks' ? '2 semanas' :
                           profile.preferences.availability === '1-month' ? '1 mes' :
                           profile.preferences.availability === '2-months' ? '2 meses' : 'Negociable'}
                        </dd>
                      </div>
                    )}
                  </dl>
                </section>

                {/* Work Preferences */}
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    </svg>
                    Preferencias Laborales
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Tipo de trabajo</span>
                      <span className="text-sm text-gray-900 capitalize">
                        {profile.preferences?.job_type?.replace('-', ' ') || 'No especificado'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Trabajo remoto</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        profile.preferences?.remote_work ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {profile.preferences?.remote_work ? 'Sí' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Dispuesto a reubicarse</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        profile.preferences?.willing_to_relocate ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {profile.preferences?.willing_to_relocate ? 'Sí' : 'No'}
                      </span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Habilidades Técnicas ({profile.skills.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Education */}
              {profile.education && profile.education.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Educación
                  </h3>
                  <div className="space-y-4">
                    {profile.education.map((edu: any, index: number) => (
                      <div key={index} className="border-l-2 border-blue-200 pl-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                          <span className="text-sm text-gray-500">
                            {edu.year_start} - {edu.current ? 'Presente' : edu.year_end}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{edu.field}</p>
                        <p className="text-sm text-gray-600">{edu.institution}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Languages */}
              {profile.languages && profile.languages.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    Idiomas
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {profile.languages.map((lang: any, index: number) => (
                      <div key={index} className="text-center">
                        <div className="font-medium text-gray-900">{lang.language}</div>
                        <div className="text-sm text-gray-600 capitalize">
                          {lang.level === 'basic' ? 'Básico' :
                           lang.level === 'intermediate' ? 'Intermedio' :
                           lang.level === 'advanced' ? 'Avanzado' : 'Nativo'}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Social Links */}
              {profile.social_links && (
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Enlaces Profesionales
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {profile.social_links.linkedin && (
                      <a
                        href={profile.social_links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                        </svg>
                        LinkedIn
                      </a>
                    )}
                    {profile.social_links.github && (
                      <a
                        href={profile.social_links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                        </svg>
                        GitHub
                      </a>
                    )}
                    {profile.social_links.portfolio && (
                      <a
                        href={profile.social_links.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                        </svg>
                        Portfolio
                      </a>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.push('/dashboard/profile')}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
            >
              Mejorar mi perfil
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 font-medium"
            >
              Volver al dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    </AccessibilityProvider>
  )
}