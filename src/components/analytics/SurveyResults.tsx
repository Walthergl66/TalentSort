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
    if (score >= 4.5) return 'Excelente'
    if (score >= 4) return 'Bueno'
    if (score >= 3) return 'Regular'
    return 'Mejorable'
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Resultados de Encuestas Post-Registro
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
          />
          <MetricCard
            title="Facilidad"
            score={stats.avgEase}
          />
          <MetricCard
            title="Tiempo"
            score={stats.avgTime}
          />
          <MetricCard
            title="Satisfacción"
            score={stats.avgSatisfaction}
          />
          <MetricCard
            title="Recomendación"
            score={stats.avgRecommendation}
          />
        </div>
      </div>

      {/* Objetivo de la Rúbrica */}
      <div className={`rounded-lg p-4 mb-8 ${
        stats.avgClarity >= 4 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-center gap-2">
          {stats.avgClarity >= 4 ? (
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          <div>
            <div className="font-semibold text-gray-800">
              Objetivo de Rúbrica: Claridad ≥ 4.0/5.0
            </div>
            <div className="text-sm text-gray-600">
              Actual: {stats.avgClarity.toFixed(2)}/5.0 {' '}
              {stats.avgClarity >= 4 ? 
                'Objetivo cumplido' : 
                `Falta ${(4 - stats.avgClarity).toFixed(2)} puntos`
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
                  <div>Claridad: {survey.clarity}/5</div>
                  <div>Facilidad: {survey.ease}/5</div>
                  <div>Tiempo: {survey.time}/5</div>
                  <div>Satisfacción: {survey.satisfaction}/5</div>
                  <div>Recomendación: {survey.wouldRecommend}/5</div>
                </div>
                {survey.feedback && (
                  <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-2">
                    "{survey.feedback}"
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

function MetricCard({ title, score }: { title: string; score: number }) {
  const getColor = (score: number) => {
    if (score >= 4) return 'bg-green-100 border-green-300 text-green-700'
    if (score >= 3) return 'bg-yellow-100 border-yellow-300 text-yellow-700'
    return 'bg-red-100 border-red-300 text-red-700'
  }

  const getIconColor = (score: number) => {
    if (score >= 4) return 'text-green-600'
    if (score >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className={`border-2 rounded-lg p-4 ${getColor(score)}`}>
      <div className="mb-2">
        <svg className={`w-6 h-6 ${getIconColor(score)}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <div className="text-xs text-gray-600 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-800">
        {score.toFixed(1)}
        <span className="text-sm text-gray-500">/5</span>
      </div>
    </div>
  )
}
