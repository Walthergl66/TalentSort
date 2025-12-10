// components/Header.tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import LanguageSelector from './LanguageSelector'
import SearchBar from './SearchBar'

type HeaderProps = {
  onAuthClick?: () => void
  showSearch?: boolean
  onSearch?: (query: string) => void
  searchSuggestions?: string[]
}

export default function Header({ 
  onAuthClick, 
  showSearch = false, 
  onSearch,
  searchSuggestions 
}: HeaderProps) {
  const t = useTranslations('common')
  const router = useRouter()
  const pathname = usePathname()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const handleSearch = (query: string) => {
    // Si se proporciona una función onSearch personalizada, usarla
    if (onSearch) {
      onSearch(query)
      return
    }

    // Si estamos en la página principal, podemos hacer scroll a una sección
    // o redirigir a una página de resultados
    if (pathname === '/' || pathname.endsWith('/en') || pathname.endsWith('/es')) {
      console.log('Búsqueda en home:', query)
    } else {
      // Si estamos en dashboard, podríamos redirigir a candidatos con búsqueda
      console.log('Búsqueda global:', query)
    }
  }

  // Sugerencias de búsqueda: usar las personalizadas o las por defecto
  const suggestions = searchSuggestions || [
    'React Developer',
    'Python Engineer',
    'UX Designer',
    'Product Manager',
    'Data Scientist',
    'DevOps Engineer'
  ]

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Nombre */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                TalentAI
              </h1>
            </div>
          </div>

          {/* Barra de búsqueda (centro, versión desktop) */}
          {showSearch && (
            <div className="hidden lg:block flex-1 max-w-2xl mx-8">
              <SearchBar
                onSearch={handleSearch}
                suggestions={suggestions}
                variant="compact"
              />
            </div>
          )}

          {/* Idioma y Navegación simple */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Botón de búsqueda móvil */}
            {showSearch && (
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Abrir búsqueda"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}

            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                {t('features')}
              </a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                {t('pricing')}
              </a>
              <a href="#contact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                {t('contact')}
              </a>
            </nav>
            
            <LanguageSelector />

            {/* Botón opcional para abrir modal de autenticación si se proporciona la prop */}
            <button
              onClick={() => onAuthClick?.()}
              className="ml-2 bg-blue-600 text-white px-3 py-1 text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              {t('login')}
            </button>
          </div>
        </div>

        {/* Barra de búsqueda móvil (desplegable) */}
        {showSearch && isSearchOpen && (
          <div className="lg:hidden pb-4 border-t border-gray-100 pt-4 mt-2">
            <SearchBar
              onSearch={handleSearch}
              suggestions={suggestions}
              variant="default"
              autoFocus
            />
          </div>
        )}
      </div>
    </header>
  )
}