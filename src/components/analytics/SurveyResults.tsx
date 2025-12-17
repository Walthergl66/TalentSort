'use client'

import { useEffect, useState } from 'react'
import { SurveyResponses } from '../auth/PostRegistrationSurvey'

interface SurveyDataWithMetadata extends SurveyResponses {
  average: number
  timestamp: string
  email: string
}

export default function SurveyResults() {
  const [surveys, setSurveys] = useState<SurveyDataWithMetadata[]>([])
  const [stats, setStats] = useState({
    total: 0,
    avgClarity: 0,
    avgEase: 0,
    avgTime: 0,
    avgSatisfaction: 0,
    avgRecommendation: 0,
    overallAverage: 0,
    passRate: 0 // % con promedio >= 4
  })

  useEffect(() => {
    // Cargar datos del localStorage
    const data = JSON.parse(localStorage.getItem('registration_surveys') || '[]')
    setSurveys(data)

    if (data.length > 0) {
      const totals = data.reduce((acc: any, curr: SurveyDataWithMetadata) => ({
        clarity: acc.clarity + curr.clarity,
        ease: acc.ease + curr.ease,
        time: acc.time + curr.time,
        satisfaction: acc.satisfaction + curr.satisfaction,
        wouldRecommend: acc.wouldRecommend + curr.wouldRecommend
      }), { clarity: 0, ease: 0, time: 0, satisfaction: 0, wouldRecommend: 0 })

      const count = data.length
      const passCount = data.filter((s: SurveyDataWithMetadata) => s.average >= 4).length

      setStats({
        total: count,
        avgClarity: totals.clarity / count,
        avgEase: totals.ease / count,
        avgTime: totals.time / count,
        avgSatisfaction: totals.satisfaction / count,
        avgRecommendation: totals.wouldRecommend / count,
        overallAverage: (totals.clarity + totals.ease + totals.time + totals.satisfaction + totals.wouldRecommend) / (count * 5),
        passRate: (passCount / count) * 100
      })
    }
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600 bg-green-50'
    if (score >= 3) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getScoreEmoji = (score: number) => {
    if (score >= 4.5) return '🌟'
    if (score >= 4) return '😊'
    if (score >= 3) return '😐'
    return '😞'
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        📊 Resultados de Encuestas Post-Registro
      </h2>

      {/* Estadísticas Globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-600">
          <div className="text-sm text-gray-600 mb-1">Total de Respuestas</div>
          <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
        </div>

        <div className={`rounded-lg shadow-md p-6 border-l-4 ${
          stats.overallAverage >= 4 ? 'border-green-600 bg-green-50' : 
          stats.overallAverage >= 3 ? 'border-yellow-600 bg-yellow-50' : 
          'border-red-600 bg-red-50'
        }`}>
          <div className="text-sm text-gray-600 mb-1">Promedio General</div>
          <div className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            {stats.overallAverage.toFixed(2)} {getScoreEmoji(stats.overallAverage)}
            <span className="text-sm text-gray-500">/ 5.0</span>
          </div>
        </div>

        <div className={`rounded-lg shadow-md p-6 border-l-4 ${
          stats.passRate >= 80 ? 'border-green-600 bg-green-50' : 
          stats.passRate >= 60 ? 'border-yellow-600 bg-yellow-50' : 
          'border-red-600 bg-red-50'
        }`}>
          <div className="text-sm text-gray-600 mb-1">Tasa de Aprobación</div>
          <div className="text-3xl font-bold text-gray-800">
            {stats.passRate.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            (Promedio ≥ 4.0/5.0)
          </div>
        </div>
      </div>

      {/* Métricas Detalladas */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Desglose por Criterio
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <MetricCard
            title="Claridad"
            score={stats.avgClarity}
            emoji="🔍"
          />
          <MetricCard
            title="Facilidad"
            score={stats.avgEase}
            emoji="✨"
          />
          <MetricCard
            title="Tiempo"
            score={stats.avgTime}
            emoji="⏱️"
          />
          <MetricCard
            title="Satisfacción"
            score={stats.avgSatisfaction}
            emoji="😊"
          />
          <MetricCard
            title="Recomendación"
            score={stats.avgRecommendation}
            emoji="👍"
          />
        </div>
      </div>

      {/* Objetivo de la Rúbrica */}
      <div className={`rounded-lg p-4 mb-8 ${
        stats.avgClarity >= 4 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{stats.avgClarity >= 4 ? '✅' : '⚠️'}</span>
          <div>
            <div className="font-semibold text-gray-800">
              Objetivo de Rúbrica: Claridad ≥ 4.0/5.0
            </div>
            <div className="text-sm text-gray-600">
              Actual: {stats.avgClarity.toFixed(2)}/5.0 {' '}
              {stats.avgClarity >= 4 ? 
                '✅ ¡Objetivo cumplido!' : 
                `❌ Falta ${(4 - stats.avgClarity).toFixed(2)} puntos`
              }
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Respuestas */}
      {surveys.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Respuestas Recientes
          </h3>
          <div className="space-y-4">
            {surveys.slice().reverse().slice(0, 10).map((survey, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm text-gray-600">
                    {new Date(survey.timestamp).toLocaleString('es-ES')}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(survey.average)}`}>
                    {survey.average.toFixed(2)} / 5.0
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2 text-xs mb-2">
                  <div>🔍 {survey.clarity}/5</div>
                  <div>✨ {survey.ease}/5</div>
                  <div>⏱️ {survey.time}/5</div>
                  <div>😊 {survey.satisfaction}/5</div>
                  <div>👍 {survey.wouldRecommend}/5</div>
                </div>
                {survey.feedback && (
                  <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-2">
                    💬 "{survey.feedback}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {surveys.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No hay encuestas registradas aún.
        </div>
      )}
    </div>
  )
}

function MetricCard({ title, score, emoji }: { title: string; score: number; emoji: string }) {
  const getColor = (score: number) => {
    if (score >= 4) return 'bg-green-100 border-green-300'
    if (score >= 3) return 'bg-yellow-100 border-yellow-300'
    return 'bg-red-100 border-red-300'
  }

  return (
    <div className={`border-2 rounded-lg p-4 ${getColor(score)}`}>
      <div className="text-2xl mb-2">{emoji}</div>
      <div className="text-xs text-gray-600 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-800">
        {score.toFixed(1)}
        <span className="text-sm text-gray-500">/5</span>
      </div>
    </div>
  )
}
