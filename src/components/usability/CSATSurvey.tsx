"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * CSAT Survey Component
 * Customer Satisfaction Score - Evaluación de Satisfacción Post-Sesión
 * Escala Likert 1-5: Muy insatisfecho a Muy satisfecho
 */

interface CSATSurveyProps {
  userId: string
  sessionId: string
  userRole?: string
  pageContext?: string
  onComplete?: () => void
  onSkip?: () => void
}

const csatQuestions = [
  { key: 'satisfaccion_global', label: 'Satisfacción global', description: 'Valoración general de la experiencia con la interfaz' },
  { key: 'facilidad_uso', label: 'Facilidad de uso', description: 'Grado en que la interfaz resulta sencilla de utilizar' },
  { key: 'claridad_informacion', label: 'Claridad de la información', description: 'Nivel de comprensión de textos, etiquetas e instrucciones' },
  { key: 'fluidez_interaccion', label: 'Fluidez de interacción', description: 'Continuidad de la interacción sin interrupciones innecesarias' },
  { key: 'confianza_usuario', label: 'Confianza del usuario', description: 'Sensación de seguridad al ejecutar acciones' },
  { key: 'rapidez_percibida', label: 'Rapidez percibida', description: 'Percepción subjetiva del tiempo de respuesta' },
  { key: 'consistencia', label: 'Consistencia', description: 'Coherencia del comportamiento de la interfaz' },
  { key: 'control_percibido', label: 'Control percibido', description: 'Sensación de dominio sobre las acciones' },
  { key: 'estetica_visual', label: 'Estética visual', description: 'Agradabilidad del diseño gráfico' },
  { key: 'comodidad_uso', label: 'Comodidad de uso', description: 'Sensación de confort durante la interacción' },
  { key: 'claridad_retroalimentacion', label: 'Claridad de retroalimentación', description: 'Comprensión de mensajes de estado, error o confirmación' },
  { key: 'satisfaccion_resultado', label: 'Satisfacción con el resultado', description: 'Grado en que el resultado cumple expectativas' },
  { key: 'experiencia_general', label: 'Experiencia general', description: 'Evaluación integral de la interacción' },
]

const scaleLabels = [
  'Muy insatisfecho',
  'Insatisfecho',
  'Neutral',
  'Satisfecho',
  'Muy satisfecho'
]

export const CSATSurvey: React.FC<CSATSurveyProps> = ({
  userId,
  sessionId,
  userRole = 'unknown',
  pageContext = 'general',
  onComplete,
  onSkip
}) => {
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [comentarios, setComentarios] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const questionsPerPage = 5
  const totalPages = Math.ceil(csatQuestions.length / questionsPerPage)
  const currentQuestions = csatQuestions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  )

  const handleResponse = (key: string, value: number) => {
    setResponses(prev => ({ ...prev, [key]: value }))
  }

  const isPageComplete = () => {
    return currentQuestions.every(q => responses[q.key] !== undefined)
  }

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (Object.keys(responses).length < csatQuestions.length) {
      setError('Por favor, responde todas las preguntas antes de enviar.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const deviceType = /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
      const browserInfo = navigator.userAgent

      const { error: dbError } = await supabase
        .from('usability_csat')
        .insert({
          user_id: userId,
          session_id: sessionId,
          user_role: userRole,
          page_context: pageContext,
          device_type: deviceType,
          browser_info: browserInfo,
          comentarios: comentarios || null,
          ...responses
        })

      if (dbError) throw dbError

      if (onComplete) onComplete()
    } catch (err) {
      console.error('Error al enviar CSAT:', err)
      setError('Hubo un error al enviar tus respuestas. Por favor, intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const progress = ((currentPage + 1) / totalPages) * 100

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">📊 Evaluación de Satisfacción (CSAT)</h2>
              <p className="text-blue-100 mt-1">Tu opinión nos ayuda a mejorar</p>
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
          
          {/* Progress bar */}
          <div className="w-full bg-blue-900 bg-opacity-30 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-blue-100 mt-2">
            Página {currentPage + 1} de {totalPages} • {Object.keys(responses).length}/{csatQuestions.length} respuestas
          </p>
        </div>

        {/* Questions */}
        <div className="p-6 space-y-6">
          {currentQuestions.map((question) => (
            <div key={question.key} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {question.label}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {question.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleResponse(question.key, value)}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      responses[question.key] === value
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900 dark:border-blue-400'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                    }`}
                  >
                    <div className="text-2xl mb-1">
                      {value === 1 ? '😞' : value === 2 ? '😕' : value === 3 ? '😐' : value === 4 ? '🙂' : '😄'}
                    </div>
                    <div className={`text-lg font-bold mb-1 ${
                      responses[question.key] === value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {value}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {scaleLabels[value - 1]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Comments (última página) */}
          {currentPage === totalPages - 1 && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comentarios adicionales (opcional)
              </label>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Comparte cualquier comentario sobre tu experiencia..."
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 p-6 rounded-b-xl border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>

            <div className="flex gap-3">
              {currentPage < totalPages - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={!isPageComplete()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!isPageComplete() || submitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {submitting ? '⏳ Enviando...' : '✓ Enviar respuestas'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CSATSurvey
