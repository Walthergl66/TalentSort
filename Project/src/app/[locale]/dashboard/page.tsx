'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import OverviewStats from '@/components/dashboard/OverviewStats'
import RecentActivity from '@/components/dashboard/RecentActivity'
import QuickActions from '@/components/dashboard/QuickActions'
import CandidatePipeline from '@/components/dashboard/CandidatePipeline'
import SkillsAnalytics from '@/components/dashboard/SkillsAnalytics'
import AccessibilityProvider from '@/components/Accesibilidad/AccessibilityProvider'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        console.log('Dashboard - checking auth:', { session: !!session, user: session?.user?.email, error })
        
        if (error) {
          console.error('Auth error in dashboard:', error)
          router.push('/?error=auth_error')
          return
        }
        
        if (!session) {
          console.log('No session found, redirecting to home')
          router.push('/')
          return
        }

        console.log('Session found, setting user:', session.user.email)
        setUser(session.user)
        setLoading(false)
      } catch (error) {
        console.error('Error checking auth:', error)
        router.push('/')
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Dashboard - auth state changed:', event, session?.user?.email)
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('User signed out or no session, redirecting to home')
          setUser(null)
          router.push('/')
        } else if (event === 'SIGNED_IN' && session) {
          console.log('User signed in, setting user data')
          setUser(session.user)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <AccessibilityProvider>
      <DashboardLayout user={user}>
        <div className="p-6 space-y-6">
          {/* Header con título y acciones rápidas */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900" role="banner">
                Mi Perfil Profesional
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Gestiona tu perfil y busca oportunidades laborales
              </p>
            </div>
            <QuickActions />
          </div>

          {/* Estadísticas principales */}
          <OverviewStats />

          {/* Grid principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Estado de postulaciones */}
            <div className="lg:col-span-2">
              <CandidatePipeline />
            </div>
            
            {/* Actividad reciente */}
            <div>
              <RecentActivity />
            </div>
          </div>

          {/* Análisis de habilidades */}
          <SkillsAnalytics />
        </div>
      </DashboardLayout>
    </AccessibilityProvider>
  )
}