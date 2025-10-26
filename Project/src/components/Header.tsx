// components/Header.tsx
'use client'

import { useState } from 'react'

export default function Header() {
  const [language, setLanguage] = useState<'es' | 'en'>('es')

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es')
  }

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
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
          </div>
        </div>
      </div>
    </header>
  )
}