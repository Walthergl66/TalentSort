'use client'

import SurveyResults from '@/components/analytics/SurveyResults'
import { useRouter } from 'next/navigation'

export default function AnalyticsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Analytics de Registro
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Métricas de satisfacción y usabilidad
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← Volver al Dashboard
          </button>
        </div>
      </div>

      {/* Contenido */}
      <SurveyResults />

      {/* Footer con información */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            ℹ️ Sobre estas métricas
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Objetivo de rúbrica:</strong> Claridad ≥ 4.0/5.0</li>
            <li>• <strong>Datos:</strong> Almacenados en localStorage (temporal)</li>
            <li>• <strong>Actualización:</strong> Automática al cargar la página</li>
            <li>• <strong>Período:</strong> Todas las encuestas desde implementación</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
