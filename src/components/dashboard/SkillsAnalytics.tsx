'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SkillsAnalytics() {
  const [skillsData, setSkillsData] = useState<any[]>([])
  const [marketDemand, setMarketDemand] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSkillsData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Obtener habilidades del perfil del usuario
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('languages')
          .eq('user_id', user.id)
          .single()

        // Obtener demanda del mercado (habilidades más buscadas en trabajos activos)
        const { data: jobVacancies } = await supabase
          .from('job_vacancies')
          .select('skills_required')
          .eq('status', 'open')

        if (!jobVacancies || jobVacancies.length === 0) {
          setMarketDemand([])
          setLoading(false)
          return
        }

        // Procesar demanda del mercado
        const demandStats: Record<string, { demand: number; jobs: number }> = {}
        
        jobVacancies.forEach(job => {
          const skills = Array.isArray(job.skills_required) ? job.skills_required : []
          
          skills.forEach((skill: string) => {
            const normalizedSkill = skill.toLowerCase().trim()
            if (!demandStats[normalizedSkill]) {
              demandStats[normalizedSkill] = { demand: 0, jobs: 0 }
            }
            demandStats[normalizedSkill].demand++
            demandStats[normalizedSkill].jobs++
          })
        })

        // Crear array ordenado
        const userSkills = Array.isArray(userProfile?.languages) ? userProfile.languages : []
        const demandArray = Object.entries(demandStats)
          .map(([skill, stats]) => ({
            name: skill.charAt(0).toUpperCase() + skill.slice(1),
            demand: stats.demand,
            percentage: Math.round((stats.demand / jobVacancies.length) * 100),
            userHasSkill: userSkills.some(s => s.toLowerCase() === skill),
            avgSalary: 45000 + (stats.demand * 2500) // Estimación basada en demanda
          }))
          .sort((a, b) => b.demand - a.demand)

        setMarketDemand(demandArray.slice(0, 10))
        setSkillsData(userProfile?.skills || [])
      } catch (error) {
        console.error('Error fetching skills data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSkillsData()
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Análisis del Mercado Laboral
        </h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Actualizar mis habilidades
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Market Demand Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Habilidades Más Demandadas en el Mercado
          </h4>
          <div className="space-y-3">
            {marketDemand.slice(0, 8).map((skill, index) => (
              <div key={index} className="flex items-center">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {skill.name}
                      </span>
                      {skill.userHasSkill && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Tienes esta skill
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {skill.demand} empleos
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        skill.userHasSkill ? 'bg-green-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(skill.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Salary Potential */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            Potencial Salarial por Habilidad
          </h4>
          <div className="space-y-4">
            {marketDemand
              .slice(0, 6)
              .sort((a, b) => b.avgSalary - a.avgSalary)
              .map((skill, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    skill.userHasSkill ? 'bg-green-400' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {skill.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    ${skill.avgSalary.toLocaleString()}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Salario promedio
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {skillsData.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tus habilidades
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {marketDemand.filter(skill => skill.userHasSkill).length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Skills demandadas que tienes
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {marketDemand.length > 0 ? Math.round(marketDemand.filter(skill => skill.userHasSkill).reduce((acc, skill) => acc + skill.avgSalary, 0) / Math.max(1, marketDemand.filter(skill => skill.userHasSkill).length)) : 0}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Potencial salarial promedio
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {marketDemand.length - marketDemand.filter(skill => skill.userHasSkill).length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Skills por aprender
            </p>
          </div>
        </div>
      </div>

      {/* Insights */}
      {marketDemand.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Recomendaciones Personales
          </h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>{marketDemand[0]?.name}</strong> es la habilidad más demandada ({marketDemand[0]?.demand} empleos disponibles)</li>
            {marketDemand.find(skill => skill.userHasSkill && skill.avgSalary > 50000) && (
              <li>• Tienes habilidades de alto valor como <strong>{marketDemand.find(skill => skill.userHasSkill && skill.avgSalary > 50000)?.name}</strong></li>
            )}
            <li>• Considera aprender <strong>{marketDemand.find(skill => !skill.userHasSkill)?.name}</strong> para mejorar tu perfil</li>
          </ul>
        </div>
      )}
    </div>
  )
}