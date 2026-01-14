// app/[locale]/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import VideoPlayer from '@/components/VideoPlayer'

export default function Home() {
  const [activeForm, setActiveForm] = useState<'login' | 'register'>('login')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null)
  const [searchNotFound, setSearchNotFound] = useState(false)
  const t = useTranslations('home')
  const tc = useTranslations('common')

  // Referencias a las secciones
  const heroRef = useRef<HTMLElement>(null)
  const audienceRef = useRef<HTMLElement>(null)
  const howItWorksRef = useRef<HTMLElement>(null)
  const featuresRef = useRef<HTMLElement>(null)
  const ctaRef = useRef<HTMLElement>(null)

  // Mapa de búsqueda: keywords -> sección
  const searchMap: Record<string, { ref: React.RefObject<HTMLElement | null>, keywords: string[] }> = {
    hero: {
      ref: heroRef,
      keywords: ['inicio', 'home', 'talent', 'ai', 'reclutamiento', 'inteligente', 'ia', 'principal', 'empezar', 'comenzar']
    },
    audience: {
      ref: audienceRef,
      keywords: ['empresas', 'companies', 'candidatos', 'candidates', 'agencias', 'agencies', 'para quien', 'usuarios', 'roles', 'perfiles']
    },
    howItWorks: {
      ref: howItWorksRef,
      keywords: ['como funciona', 'how it works', 'proceso', 'pasos', 'steps', 'sube', 'upload', 'analiza', 'analyze', 'decide', 'contratar']
    },
    features: {
      ref: featuresRef,
      keywords: ['tecnología', 'technology', 'ia', 'ai', 'nlp', 'machine learning', 'computer vision', 'características', 'features', 'avanzado']
    },
    cta: {
      ref: ctaRef,
      keywords: ['registrarse', 'register', 'sign up', 'comenzar', 'start', 'prueba', 'trial', 'gratis', 'free', 'unirse', 'join']
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query.toLowerCase())
    setSearchNotFound(false)
    
    if (!query.trim()) {
      setHighlightedSection(null)
      return
    }

    // Buscar en el mapa de palabras clave
    const foundSection = Object.entries(searchMap).find(([_, config]) =>
      config.keywords.some(keyword => keyword.includes(query.toLowerCase()) || query.toLowerCase().includes(keyword))
    )

    if (foundSection) {
      const [sectionName, config] = foundSection
      setHighlightedSection(sectionName)
      
      // Scroll suave a la sección con offset para el header
      setTimeout(() => {
        const element = config.ref.current
        if (element) {
          const yOffset = -80 // Offset para el header sticky
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
          window.scrollTo({ top: y, behavior: 'smooth' })
        }
      }, 100)

      // Limpiar highlight después de 4 segundos
      setTimeout(() => {
        setHighlightedSection(null)
      }, 4000)
    } else {
      setHighlightedSection(null)
      setSearchNotFound(true)
      
      // Limpiar mensaje de "no encontrado" después de 3 segundos
      setTimeout(() => {
        setSearchNotFound(false)
      }, 3000)
    }
  }

  // Sugerencias de búsqueda basadas en el contenido
  const searchSuggestions = [
    'Empresas',
    'Candidatos',
    'Agencias',
    'Cómo funciona',
    'Tecnología IA',
    'Machine Learning',
    'Registrarse',
    'Características'
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      <Header 
        onAuthClick={() => setShowAuthModal(true)} 
        showSearch={true}
        onSearch={handleSearch}
        searchSuggestions={searchSuggestions}
      />
      
      <main className="flex-grow">
        {/* Notificación de búsqueda no encontrada */}
        {searchNotFound && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
            <div className="bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-700 rounded-lg shadow-xl px-6 py-4 flex items-center gap-3">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">No se encontró contenido</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Intenta con: empresas, candidatos, IA, cómo funciona</p>
              </div>
              <button 
                onClick={() => setSearchNotFound(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Hero Section - Mejorada */}
        <section 
          ref={heroRef}
          className={`relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-24 overflow-hidden transition-all duration-500 ${
            highlightedSection === 'hero' ? 'ring-4 ring-yellow-400 ring-offset-4' : ''
          }`}
        >
          {/* Background Elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-5xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-blue-300 text-sm font-medium">{t('hero.badge')}</span>
              </div>

              <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {t('hero.title')}
                </span>
              </h1>
              <p className="text-2xl md:text-3xl text-blue-100 mb-6 leading-relaxed font-light">
                {t('hero.subtitle')}
              </p>
              <p className="text-lg text-blue-200/80 mb-12 max-w-3xl mx-auto leading-relaxed">
                {t('hero.description')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="group relative bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-5 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-105"
                >
                  <span className="relative z-10">{tc('startFree')}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl"></div>
                </button>
                <button className="group border-2 border-blue-400/30 hover:border-blue-400/60 text-blue-100 hover:text-white px-10 py-5 rounded-2xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm hover:bg-blue-500/10">
                  <span className="flex items-center gap-2">
                    {tc('viewDemo')}
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-blue-500/20 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">98%</div>
                  <div className="text-sm text-blue-300">{t('hero.stats.accuracy')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">5x</div>
                  <div className="text-sm text-blue-300">{t('hero.stats.faster')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">500+</div>
                  <div className="text-sm text-blue-300">{t('hero.stats.companies')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Video Section - Cómo hacer atractivo tu CV */}
        <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-2 mb-4">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                <span className="text-blue-700 dark:text-blue-300 text-sm font-semibold">{t('video.badge')}</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                {t('video.title')} 
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"> {t('video.titleHighlight')}</span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-gray-300 max-w-3xl mx-auto">
                {t('video.subtitle')}
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <VideoPlayer 
                src="/Cómo hacer atractivo tu C.V. y destaque para los reclutadores y los ATS este 2024.mp4"
                title={t('video.videoTitle')}
                className="shadow-2xl"
              />
              
              <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {t('video.accessibilityNotice.title')}
                    </h3>
                    <p className="text-slate-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: t('video.accessibilityNotice.description').replace('subtítulos automáticos', '<strong>subtítulos automáticos</strong>').replace('automatic captions', '<strong>automatic captions</strong>') }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Target Audience Section - Mejorada */}
        <section 
          ref={audienceRef}
          id="audience"
          className={`py-20 bg-slate-50 dark:bg-gray-800 transition-all duration-500 ${
            highlightedSection === 'audience' ? 'ring-4 ring-yellow-400 ring-offset-4 bg-yellow-50 dark:bg-yellow-900/20' : ''
          }`}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                {t('audience.title')}
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"> {t('audience.titleHighlight')}</span>
              </h2>
              <p className="text-xl text-slate-600 dark:text-gray-300 max-w-3xl mx-auto">
                {t('audience.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Empresas */}
              <div className="group relative bg-white dark:bg-gray-900 rounded-3xl p-8 border border-slate-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/25">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('audience.companies.title')}</h3>
                  <p className="text-slate-600 dark:text-gray-300 mb-6">{t('audience.companies.description')}</p>
                  <ul className="space-y-3">
                    {t.raw('audience.companies.features').map((feature: string, index: number) => (
                      <li key={index} className="flex items-center text-slate-700 dark:text-gray-300">
                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Candidatos */}
              <div className="group relative bg-white dark:bg-gray-900 rounded-3xl p-8 border border-slate-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 dark:from-green-900/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/25">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('audience.candidates.title')}</h3>
                  <p className="text-slate-600 dark:text-gray-300 mb-6">{t('audience.candidates.description')}</p>
                  <ul className="space-y-3">
                    {t.raw('audience.candidates.features').map((feature: string, index: number) => (
                      <li key={index} className="flex items-center text-slate-700 dark:text-gray-300">
                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Agencias */}
              <div className="group relative bg-white dark:bg-gray-900 rounded-3xl p-8 border border-slate-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 dark:from-purple-900/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/25">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('audience.agencies.title')}</h3>
                  <p className="text-slate-600 dark:text-gray-300 mb-6">{t('audience.agencies.description')}</p>
                  <ul className="space-y-3">
                    {t.raw('audience.agencies.features').map((feature: string, index: number) => (
                      <li key={index} className="flex items-center text-slate-700 dark:text-gray-300">
                        <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - Mejorada */}
        <section 
          ref={howItWorksRef}
          id="how-it-works"
          className={`py-20 bg-white dark:bg-gray-900 transition-all duration-500 ${
            highlightedSection === 'howItWorks' ? 'ring-4 ring-yellow-400 ring-offset-4 bg-yellow-50 dark:bg-yellow-900/20' : ''
          }`}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                {t('howItWorks.title')}
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"> {t('howItWorks.titleHighlight')}</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  step: "1",
                  title: t('howItWorks.steps.upload.title'),
                  description: t('howItWorks.steps.upload.description'),
                  icon: "📄",
                  color: "blue"
                },
                {
                  step: "2",
                  title: t('howItWorks.steps.analyze.title'),
                  description: t('howItWorks.steps.analyze.description'),
                  icon: "🔍",
                  color: "purple"
                },
                {
                  step: "3",
                  title: t('howItWorks.steps.decide.title'),
                  description: t('howItWorks.steps.decide.description'),
                  icon: "✅",
                  color: "green"
                }
              ].map((item, index) => (
                <div key={index} className="group text-center">
                  <div className="relative">
                    <div className={`w-24 h-24 bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-${item.color}-500/25`}>
                      <span className="text-3xl">{item.icon}</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{item.title}</h3>
                  <p className="text-slate-600 dark:text-gray-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Features Section - Nueva */}
        <section 
          ref={featuresRef}
          id="features"
          className={`py-20 bg-gradient-to-br from-slate-900 to-blue-900 transition-all duration-500 ${
            highlightedSection === 'features' ? 'ring-4 ring-yellow-400 ring-offset-4' : ''
          }`}
        >
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                {t('aiFeatures.title')} 
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> {t('aiFeatures.titleHighlight')}</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                { name: t('aiFeatures.technologies.nlp.name'), desc: t('aiFeatures.technologies.nlp.description') },
                { name: t('aiFeatures.technologies.ml.name'), desc: t('aiFeatures.technologies.ml.description') },
                { name: t('aiFeatures.technologies.cv.name'), desc: t('aiFeatures.technologies.cv.description') },
                { name: t('aiFeatures.technologies.analytics.name'), desc: t('aiFeatures.technologies.analytics.description') }
              ].map((tech, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center group hover:bg-white/10 transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                  </div>
                  <h4 className="text-lg font-semibold text-white mb-2">{tech.name}</h4>
                  <p className="text-blue-200/80 text-sm">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Mejorada */}
        <section 
          ref={ctaRef}
          id="cta"
          className={`py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 relative overflow-hidden transition-all duration-500 ${
            highlightedSection === 'cta' ? 'ring-4 ring-yellow-400 ring-offset-4' : ''
          }`}
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000')] bg-cover bg-center opacity-10"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('cta.title')}
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {t('cta.subtitle')}
            </p>
            <button 
              onClick={() => setShowAuthModal(true)}
              className="group bg-white text-blue-600 hover:bg-slate-100 px-12 py-5 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-2xl transform hover:scale-105"
            >
              <span className="flex items-center gap-3">
                {t('cta.button')} 
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </div>
        </section>
      </main>

      <Footer />

      {/* Auth Modal - Mejorada */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full mx-auto border border-slate-200 dark:border-gray-700">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {activeForm === 'login' ? tc('login') : tc('register')}
                </h3>
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex bg-slate-100 dark:bg-gray-700 rounded-2xl p-1 mb-8">
                <button
                  className={`flex-1 py-3 text-center font-medium text-sm rounded-xl transition-all duration-300 ${
                    activeForm === 'login'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white'
                  }`}
                  onClick={() => setActiveForm('login')}
                >
                  {tc('login').toUpperCase()}
                </button>
                <button
                  className={`flex-1 py-3 text-center font-medium text-sm rounded-xl transition-all duration-300 ${
                    activeForm === 'register'
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white'
                  }`}
                  onClick={() => setActiveForm('register')}
                >
                  {tc('register').toUpperCase()}
                </button>
              </div>

              <div className="pt-2">
                {activeForm === 'login' ? <LoginForm /> : <RegisterForm />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}