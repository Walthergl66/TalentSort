"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * SUS Survey Component
 * System Usability Scale - Evaluación de Usabilidad Global Post-Sesión
 * Escala Likert 1-5: Totalmente en desacuerdo a Totalmente de acuerdo
 * Puntaje final: 0-100
 */

interface SUSSurveyProps {
  userId: string
  sessionId: string
  userRole?: string
  sessionDurationMinutes?: number
  pagesVisited?: number
  onComplete?: () => void
  onSkip?: () => void
}

const susQuestions = [
  { key: 'uso_frecuente', text: 'Creo que me gustaría utilizar este sistema frecuentemente', positive: true },
  { key: 'complejidad_innecesaria', text: 'Encontré el sistema innecesariamente complejo', positive: false },
  { key: 'facilidad_uso', text: 'Pensé que el sistema era fácil de usar', positive: true },
  { key: 'necesidad_ayuda', text: 'Creo que necesitaría el apoyo de un técnico para poder utilizar este sistema', positive: false },
  { key: 'integracion_funcional', text: 'Encontré que las diversas funciones del sistema estaban bien integradas', positive: true },
  { key: 'inconsistencia', text: 'Pensé que había demasiada inconsistencia en este sistema', positive: false },
  { key: 'aprendizaje_rapido', text: 'Imagino que la mayoría de las personas aprenderían a utilizar este sistema rápidamente', positive: true },
  { key: 'complicacion', text: 'Encontré el sistema muy complicado de utilizar', positive: false },
  { key: 'confianza', text: 'Me sentí muy confiado/a utilizando el sistema', positive: true },
  { key: 'curva_aprendizaje', text: 'Necesité aprender muchas cosas antes de poder manejarme en el sistema', positive: false },
]

const scaleLabels = [
  'Totalmente en desacuerdo',
  'En desacuerdo',
  'Neutral',
  'De acuerdo',
  'Totalmente de acuerdo'
]

export const SUSSurvey: React.FC<SUSSurveyProps> = ({
  userId,
  sessionId,
  userRole = 'unknown',
  sessionDurationMinutes,
  pagesVisited,
  onComplete,
  onSkip
}) => {
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [comentarios, setComentarios] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showResults, setShowResults] = useState(false)

  const currentQuestion = susQuestions[currentIndex]
  const progress = ((currentIndex + 1) / susQuestions.length) * 100

  const calculateSUSScore = (): number => {
    let score = 0
    susQuestions.forEach((q) => {
      const response = responses[q.key]
      if (response !== undefined) {
        if (q.positive) {
          score += response - 1
        } else {
          score += 5 - response
        }
      }
    })
    return (score / 40) * 100
  }

  const getSUSRating = (score: number): { label: string; color: string; description: string } => {
    if (score >= 85) return { 
      label: 'Excelente', 
      color: 'text-green-600', 
      description: 'La usabilidad del sistema es excepcional' 
    }
    if (score >= 73) return { 
      label: 'Bueno', 
      color: 'text-blue-600', 
      description: 'El sistema tiene buena usabilidad' 
    }
    if (score >= 52) return { 
      label: 'Aceptable', 
      color: 'text-yellow-600', 
      description: 'La usabilidad es pasable pero mejorable' 
    }
    if (score >= 25) return { 
      label: 'Pobre', 
      color: 'text-orange-600', 
      description: 'El sistema necesita mejoras significativas' 
    }
    return { 
      label: 'Muy pobre', 
      color: 'text-red-600', 
      description: 'La usabilidad del sistema es muy deficiente' 
    }
  }

  const handleResponse = (value: number) => {
    setResponses(prev => ({ ...prev, [currentQuestion.key]: value }))
  }

  const handleNext = () => {
    if (responses[currentQuestion.key] === undefined) {
      setError('Por favor, selecciona una respuesta antes de continuar.')
      return
    }
    setError('')
    if (currentIndex < susQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    setError('')
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (responses[currentQuestion.key] === undefined) {
      setError('Por favor, responde esta pregunta antes de enviar.')
      return
    }

    if (Object.keys(responses).length < susQuestions.length) {
      setError('Por favor, responde todas las preguntas antes de enviar.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const deviceType = /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
      const susScore = calculateSUSScore()

      const { error: dbError } = await supabase
        .from('usability_sus')
        .insert({
          user_id: userId,
          session_id: sessionId,
          user_role: userRole,
          session_duration_minutes: sessionDurationMinutes,
          pages_visited: pagesVisited,
          device_type: deviceType,
          sus_score: susScore,
          comentarios: comentarios || null,
          ...responses
        })

      if (dbError) throw dbError

      setShowResults(true)
    } catch (err) {
      console.error('Error al enviar SUS:', err)
      setError('Hubo un error al enviar tus respuestas. Por favor, intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (showResults) {
    const susScore = calculateSUSScore()
    const rating = getSUSRating(susScore)

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 rounded-t-xl text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">¡Gracias por tu feedback!</h2>
            <p className="text-green-100">Tus respuestas han sido enviadas</p>
          </div>

          <div className="p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Puntuación SUS
            </h3>
            <div className="mb-6">
              <div className="text-6xl font-bold mb-2" style={{ color: rating.color.replace('text-', '') }}>
                {susScore.toFixed(1)}
              </div>
              <div className="text-2xl font-semibold mb-2" style={{ color: rating.color.replace('text-', '') }}>
                {rating.label}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {rating.description}
              </p>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Escala SUS: 0-100 puntos<br />
                Promedio de la industria: ~68 puntos
              </p>
            </div>

            <button
              onClick={onComplete}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Continuar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">📋 System Usability Scale (SUS)</h2>
              <p className="text-indigo-100 mt-1">Evaluación de Usabilidad Global</p>
            </div>
            <button
              onClick={onSkip}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
              aria-label="Cerrar encuesta"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Progress */}
          <div className="w-full bg-indigo-900 bg-opacity-30 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-indigo-100 mt-2">
            Pregunta {currentIndex + 1} de {susQuestions.length}
          </p>
        </div>

        {/* Question */}
        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-start gap-3 mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-lg">
                {currentIndex + 1}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white pt-1">
                {currentQuestion.text}
              </h3>
            </div>

            {/* Scale */}
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleResponse(value)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center gap-4 ${
                    responses[currentQuestion.key] === value
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900 dark:border-indigo-400 shadow-md'
                      : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    responses[currentQuestion.key] === value
                      ? 'border-indigo-600 bg-indigo-600'
                      : 'border-gray-400 dark:border-gray-500'
                  }`}>
                    {responses[currentQuestion.key] === value && (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${
                      responses[currentQuestion.key] === value
                        ? 'text-indigo-700 dark:text-indigo-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {scaleLabels[value - 1]}
                    </div>
                  </div>
                  <div className={`text-2xl font-bold ${
                    responses[currentQuestion.key] === value
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-400 dark:text-gray-600'
                  }`}>
                    {value}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Comments (última pregunta) */}
          {currentIndex === susQuestions.length - 1 && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comentarios adicionales (opcional)
              </label>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Comparte cualquier comentario final..."
              />
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-b-xl border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>

            {currentIndex < susQuestions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {submitting ? '⏳ Calculando...' : '✓ Ver resultados'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SUSSurvey
