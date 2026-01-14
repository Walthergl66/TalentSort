'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AccessibilityProvider from '@/components/Accesibilidad/AccessibilityProvider'

export default function MyCVsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [cvs, setCvs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mainCVId, setMainCVId] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/')
        return
      }

      setUser(session.user)
      await fetchCVs(session.user.id)
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    // Obtener el CV principal del usuario
    const fetchMainCV = async () => {
      if (!user) return
      const { data, error } = await supabase
        .from('user_profiles')
        .select('main_cv_id')
        .eq('user_id', user.id)
        .single()
      if (data?.main_cv_id) setMainCVId(data.main_cv_id)
    }
    fetchMainCV()
  }, [user])

  const fetchCVs = async (userId: string) => {
    try {
      console.log('[cv] Fetching CVs for user:', userId)
      
      // Verificar configuración de Supabase
      const { data: { session } } = await supabase.auth.getSession()
      console.log('[cv] Session status:', {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email
      })

      const { data, error } = await supabase
        .from('user_cvs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      console.log('[cv] Raw response:', { 
        data, 
        error,
        errorType: error ? typeof error : 'no error',
        errorKeys: error ? Object.keys(error) : []
      })

      if (error) {
        const errorInfo = {
          message: error.message || 'Unknown error',
          details: error.details || 'No details',
          hint: error.hint || 'No hint',
          code: error.code || 'No code',
          full: JSON.stringify(error, null, 2)
        }
        
        console.error('[cv] Error fetching CVs:', errorInfo)
        
        // Mensajes de error específicos
        let userMessage = 'Error al cargar los CVs: '
        
        if (error.code === 'PGRST116') {
          userMessage += 'La tabla "user_cvs" no existe. Por favor, ejecuta el script de creación de tablas.'
        } else if (error.message?.includes('permission') || error.message?.includes('policy')) {
          userMessage += 'Problema de permisos. Verifica las políticas RLS en Supabase.'
        } else {
          userMessage += error.message || 'Error desconocido'
        }
        
        alert(userMessage)
        return
      }

      console.log('[cv] CVs fetched successfully:', data?.length || 0, 'CVs')
      setCvs(data || [])
    } catch (error) {
      console.error('[cv] Unexpected error:', error)
      alert('Error inesperado al cargar los CVs. Por favor, recarga la página.')
    } finally {
      setLoading(false)
    }
  }

  const setAsMainCV = async (cvId: string) => {
    if (!user) return
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ main_cv_id: cvId })
        .eq('user_id', user.id)
      if (!error) setMainCVId(cvId)
    } catch (error) {
      console.error('Error al cambiar el CV principal:', error)
    }
  }

  const deleteCV = async (cvId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este CV?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('user_cvs')
        .delete()
        .eq('id', cvId)

      if (error) {
        console.error('Error deleting CV:', error)
        return
      }

      setCvs(prev => prev.filter(cv => cv.id !== cvId))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  return (
    <AccessibilityProvider>
      <DashboardLayout user={user}>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Mis CVs
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona tus CVs subidos y revisa el análisis de IA
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard/cv/upload')}
              className="mt-4 sm:mt-0 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Subir Nuevo CV
            </button>
          </div>

          {/* Lista de CVs */}
          {cvs.length > 0 ? (
            <div className="space-y-4">
              {cvs.map((cv) => (
                <div key={cv.id} className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${mainCVId === cv.id ? 'ring-2 ring-blue-500' : ''}`}> 
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {cv.file_name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Subido el {formatDate(cv.created_at)} • {(cv.file_size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Puntuación IA
                            </dt>
                            <dd className={`mt-1 text-xl font-semibold px-2 py-1 rounded-full inline-block ${getScoreColor(cv.ai_score)}`}>
                              {cv.ai_score}%
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Experiencia
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {cv.experience_years} años
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Posición Actual
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {cv.current_position || 'No especificada'}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              Estado
                            </dt>
                            <dd className="mt-1">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Procesado
                              </span>
                            </dd>
                          </div>
                        </div>

                        {cv.skills && cv.skills.length > 0 && (
                          <div className="mb-4">
                            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                              Habilidades Detectadas
                            </dt>
                            <dd className="flex flex-wrap gap-2">
                              {cv.skills.slice(0, 8).map((skill: string, index: number) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {skill}
                                </span>
                              ))}
                              {cv.skills.length > 8 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  +{cv.skills.length - 8} más
                                </span>
                              )}
                            </dd>
                          </div>
                        )}

                        {cv.summary && (
                          <div>
                            <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                              Resumen IA
                            </dt>
                            <dd className="text-sm text-gray-700">
                              {cv.summary}
                            </dd>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-6">
                                                <button
                                                  onClick={() => setAsMainCV(cv.id)}
                                                  className={`text-blue-600 hover:text-blue-800 text-sm font-medium ${mainCVId === cv.id ? 'font-bold underline' : ''}`}
                                                  disabled={mainCVId === cv.id}
                                                >
                                                  {mainCVId === cv.id ? 'CV Principal' : 'Establecer como CV Principal'}
                                                </button>
                        <button
                          onClick={() => router.push(`/dashboard/cv/${cv.id}`)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Ver Detalles
                        </button>
                        <button
                          onClick={() => deleteCV(cv.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Barra de progreso visual */}
                  <div className="px-6 pb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          cv.ai_score >= 80 ? 'bg-green-500' :
                          cv.ai_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${cv.ai_score}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Puntuación del CV</span>
                      <span>{cv.ai_score}/100</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes CVs subidos
              </h3>
              <p className="text-gray-500 mb-6">
                Sube tu primer CV para obtener análisis automático y mejorar tu perfil profesional
              </p>
              <button
                onClick={() => router.push('/dashboard/cv/upload')}
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
              >
                Subir mi CV
              </button>
            </div>
          )}

          {/* Tips y recomendaciones */}
          {cvs.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <svg className="h-6 w-6 text-blue-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-lg font-medium text-blue-900 mb-2">
                    Consejos para mejorar tu CV
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Mantén tu CV actualizado con tu experiencia más reciente</li>
                    <li>• Incluye palabras clave relevantes para tu industria</li>
                    <li>• Cuantifica tus logros con números y porcentajes</li>
                    <li>• Usa un formato limpio y profesional</li>
                    <li>• Personaliza tu CV para cada aplicación</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AccessibilityProvider>
  )
}