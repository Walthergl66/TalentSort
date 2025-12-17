'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function OverviewStats() {
  const [stats, setStats] = useState({
    totalApplications: 0,
    appliedToday: 0,
    profileScore: 0,
    activeJobs: 0,
    interviewsScheduled: 0,
    offersReceived: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Total de postulaciones del usuario
        const { count: totalApplications } = await supabase
          .from('job_applications')
          .select('*', { count: 'exact', head: true })
          .eq('candidate_id', user.id)

        // Postulaciones de hoy
        const today = new Date().toISOString().split('T')[0]
        const { count: appliedToday } = await supabase
          .from('job_applications')
          .select('*', { count: 'exact', head: true })
          .eq('candidate_id', user.id)
          .gte('created_at', today)

        // Puntuación del perfil (basado en completitud del CV)
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('profile_completeness')
          .eq('user_id', user.id)
          .single()

        const profileScore = profileData?.profile_completeness || 0

        // Trabajos activos disponibles
        const { count: activeJobs } = await supabase
          .from('job_positions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')

        // Entrevistas programadas
        const { count: interviewsScheduled } = await supabase
          .from('job_applications')
          .select('*', { count: 'exact', head: true })
          .eq('candidate_id', user.id)
          .eq('status', 'interview_scheduled')

        // Ofertas recibidas
        const { count: offersReceived } = await supabase
          .from('job_applications')
          .select('*', { count: 'exact', head: true })
          .eq('candidate_id', user.id)
          .eq('status', 'offer_received')

        setStats({
          totalApplications: totalApplications || 0,
          appliedToday: appliedToday || 0,
          profileScore,
          activeJobs: activeJobs || 0,
          interviewsScheduled: interviewsScheduled || 0,
          offersReceived: offersReceived || 0
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statItems = [
    {
      name: 'Postulaciones',
      value: stats.totalApplications,
      change: stats.appliedToday > 0 ? `+${stats.appliedToday} hoy` : 'Sin actividad hoy',
      changeType: stats.appliedToday > 0 ? 'positive' : 'neutral' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      name: 'Aplicado Hoy',
      value: stats.appliedToday,
      change: stats.appliedToday > 0 ? 'Activo' : 'Sin actividad',
      changeType: stats.appliedToday > 0 ? 'positive' : 'neutral' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      name: 'Completitud Perfil',
      value: `${stats.profileScore}%`,
      change: stats.profileScore >= 80 ? 'Excelente' : stats.profileScore >= 60 ? 'Bien' : 'Mejorable',
      changeType: stats.profileScore >= 80 ? 'positive' : stats.profileScore >= 60 ? 'neutral' : 'negative' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      name: 'Trabajos Disponibles',
      value: stats.activeJobs,
      change: 'Actualizados',
      changeType: 'neutral' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
        </svg>
      )
    },
    {
      name: 'Entrevistas',
      value: stats.interviewsScheduled,
      change: stats.interviewsScheduled > 0 ? 'Programadas' : 'Ninguna',
      changeType: stats.interviewsScheduled > 0 ? 'positive' : 'neutral' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h2a2 2 0 012 2v1m-6 0h6m-6 0l1 10a2 2 0 002 2h4a2 2 0 002-2l1-10" />
        </svg>
      )
    },
    {
      name: 'Ofertas',
      value: stats.offersReceived,
      change: stats.offersReceived > 0 ? '¡Felicidades!' : 'Sigue intentando',
      changeType: stats.offersReceived > 0 ? 'positive' : 'neutral' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statItems.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <div className="text-blue-600">
                  {item.icon}
                </div>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">{item.name}</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">
                  {item.value}
                </p>
                <span
                  className={`ml-2 text-sm font-medium ${
                    item.changeType === 'positive'
                      ? 'text-green-600'
                      : item.changeType === 'negative'
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}
                >
                  {item.change}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}