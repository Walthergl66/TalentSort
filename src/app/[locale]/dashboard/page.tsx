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
  const [userRole, setUserRole] = useState<string | null>(null)

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

        // Obtener el rol del usuario desde user_profiles
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role, full_name')
          .eq('user_id', session.user.id)
          .maybeSingle()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          // Si no existe perfil, crear uno básico
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: session.user.id,
              email: session.user.email,
              role: 'candidate', // rol por defecto
              full_name: session.user.user_metadata?.full_name || ''
            })
            .select('role')
            .single()

          if (createError) {
            console.error('Error creating profile:', createError)
          } else if (newProfile) {
            setUserRole(newProfile.role)
          }
        } else if (profile) {
          console.log('User role:', profile.role)
          setUserRole(profile.role)
          
          // Redirigir según el rol
          if (profile.role === 'company') {
            console.log('Company user detected, redirecting to vacancies')
            router.push('/dashboard/company/vacancies')
            return
          }
        }
        
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white" role="banner">
                Mi Panel de Candidato
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Gestiona tus postulaciones y encuentra tu próxima oportunidad
              </p>
            </div>
            <QuickActions />
          </div>

          {/* Acciones rápidas principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/dashboard/cv/upload')}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Subir CV</h3>
                  <p className="text-sm text-blue-100">Actualiza tu currículum</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/jobs')}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Buscar Empleos</h3>
                  <p className="text-sm text-purple-100">Encuentra oportunidades</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/dashboard/profile')}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white p-6 rounded-xl shadow-lg transition-all transform hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Mi Perfil</h3>
                  <p className="text-sm text-green-100">Completa tu información</p>
                </div>
              </div>
            </button>
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

          {/* Tips para candidatos */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Consejos para destacar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Mantén tu CV actualizado</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Un CV actualizado aumenta tus posibilidades hasta un 40%</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Completa tu perfil al 100%</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Los perfiles completos reciben 3x más vistas</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Aplica regularmente</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Las aplicaciones activas reciben respuestas más rápidas</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg flex-shrink-0">
                  <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Personaliza tu aplicación</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Adapta tu CV a cada vacante específica</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AccessibilityProvider>
  )
}