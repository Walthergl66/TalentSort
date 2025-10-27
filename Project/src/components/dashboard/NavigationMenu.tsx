'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

interface NavigationMenuProps {
  isOpen: boolean
  onClose: () => void
  profile: any
}

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
      </svg>
    ),
    description: 'Resumen de mi perfil'
  },
  {
    name: 'Mi CV',
    href: '/dashboard/cv',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    description: 'Gestionar mis CVs'
  },
  {
    name: 'Buscar Trabajos',
    href: '/dashboard/jobs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    description: 'Explorar oportunidades'
  },
  {
    name: 'Mis Postulaciones',
    href: '/dashboard/applications',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h2a2 2 0 012 2v1m-6 0h6m-6 0l1 10a2 2 0 002 2h4a2 2 0 002-2l1-10" />
      </svg>
    ),
    description: 'Estado de aplicaciones'
  },
  {
    name: 'Mi Perfil',
    href: '/dashboard/profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    description: 'Información personal'
  },
  {
    name: 'Vista Previa',
    href: '/dashboard/profile/preview',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    description: 'Cómo me ven los reclutadores'
  },
  {
    name: 'Configuración',
    href: '/dashboard/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    description: 'Preferencias del sistema'
  }
]

export default function NavigationMenu({ isOpen, onClose, profile }: NavigationMenuProps) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <>
      {/* Sidebar */}
      <nav
        className={`fixed top-16 left-0 z-20 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64' : 'w-16'
        }`}
        role="navigation"
        aria-label="Navegación principal"
      >
        <div className="flex flex-col h-full">
          {/* Logo/Título */}
          <div className="px-4 py-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              {isOpen && (
                <span className="ml-3 text-lg font-semibold text-gray-900">
                  Talent AI
                </span>
              )}
            </div>
          </div>

          {/* Información del usuario */}
          {isOpen && profile && (
            <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {profile.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {profile.full_name || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {profile.subscription_tier === 'free' ? 'Plan Gratuito' : 
                     profile.subscription_tier === 'pro' ? 'Plan Pro' : 'Plan Enterprise'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Items de navegación */}
          <div className="flex-1 px-2 py-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href)
                    if (window.innerWidth < 1024) onClose()
                  }}
                  className={`w-full group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={!isOpen ? item.name : undefined}
                >
                  <span className={`${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`}>
                    {item.icon}
                  </span>
                  {isOpen && (
                    <div className="ml-3">
                      <span>{item.name}</span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Acciones rápidas en el sidebar */}
          {isOpen && (
            <div className="border-t border-gray-200 p-4">
              <button
                onClick={() => router.push('/dashboard/cv/upload')}
                className="w-full bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Subir CV
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}