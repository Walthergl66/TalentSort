'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AccessibilityProvider from '@/components/Accesibilidad/AccessibilityProvider'

export default function CVDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<any>(null)
  const [cv, setCv] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reanalyzing, setReanalyzing] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/')
        return
      }

      setUser(session.user)
      if (params.id) {
        await fetchCVDetails(params.id as string, session.user.id)
      }
    }

    checkAuth()
  }, [router, params.id])

  const fetchCVDetails = async (cvId: string, userId: string) => {
    try {
      console.log('🔍 Fetching CV details:', { cvId, userId })
      
      const { data, error } = await supabase
        .from('user_cvs')
        .select('*')
        .eq('id', cvId)
        .eq('user_id', userId)
        .single()

      console.log('📦 CV details response:', { data, error })

      if (error) {
        console.error('❌ Error fetching CV details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        alert(`Error al cargar el CV: ${error.message || 'No se pudo encontrar el CV'}`)
        router.push('/dashboard/cv')
        return
      }

      if (!data) {
        console.error('❌ No CV data returned')
        alert('No se encontró el CV solicitado')
        router.push('/dashboard/cv')
        return
      }

      console.log('✅ CV loaded successfully:', data.file_name)
      setCv(data)
    } catch (error) {
      console.error('❌ Unexpected error:', error)
      alert('Error inesperado al cargar el CV')
      router.push('/dashboard/cv')
    } finally {
      setLoading(false)
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleReanalyze = async () => {
    if (!cv) return

    const confirm = window.confirm(
      '¿Deseas volver a analizar este CV con la IA?\n\n' +
      'Esto actualizará el puntaje, habilidades detectadas y recomendaciones.'
    )

    if (!confirm) return

    setReanalyzing(true)
    try {
      console.log('🔄 Reanalizando CV...')

      // Construir texto del CV a partir de los datos disponibles
      const cvText = cv.cv_text || `
INFORMACIÓN DEL CANDIDATO
Nombre: ${cv.candidate_name || 'No especificado'}
Email: ${cv.candidate_email || 'No especificado'}
Posición actual: ${cv.current_position || 'No especificada'}
Años de experiencia: ${cv.experience_years || 0}

HABILIDADES
${cv.skills && cv.skills.length > 0 ? cv.skills.join(', ') : 'No especificadas'}

RESUMEN
${cv.summary || 'Sin resumen disponible'}

FORTALEZAS
${cv.strengths && cv.strengths.length > 0 ? cv.strengths.join('\n- ') : 'No especificadas'}

ÁREAS DE MEJORA
${cv.areas_improvement && cv.areas_improvement.length > 0 ? cv.areas_improvement.join('\n- ') : 'No especificadas'}
      `.trim()

      if (!cvText || cvText.length < 50) {
        throw new Error('No hay suficiente información en el CV para analizar')
      }

      console.log('📄 Texto del CV generado:', {
        length: cvText.length,
        preview: cvText.substring(0, 200)
      })

      // Análizar con IA
      const response = await fetch('/api/analyze-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cv_text: cvText,
          job_description: 'Análisis general de perfil profesional',
          required_skills: cv.skills || [],
          required_experience: cv.experience_years || 0
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error de API:', errorData)
        throw new Error(errorData.detalles || 'Error al analizar el CV')
      }

      const analysis = await response.json()

      console.log('✅ Análisis recibido:', analysis)

      // Actualizar CV en base de datos
      const { error: updateError } = await supabase
        .from('user_cvs')
        .update({
          ai_score: analysis.score,
          match_percentage: analysis.match_percentage,
          strengths: analysis.analysis?.strengths || [],
          areas_improvement: analysis.analysis?.weaknesses || [],
          summary: analysis.analysis?.evaluation || cv.summary,
          updated_at: new Date().toISOString()
        })
        .eq('id', cv.id)

      if (updateError) {
        throw updateError
      }

      // Actualizar estado local
      await fetchCVDetails(cv.id, user.id)

      alert(
        '✅ CV reanalisado exitosamente\n\n' +
        `Nuevo puntaje: ${analysis.score}/100\n` +
        `Coincidencia: ${analysis.match_percentage}%`
      )

      console.log('✅ Reanálisis completado')

    } catch (error: any) {
      console.error('❌ Error al reanalizar:', error)
      alert(
        '❌ Error al reanalizar el CV\n\n' +
        (error.message || 'Por favor, intenta nuevamente.')
      )
    } finally {
      setReanalyzing(false)
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
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </DashboardLayout>
      </AccessibilityProvider>
    )
  }

  if (!cv) {
    return (
      <AccessibilityProvider>
        <DashboardLayout user={user}>
          <div className="p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">CV no encontrado</h1>
              <button
                onClick={() => router.push('/dashboard/cv')}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                ← Volver a mis CVs
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
                  Detalles del CV
                </h1>
                <p className="text-sm text-gray-600">
                  {cv.file_name} • Subido el {formatDate(cv.created_at)}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/dashboard/cv/upload')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Subir Nuevo CV
              </button>
            </div>
          </div>

          {/* Puntuación principal */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 mb-6">
              <span className={`text-4xl font-bold ${cv.ai_score >= 80 ? 'text-green-600' : cv.ai_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {cv.ai_score}%
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Puntuación de tu CV
            </h2>
            <p className="text-gray-600 mb-6">
              {cv.ai_score >= 80 
                ? '🎉 ¡Excelente! Tu CV es muy competitivo en el mercado actual'
                : cv.ai_score >= 60
                ? '👍 Buen CV con algunas oportunidades de mejora'
                : '📈 Tu CV necesita mejoras para destacar entre los candidatos'
              }
            </p>
            
            {/* Barra de progreso visual */}
            <div className="w-full max-w-md mx-auto">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    cv.ai_score >= 80 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                    cv.ai_score >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 
                    'bg-gradient-to-r from-red-400 to-red-600'
                  }`}
                  style={{ width: `${cv.ai_score}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>
          </div>

          {/* Información profesional */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📋 Información Profesional
              </h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                  <dd className="mt-1 text-sm text-gray-900">{cv.candidate_name || 'No especificado'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{cv.candidate_email || 'No especificado'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Posición Actual</dt>
                  <dd className="mt-1 text-sm text-gray-900">{cv.current_position || 'No especificada'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Años de Experiencia</dt>
                  <dd className="mt-1 text-sm text-gray-900">{cv.experience_years} años</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Expectativa Salarial</dt>
                  <dd className="mt-1 text-sm text-gray-900">{cv.salary_expectation || 'No especificada'}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📊 Información del Archivo
              </h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nombre del Archivo</dt>
                  <dd className="mt-1 text-sm text-gray-900 break-all">{cv.file_name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tamaño</dt>
                  <dd className="mt-1 text-sm text-gray-900">{(cv.file_size / 1024 / 1024).toFixed(2)} MB</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Fecha de Subida</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatDate(cv.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Estado</dt>
                  <dd className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Procesado con IA
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Habilidades */}
          {cv.skills && cv.skills.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🎯 Habilidades Detectadas
              </h3>
              <div className="flex flex-wrap gap-3">
                {cv.skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Resumen IA */}
          {cv.summary && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🤖 Resumen Generado por IA
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {cv.summary}
              </p>
            </div>
          )}

          {/* Fortalezas y Áreas de Mejora */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {cv.strengths && cv.strengths.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">
                  ✅ Fortalezas Identificadas
                </h3>
                <ul className="space-y-3">
                  {cv.strengths.map((strength: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {cv.areas_improvement && cv.areas_improvement.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-orange-900 mb-4">
                  📈 Áreas de Mejora
                </h3>
                <ul className="space-y-3">
                  {cv.areas_improvement.map((area: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-700">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Recomendaciones */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div>
                <h4 className="text-lg font-semibold text-blue-900 mb-3">
                  💡 Recomendaciones Personalizadas
                </h4>
                <div className="space-y-2 text-sm text-blue-800">
                  {cv.ai_score < 60 && (
                    <p>• Considera agregar más detalles sobre tus logros y resultados cuantificables</p>
                  )}
                  {cv.ai_score < 80 && (
                    <p>• Incluye palabras clave relevantes para tu industria y posición objetivo</p>
                  )}
                  <p>• Mantén tu CV actualizado con tu experiencia y habilidades más recientes</p>
                  <p>• Personaliza tu CV para cada aplicación específica</p>
                  <p>• Considera obtener certificaciones en las áreas de mejora identificadas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push('/dashboard/cv')}
              className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 font-medium"
            >
              ← Volver a mis CVs
            </button>
            <button
              onClick={handleReanalyze}
              disabled={reanalyzing}
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {reanalyzing ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Reanalizando...
                </>
              ) : (
                <>
                  🔄 Volver a Analizar con IA
                </>
              )}
            </button>
            <button
              onClick={() => router.push('/dashboard/cv/upload')}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
            >
              Subir nuevo CV
            </button>
          </div>
        </div>
      </DashboardLayout>
    </AccessibilityProvider>
  )
}