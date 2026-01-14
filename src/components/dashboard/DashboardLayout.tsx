'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import NavigationMenu from '@/components/dashboard/NavigationMenu'
import TopBar from '@/components/dashboard/TopBar'
import AccessibilityMenu from '@/components/Accesibilidad/AccessibilityMenu'

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
    <div className="min-h-screen bg-gray-50">
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
          className={`flex-1 transition-all duration-300 ease-in-out ${
            profile && sidebarOpen ? 'lg:ml-64' : profile ? 'lg:ml-16' : ''
          }`}
          role="main"
        >
          {/* Área de contenido con padding responsive */}
          <div className="pt-16">
            {children}
          </div>
        </main>
      </div>

      {/* Menú de accesibilidad */}
      <AccessibilityMenu />
    </div>
  )
}