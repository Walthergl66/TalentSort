'use client'

import { Fragment } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase'

interface TopBarProps {
  user: any
  profile: any
}

export default function TopBar({ user, profile }: TopBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('topBar')
  const tp = useTranslations('topBar.pages')
  const tpr = useTranslations('profile.subscriptionTiers')

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getPageTitle = () => {
    if (pathname.includes('/candidates')) return tp('candidates')
    if (pathname.includes('/positions')) return tp('positions')
    if (pathname.includes('/analytics')) return tp('analytics')
    if (pathname.includes('/settings')) return tp('settings')
    if (pathname === '/dashboard') return tp('dashboard')
    return tp('dashboard')
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Lado izquierdo - Título */}
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-gray-900">
              {getPageTitle()}
            </h1>
          </div>

          {/* Lado derecho - Notificaciones y perfil */}
          <div className="flex items-center space-x-4">
            {/* Botón de notificaciones */}
            <button
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={t('notifications')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 3a9 9 0 11-9 9 9 9 0 019-9z" />
              </svg>
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
            </button>

            {/* Menú de perfil */}
            <div className="relative group">
              <button
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={t('userMenu')}
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {profile?.role === 'company'
                      ? (profile?.company_name?.charAt(0)?.toUpperCase() || 'E')
                      : (profile?.full_name?.charAt(0)?.toUpperCase() || 'U')}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {profile?.role === 'company'
                      ? (profile?.company_name || tpr('company'))
                      : (profile?.full_name || tpr('user'))}
                  </p>
                  <p className="text-xs text-gray-500">
                    {profile?.role === 'company' ? tpr('company') : tpr('user')}
                  </p>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown del perfil */}
              <div className="absolute right-0 mt-0 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
                <div className="py-1 mt-2">
                  <button
                    onClick={() => router.push('/dashboard/settings')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {tp('settings')}
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/profile')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {t('profile')}
                  </button>
                  <div className="border-t border-gray-100"></div>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    {t('logout')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}