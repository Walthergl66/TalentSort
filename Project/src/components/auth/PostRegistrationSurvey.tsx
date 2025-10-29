'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface PostRegistrationSurveyProps {
  onClose: () => void
  onSubmit: (responses: SurveyResponses) => void
}

export interface SurveyResponses {
  clarity: number
  ease: number
  time: number
  satisfaction: number
  wouldRecommend: number
  feedback?: string
}

export default function PostRegistrationSurvey({ onClose, onSubmit }: PostRegistrationSurveyProps) {
  const [responses, setResponses] = useState<SurveyResponses>({
    clarity: 0,
    ease: 0,
    time: 0,
    satisfaction: 0,
    wouldRecommend: 0,
    feedback: ''
  })

  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar que todas las preguntas estén respondidas
    if (responses.clarity === 0 || responses.ease === 0 || responses.time === 0 || 
        responses.satisfaction === 0 || responses.wouldRecommend === 0) {
      alert('Por favor, responde todas las preguntas de la encuesta')
      return
    }

    onSubmit(responses)
    setSubmitted(true)

    // Cerrar automáticamente después de 2 segundos
    setTimeout(() => {
      onClose()
    }, 2000)
  }

  const handleSkip = () => {
    onClose()
  }

  const LikertScale = ({ 
    question, 
    field, 
    leftLabel, 
    rightLabel 
  }: { 
    question: string
    field: keyof SurveyResponses
    leftLabel: string
    rightLabel: string
  }) => (
    <div className="mb-6">
      <p className="text-sm font-medium text-gray-700 mb-3">{question}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-500 w-24 text-right">{leftLabel}</span>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setResponses({ ...responses, [field]: value })}
              className={`w-12 h-12 rounded-lg border-2 font-semibold transition-all duration-200 ${
                responses[field] === value
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg scale-110'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-indigo-400 hover:scale-105'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500 w-24">{rightLabel}</span>
      </div>
    </div>
  )

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">¡Gracias por tu feedback!</h3>
          <p className="text-gray-600">Tu opinión nos ayuda a mejorar la experiencia de registro.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full my-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              ¿Cómo fue tu experiencia de registro?
            </h2>
            <p className="text-sm text-gray-600">
              Ayúdanos a mejorar respondiendo estas 5 preguntas rápidas (1-2 min)
            </p>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Cerrar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Preguntas Likert */}
          <div className="space-y-6 mb-8">
            <LikertScale
              question="1. ¿Qué tan claro fue el proceso de registro?"
              field="clarity"
              leftLabel="Muy confuso"
              rightLabel="Muy claro"
            />

            <LikertScale
              question="2. ¿Qué tan fácil fue completar el formulario?"
              field="ease"
              leftLabel="Muy difícil"
              rightLabel="Muy fácil"
            />

            <LikertScale
              question="3. ¿El tiempo que tomó fue adecuado?"
              field="time"
              leftLabel="Muy largo"
              rightLabel="Muy rápido"
            />

            <LikertScale
              question="4. ¿Qué tan satisfecho estás con la experiencia?"
              field="satisfaction"
              leftLabel="Muy insatisfecho"
              rightLabel="Muy satisfecho"
            />

            <LikertScale
              question="5. ¿Recomendarías este sistema a otros?"
              field="wouldRecommend"
              leftLabel="Nunca"
              rightLabel="Definitivamente"
            />
          </div>

          {/* Feedback adicional */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Algo más que quieras compartir? (Opcional)
            </label>
            <textarea
              value={responses.feedback}
              onChange={(e) => setResponses({ ...responses, feedback: e.target.value })}
              placeholder="Comparte tus comentarios, sugerencias o problemas que encontraste..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Enviar Respuestas
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Omitir
            </button>
          </div>

          {/* Indicador de progreso */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progreso</span>
              <span>{Math.round((Object.values(responses).filter(v => typeof v === 'number' && v > 0).length / 5) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(Object.values(responses).filter(v => typeof v === 'number' && v > 0).length / 5) * 100}%` }}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
