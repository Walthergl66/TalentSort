'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import NavigationMenu from '@/components/dashboard/NavigationMenu'
import TopBar from '@/components/dashboard/TopBar'
import AccessibilityMenu from '@/components/Accesibilidad/AccessibilityMenu'
import SkipLink from '@/components/Accesibilidad/SkipLink'
import TimeoutExtender from '@/components/Accesibilidad/TimeoutExtender'
import UsabilitySurveyManager from '@/components/usability/UsabilitySurveyManager'

interface DashboardLayoutProps {
  children: React.ReactNode
  user: any
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  const handleMouseEnter = () => {
    setSidebarOpen(true)
  }

  const handleMouseLeave = () => {
    setSidebarOpen(false)
  }

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setProfile(data)
      }
    }

    fetchProfile()
  }, [user])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* WCAG 2.4.1 - Skip Links */}
      <SkipLink />

      {/* WCAG 2.2.1 - Timeout Extender */}
      <TimeoutExtender 
        warningTime={120} // 2 minutos antes de expirar
        totalTime={1800} // 30 minutos total
        onTimeout={() => {
          // Redirigir al login o mostrar mensaje
          window.location.href = '/auth/login'
        }}
        onExtend={() => {
          // Renovar sesión con Supabase
          supabase.auth.refreshSession()
        }}
      />

      {/* Barra superior */}
      <TopBar 
        user={user} 
        profile={profile}
      />

      <div className="flex">
        {/* Navegación lateral - Solo renderizar cuando el perfil esté cargado */}
        {profile && (
          <NavigationMenu 
            isOpen={sidebarOpen}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            profile={profile}
          />
        )}

        {/* Contenido principal */}
        <main 
          id="main-content"
          className={`flex-1 transition-all duration-300 ease-in-out ${
            profile && sidebarOpen ? 'lg:ml-64' : profile ? 'lg:ml-16' : ''
          }`}
          role="main"
          aria-label="Contenido principal"
          tabIndex={-1}
        >
          {/* Área de contenido con padding responsive */}
          <div className="pt-16">
            {children}
          </div>
        </main>
      </div>

      {/* Menú de accesibilidad - WCAG Multiple Criteria */}
      <AccessibilityMenu />

      {/* Sistema de evaluación de usabilidad - CSAT, NASA-TLX, SUS */}
      {user && profile && (
        <UsabilitySurveyManager
          userId={user.id}
          userRole={profile.role}
          enabled={true}
        />
      )}
    </div>
  )
}