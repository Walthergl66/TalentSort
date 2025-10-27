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

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
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
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex">
        {/* Navegación lateral */}
        <NavigationMenu 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          profile={profile}
        />

        {/* Contenido principal */}
        <main 
          className={`flex-1 transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
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

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}