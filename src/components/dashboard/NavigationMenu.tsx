'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface NavigationMenuProps {
  isOpen: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  profile: any
}

const getNavigationItems = (t: any, td: any, userRole: string) => {
  // Items para candidatos
  const candidateItems = [
    {
      name: 'Panel de Control',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
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
      name: 'Buscar Empleos',
      href: '/jobs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      description: 'Buscar ofertas de empleo'
    },
    {
      name: 'Mis Postulaciones',
      href: '/dashboard/applications',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
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
    }
  ]

  // Items para empresas
  const companyItems = [
    {
      name: 'Panel de Control',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      description: 'Vista general de reclutamiento'
    },
    {
      name: 'Mis Vacantes',
      href: '/dashboard/company/vacancies',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      description: 'Publicar y gestionar ofertas'
    },
    {
      name: 'Ver Postulantes',
      href: '/dashboard/company/applications',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      description: 'Candidatos por vacante'
    },
    {
      name: 'Ranking IA',
      href: '/dashboard/company/ranking',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Mejores candidatos con IA'
    },
    {
      name: 'Análisis IA',
      href: '/dashboard/company/analysis',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      description: 'Análisis detallado con IA'
    },
    {
      name: 'Estadísticas',
      href: '/dashboard/company/analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      description: 'Métricas de contratación'
    },
    {
      name: 'Buscar Talentos',
      href: '/dashboard/candidates',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      description: 'Buscar candidatos ideales'
    },
    {
      name: 'Mi Empresa',
      href: '/dashboard/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      description: 'Perfil de la empresa'
    }
  ]

  return userRole === 'company' ? companyItems : candidateItems
}

export default function NavigationMenu({ isOpen, onMouseEnter, onMouseLeave, profile }: NavigationMenuProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('navigation')
  const td = useTranslations('navigation.descriptions')
  const tp = useTranslations('profile.subscriptionTiers')
  const th = useTranslations('header')
  
  const navigationItems = getNavigationItems(t, td, profile.role)

  return (
    <>
      {/* Sidebar */}
      <nav
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`fixed top-16 left-0 z-20 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'w-64 shadow-lg' : 'w-16'
        }`}
        role="navigation"
        aria-label={th('mainNavigation')}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Título */}
          <div className="px-4 py-6 border-b border-gray-200 min-h-[88px] flex items-center">
            <div className="flex items-center min-w-[32px]">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span 
                className={`ml-3 text-lg font-semibold text-gray-900 whitespace-nowrap transition-opacity duration-300 ${
                  isOpen ? 'opacity-100' : 'opacity-0 w-0'
                }`}
              >
                {th('talentAI')}
              </span>
            </div>
          </div>

          {/* Información del usuario */}
          <div 
            className={`border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 transition-all duration-300 overflow-hidden ${
              isOpen ? 'px-4 py-4 opacity-100' : 'h-0 py-0 opacity-0'
            }`}
          >
            {profile && (
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                  <span className="text-sm font-medium text-white">
                    {profile.role === 'company' 
                      ? (profile.company_name?.charAt(0)?.toUpperCase() || 'E')
                      : (profile.full_name?.charAt(0)?.toUpperCase() || 'U')}
                  </span>
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {profile.role === 'company' 
                      ? (profile.company_name || tp('company'))
                      : (profile.full_name || tp('user'))}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {profile.role === 'company' ? tp('company') : tp('user')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Items de navegación */}
          <div className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              
              return (
                <button
                  key={item.name}
                  onClick={() => router.push(item.href)}
                  className={`w-full group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                  } ${!isOpen ? 'justify-center' : ''}`}
                  title={!isOpen ? item.name : undefined}
                >
                  <span className={`flex-shrink-0 transition-all duration-200 ${
                    isActive ? 'text-blue-600 scale-110' : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-105'
                  }`}>
                    {item.icon}
                  </span>
                  <div 
                    className={`ml-3 text-left min-w-0 transition-all duration-300 ${
                      isOpen ? 'opacity-100' : 'opacity-0 w-0 ml-0'
                    }`}
                  >
                    <span className="block truncate">{item.name}</span>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {item.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Acciones rápidas en el sidebar */}
          <div 
            className={`border-t border-gray-200 transition-all duration-300 overflow-hidden ${
              isOpen ? 'p-4 opacity-100' : 'h-0 p-0 opacity-0'
            }`}
          >
            {profile?.role === 'company' ? (
              <button
                onClick={() => router.push('/dashboard/company/vacancies/new')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Publicar Vacante
                </span>
              </button>
            ) : (
              <button
                onClick={() => router.push('/dashboard/cv/upload')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {tp('uploadCv')}
                </span>
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}