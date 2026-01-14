"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AccessibilityProvider from '@/components/Accesibilidad/AccessibilityProvider'

/**
 * Panel de Administrador - Resultados de Usabilidad
 * Muestra estadísticas y resultados de CSAT, NASA-TLX y SUS
 */

interface UsabilityStats {
  csat: {
    total: number
    avgSatisfaction: number
    avgFacilidad: number
    avgExperiencia: number
    byRole: any[]
  }
  nasaTlx: {
    total: number
    avgMentalDemand: number
    avgFrustration: number
    avgPerformance: number
    topTasks: any[]
  }
  sus: {
    total: number
    avgScore: number
    byRole: any[]
    distribution: { range: string; count: number }[]
  }
}

export default function UsabilityDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<UsabilityStats | null>(null)
  const [selectedTab, setSelectedTab] = useState<'csat' | 'nasa-tlx' | 'sus'>('csat')

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/')
        return
      }

      setUser(session.user)

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (!profileData || profileData.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      setProfile(profileData)
      await fetchStats()
    }

    checkAuth()
  }, [router])

  const fetchStats = async () => {
    try {
      // CSAT Stats
      const { data: csatData } = await supabase
        .from('usability_csat')
        .select('*')

      // NASA-TLX Stats
      const { data: nasaData } = await supabase
        .from('usability_nasa_tlx')
        .select('*')

      // SUS Stats
      const { data: susData } = await supabase
        .from('usability_sus')
        .select('*')

      // Calculate statistics
      const csatStats = calculateCSATStats(csatData || [])
      const nasaStats = calculateNASAStats(nasaData || [])
      const susStats = calculateSUSStats(susData || [])

      setStats({
        csat: csatStats,
        nasaTlx: nasaStats,
        sus: susStats
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateCSATStats = (data: any[]) => {
    if (data.length === 0) return {
      total: 0,
      avgSatisfaction: 0,
      avgFacilidad: 0,
      avgExperiencia: 0,
      byRole: []
    }

    const total = data.length
    const avgSatisfaction = data.reduce((sum, r) => sum + (r.satisfaccion_global || 0), 0) / total
    const avgFacilidad = data.reduce((sum, r) => sum + (r.facilidad_uso || 0), 0) / total
    const avgExperiencia = data.reduce((sum, r) => sum + (r.experiencia_general || 0), 0) / total

    const roleGroups = data.reduce((acc, r) => {
      const role = r.user_role || 'unknown'
      if (!acc[role]) acc[role] = []
      acc[role].push(r)
      return acc
    }, {})

    const byRole = Object.entries(roleGroups).map(([role, responses]: [string, any]) => ({
      role,
      count: responses.length,
      avgScore: responses.reduce((sum: number, r: any) => sum + (r.satisfaccion_global || 0), 0) / responses.length
    }))

    return { total, avgSatisfaction, avgFacilidad, avgExperiencia, byRole }
  }

  const calculateNASAStats = (data: any[]) => {
    if (data.length === 0) return {
      total: 0,
      avgMentalDemand: 0,
      avgFrustration: 0,
      avgPerformance: 0,
      topTasks: []
    }

    const total = data.length
    const avgMentalDemand = data.reduce((sum, r) => sum + (r.demanda_mental || 0), 0) / total
    const avgFrustration = data.reduce((sum, r) => sum + (r.frustracion || 0), 0) / total
    const avgPerformance = data.reduce((sum, r) => sum + (r.rendimiento || 0), 0) / total

    const taskGroups = data.reduce((acc, r) => {
      const task = r.task_name || 'Unknown'
      if (!acc[task]) acc[task] = []
      acc[task].push(r)
      return acc
    }, {})

    const topTasks = Object.entries(taskGroups)
      .map(([task, responses]: [string, any]) => ({
        task,
        count: responses.length,
        avgMentalDemand: responses.reduce((sum: number, r: any) => sum + (r.demanda_mental || 0), 0) / responses.length,
        avgFrustration: responses.reduce((sum: number, r: any) => sum + (r.frustracion || 0), 0) / responses.length
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return { total, avgMentalDemand, avgFrustration, avgPerformance, topTasks }
  }

  const calculateSUSStats = (data: any[]) => {
    if (data.length === 0) return {
      total: 0,
      avgScore: 0,
      byRole: [],
      distribution: []
    }

    const total = data.length
    const avgScore = data.reduce((sum, r) => sum + (r.sus_score || 0), 0) / total

    const roleGroups = data.reduce((acc, r) => {
      const role = r.user_role || 'unknown'
      if (!acc[role]) acc[role] = []
      acc[role].push(r)
      return acc
    }, {})

    const byRole = Object.entries(roleGroups).map(([role, responses]: [string, any]) => ({
      role,
      count: responses.length,
      avgScore: responses.reduce((sum: number, r: any) => sum + (r.sus_score || 0), 0) / responses.length
    }))

    const distribution = [
      { range: '0-24 (Muy pobre)', count: data.filter(r => r.sus_score < 25).length },
      { range: '25-51 (Pobre)', count: data.filter(r => r.sus_score >= 25 && r.sus_score < 52).length },
      { range: '52-72 (Aceptable)', count: data.filter(r => r.sus_score >= 52 && r.sus_score < 73).length },
      { range: '73-84 (Bueno)', count: data.filter(r => r.sus_score >= 73 && r.sus_score < 85).length },
      { range: '85-100 (Excelente)', count: data.filter(r => r.sus_score >= 85).length }
    ]

    return { total, avgScore, byRole, distribution }
  }

  const getSUSColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 73) return 'text-blue-600'
    if (score >= 52) return 'text-yellow-600'
    if (score >= 25) return 'text-orange-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <AccessibilityProvider>
        <DashboardLayout user={user}>
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                📊 Dashboard de Usabilidad
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Resultados de evaluaciones CSAT, NASA-TLX y SUS
              </p>
            </div>
            <button
              onClick={fetchStats}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Actualizar
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-4">
              {['csat', 'nasa-tlx', 'sus'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab as any)}
                  className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                    selectedTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab === 'csat' && '😊 CSAT'}
                  {tab === 'nasa-tlx' && '🧠 NASA-TLX'}
                  {tab === 'sus' && '📋 SUS'}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          {stats && (
            <>
              {/* CSAT Tab */}
              {selectedTab === 'csat' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Respuestas</div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.csat.total}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Satisfacción Global</div>
                      <div className="text-3xl font-bold text-blue-600">{stats.csat.avgSatisfaction.toFixed(2)}/5</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Facilidad de Uso</div>
                      <div className="text-3xl font-bold text-green-600">{stats.csat.avgFacilidad.toFixed(2)}/5</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Experiencia General</div>
                      <div className="text-3xl font-bold text-purple-600">{stats.csat.avgExperiencia.toFixed(2)}/5</div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Por Rol de Usuario</h3>
                    <div className="space-y-3">
                      {stats.csat.byRole.map((role) => (
                        <div key={role.role} className="flex items-center justify-between">
                          <span className="text-gray-700 dark:text-gray-300 capitalize">{role.role}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{role.count} respuestas</span>
                            <span className="font-semibold text-blue-600">{role.avgScore.toFixed(2)}/5</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* NASA-TLX Tab */}
              {selectedTab === 'nasa-tlx' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Evaluaciones</div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.nasaTlx.total}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Demanda Mental</div>
                      <div className="text-3xl font-bold text-purple-600">{stats.nasaTlx.avgMentalDemand.toFixed(1)}/10</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Frustración</div>
                      <div className="text-3xl font-bold text-red-600">{stats.nasaTlx.avgFrustration.toFixed(1)}/10</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rendimiento</div>
                      <div className="text-3xl font-bold text-green-600">{stats.nasaTlx.avgPerformance.toFixed(1)}/10</div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Top 5 Tareas Evaluadas</h3>
                    <div className="space-y-3">
                      {stats.nasaTlx.topTasks.map((task, index) => (
                        <div key={task.task} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900 dark:text-white">{index + 1}. {task.task}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{task.count} evaluaciones</span>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <span className="text-purple-600">🧠 Demanda: {task.avgMentalDemand.toFixed(1)}</span>
                            <span className="text-red-600">😤 Frustración: {task.avgFrustration.toFixed(1)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUS Tab */}
              {selectedTab === 'sus' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-lg shadow-lg text-white">
                      <div className="text-sm mb-2">Puntaje SUS Promedio</div>
                      <div className="text-6xl font-bold mb-2">{stats.sus.avgScore.toFixed(1)}</div>
                      <div className="text-lg">
                        {stats.sus.avgScore >= 85 && '🟢 Excelente'}
                        {stats.sus.avgScore >= 73 && stats.sus.avgScore < 85 && '🔵 Bueno'}
                        {stats.sus.avgScore >= 52 && stats.sus.avgScore < 73 && '🟡 Aceptable'}
                        {stats.sus.avgScore >= 25 && stats.sus.avgScore < 52 && '🟠 Pobre'}
                        {stats.sus.avgScore < 25 && '🔴 Muy pobre'}
                      </div>
                      <div className="mt-4 text-sm opacity-90">
                        Promedio industria: ~68 puntos
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Distribución</h3>
                      <div className="space-y-3">
                        {stats.sus.distribution.map((dist) => (
                          <div key={dist.range}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-700 dark:text-gray-300">{dist.range}</span>
                              <span className="font-semibold text-gray-900 dark:text-white">{dist.count}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${(dist.count / stats.sus.total) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Por Rol de Usuario</h3>
                    <div className="space-y-3">
                      {stats.sus.byRole.map((role) => (
                        <div key={role.role} className="flex items-center justify-between">
                          <span className="text-gray-700 dark:text-gray-300 capitalize">{role.role}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{role.count} respuestas</span>
                            <span className={`font-bold text-xl ${getSUSColor(role.avgScore)}`}>
                              {role.avgScore.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {!stats && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No hay datos disponibles aún
            </div>
          )}
        </div>
      </DashboardLayout>
    </AccessibilityProvider>
  )
}
