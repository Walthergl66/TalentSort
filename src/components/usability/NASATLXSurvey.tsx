"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * NASA-TLX Survey Component
 * Task Load Index - Evaluación de Carga Cognitiva Post-Tarea
 * Escala 1-10: Muy bajo a Muy alto
 */

interface NASATLXSurveyProps {
  userId: string
  taskId: string
  taskName: string
  taskDurationSeconds?: number
  taskCompleted?: boolean
  userRole?: string
  onComplete?: () => void
  onSkip?: () => void
}

const tlxDimensions = [
  { key: 'demanda_mental', label: 'Demanda mental', description: 'Esfuerzo cognitivo requerido para completar la tarea', icon: '🧠' },
  { key: 'demanda_fisica', label: 'Demanda física', description: 'Nivel de esfuerzo físico necesario', icon: '💪' },
  { key: 'demanda_temporal', label: 'Demanda temporal', description: 'Presión de tiempo percibida', icon: '⏱️' },
  { key: 'rendimiento', label: 'Rendimiento', description: 'Percepción del éxito alcanzado', icon: '🎯', inverted: true },
  { key: 'esfuerzo', label: 'Esfuerzo', description: 'Cantidad total de esfuerzo invertido', icon: '⚡' },
  { key: 'frustracion', label: 'Frustración', description: 'Nivel de estrés o molestia experimentado', icon: '😤' },
  { key: 'sobrecarga_informativa', label: 'Sobrecarga informativa', description: 'Exceso de información a procesar', icon: '📚' },
  { key: 'complejidad_percibida', label: 'Complejidad percibida', description: 'Dificultad subjetiva de la tarea', icon: '🔀' },
  { key: 'fatiga_mental', label: 'Fatiga mental', description: 'Cansancio cognitivo posterior', icon: '😴' },
  { key: 'atencion_requerida', label: 'Atención requerida', description: 'Nivel de concentración exigido', icon: '👁️' },
]

export const NASATLXSurvey: React.FC<NASATLXSurveyProps> = ({
  userId,
  taskId,
  taskName,
  taskDurationSeconds,
  taskCompleted = true,
  userRole = 'unknown',
  onComplete,
  onSkip
}) => {
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [comentarios, setComentarios] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const currentDimension = tlxDimensions[currentIndex]
  const progress = ((currentIndex + 1) / tlxDimensions.length) * 100

  const handleResponse = (value: number) => {
    setResponses(prev => ({ ...prev, [currentDimension.key]: value }))
  }

  const handleNext = () => {
    if (responses[currentDimension.key] === undefined) {
      setError('Por favor, selecciona un valor antes de continuar.')
      return
    }
    setError('')
    if (currentIndex < tlxDimensions.length - 1) {
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
    if (responses[currentDimension.key] === undefined) {
      setError('Por favor, responde esta pregunta antes de enviar.')
      return
    }

    if (Object.keys(responses).length < tlxDimensions.length) {
      setError('Por favor, responde todas las preguntas antes de enviar.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const deviceType = /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop'

      const { error: dbError } = await supabase
        .from('usability_nasa_tlx')
        .insert({
          user_id: userId,
          task_id: taskId,
          task_name: taskName,
          task_duration_seconds: taskDurationSeconds,
          task_completed: taskCompleted,
          user_role: userRole,
          device_type: deviceType,
          comentarios: comentarios || null,
          ...responses
        })

      if (dbError) throw dbError

      if (onComplete) onComplete()
    } catch (err) {
      console.error('Error al enviar NASA-TLX:', err)
      setError('Hubo un error al enviar tus respuestas. Por favor, intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">🧠 NASA Task Load Index (TLX)</h2>
              <p className="text-purple-100 mt-1">Evaluación de Carga Cognitiva</p>
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

          {/* Task info */}
          <div className="bg-purple-900 bg-opacity-30 rounded-lg p-3 mb-4">
            <p className="text-sm">
              <strong>Tarea:</strong> {taskName}
              {taskDurationSeconds && (
                <span className="ml-3">
                  <strong>Duración:</strong> {Math.floor(taskDurationSeconds / 60)}:{(taskDurationSeconds % 60).toString().padStart(2, '0')}
                </span>
              )}
              <span className="ml-3">
                <strong>Estado:</strong> {taskCompleted ? '✓ Completada' : '✗ No completada'}
              </span>
            </p>
          </div>
          
          {/* Progress */}
          <div className="w-full bg-purple-900 bg-opacity-30 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-purple-100 mt-2">
            Pregunta {currentIndex + 1} de {tlxDimensions.length}
          </p>
        </div>

        {/* Question */}
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{currentDimension.icon}</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {currentDimension.label}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {currentDimension.description}
            </p>
          </div>

          {/* Scale */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>{currentDimension.inverted ? '10 - Excelente' : '1 - Muy bajo'}</span>
              <span>{currentDimension.inverted ? '1 - Muy bajo' : '10 - Muy alto'}</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <button
                  key={value}
                  onClick={() => handleResponse(value)}
                  className={`flex-1 h-16 rounded-lg border-2 font-bold text-lg transition-all ${
                    responses[currentDimension.key] === value
                      ? 'border-purple-600 bg-purple-100 dark:bg-purple-900 dark:border-purple-400 scale-110 shadow-lg'
                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 hover:scale-105'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Visual feedback */}
          {responses[currentDimension.key] !== undefined && (
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900 dark:bg-opacity-30 rounded-lg">
              <p className="text-lg font-semibold text-purple-700 dark:text-purple-300">
                Nivel seleccionado: {responses[currentDimension.key]}/10
              </p>
            </div>
          )}

          {/* Comments (última pregunta) */}
          {currentIndex === tlxDimensions.length - 1 && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comentarios adicionales (opcional)
              </label>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="¿Algo más que quieras compartir sobre esta tarea?"
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

            {currentIndex < tlxDimensions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {submitting ? '⏳ Enviando...' : '✓ Enviar respuestas'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NASATLXSurvey
