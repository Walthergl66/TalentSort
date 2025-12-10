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

export default function Header({ onAuthClick, showSearch = false, onSearch, searchSuggestions = [] }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const t = useTranslations('common')
  const th = useTranslations('header')

  const handleSearch = (query: string) => {
    if (onSearch) {
      onSearch(query)
    }
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo y Nombre */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {th('talentAI')}
              </h1>
            </div>
          </div>

          {/* Barra de búsqueda central (solo en desktop cuando showSearch=true) */}
          {showSearch && (
            <div className="hidden lg:block flex-1 max-w-xl mx-4">
              <SearchBar
                onSearch={handleSearch}
                suggestions={searchSuggestions}
                variant="compact"
                showSuggestions={true}
              />
            </div>
          )}

          {/* Navegación y acciones */}
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex items-center space-x-6" aria-label={th('mainNavigation')}>
              <a href="#audience" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                {th('features')}
              </a>
              <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                {th('howItWorks')}
              </a>
              <a href="#cta" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                {th('contact')}
              </a>
            </nav>

            {/* Botón de búsqueda móvil */}
            {showSearch && (
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={th('openSearch')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}
            
            <LanguageSelector />

            {/* Botón de autenticación */}
            <button
              onClick={() => onAuthClick?.()}
              className="bg-blue-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
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
              suggestions={searchSuggestions}
              variant="default"
              autoFocus
            />
          </div>
        )}
      </div>
    </header>
  )
}