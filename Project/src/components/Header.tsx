// components/Header.tsx
'use client'

import { useState } from 'react'

type HeaderProps = {
  onAuthClick?: () => void
  onSearch?: (query: string) => void
}

export default function Header({ onAuthClick, onSearch }: HeaderProps) {
  const [language, setLanguage] = useState<'es' | 'en'>('es')
  const [searchQuery, setSearchQuery] = useState('')

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchQuery)
    }
  }

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo y Nombre */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-white-500 to-white-600 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src="/TALENTAI.png" 
                alt="AI Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                TalentAI
              </h1>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden lg:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar candidatos, habilidades, proyectos..."
                className="w-full px-4 py-2 pl-10 pr-4 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>

          {/* Idioma y Navegación simple */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Características
              </a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Precios
              </a>
              <a href="#contact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Contacto
              </a>
            </nav>
            
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-300 rounded-md"
            >
              <span>{language === 'es' ? 'ES' : 'EN'}</span>
            </button>

            {/* Botón opcional para abrir modal de autenticación si se proporciona la prop */}
            <button
              onClick={() => onAuthClick?.()}
              className="ml-2 bg-blue-600 text-white px-3 py-1 text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}