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
  const [language, setLanguage] = useState<'es' | 'en'>('es')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const t = useTranslations('common')

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es')
  }

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
                TalentAI
              </h1>
            </div>
          </div>

          {/* Idioma y Navegación simple */}
          <div className="flex items-center space-x-4">
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