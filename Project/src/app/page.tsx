// app/page.tsx
'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import { AccessibilityProvider } from '@/components/Accesibilidad/AccessibilityProvider'
import { AccessibilityMenu } from '@/components/Accesibilidad/AccessibilityMenu'

export default function Home() {
  const [activeForm, setActiveForm] = useState<'login' | 'register'>('login')
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <AccessibilityProvider>
      <div className="min-h-screen flex flex-col bg-white">
        <Header onAuthClick={() => setShowAuthModal(true)} />
        
        {/* Menú de Accesibilidad */}
        <AccessibilityMenu />
        
        <main className="flex-grow">
        {/* Hero Section - Mejorada */}
        <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-24 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-5xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-blue-300 text-sm font-medium">Potenciado por IA Avanzada</span>
              </div>

              <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Talent AI
                </span>
              </h1>
              <p className="text-2xl md:text-3xl text-blue-100 mb-6 leading-relaxed font-light">
                El futuro del reclutamiento inteligente
              </p>
              <p className="text-lg text-blue-200/80 mb-12 max-w-3xl mx-auto leading-relaxed">
                Transforma tu proceso de selección con nuestra plataforma de IA que analiza CVs, 
                evalúa candidatos y encuentra al talento perfecto en segundos.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="group relative bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-5 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-105"
                >
                  <span className="relative z-10">Comenzar Gratis</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl"></div>
                </button>
                <button className="group border-2 border-blue-400/30 hover:border-blue-400/60 text-blue-100 hover:text-white px-10 py-5 rounded-2xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm hover:bg-blue-500/10">
                  <span className="flex items-center gap-2">
                    Ver Demo 
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
                  <div className="text-sm text-blue-300">Precisión en análisis</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">5x</div>
                  <div className="text-sm text-blue-300">Más rápido</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">500+</div>
                  <div className="text-sm text-blue-300">Empresas</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Target Audience Section - Mejorada */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Diseñado para cada actor del 
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"> ecosistema de talento</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Una plataforma unificada que satisface las necesidades específicas de todos los participantes en el proceso de reclutamiento
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Empresas */}
              <div className="group relative bg-white rounded-3xl p-8 border border-slate-200 hover:border-blue-300 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/25">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Empresas</h3>
                  <p className="text-slate-600 mb-6">Encuentra al candidato ideal con nuestro sistema de matching inteligente</p>
                  <ul className="space-y-3">
                    {['Análisis masivo de CVs', 'Filtros por habilidades técnicas', 'Ranking automático IA', 'Integración con ATS'].map((feature, index) => (
                      <li key={index} className="flex items-center text-slate-700">
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
              <div className="group relative bg-white rounded-3xl p-8 border border-slate-200 hover:border-green-300 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-green-500/25">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Candidatos</h3>
                  <p className="text-slate-600 mb-6">Destaca entre la multitud y encuentra oportunidades que se ajusten a tu perfil</p>
                  <ul className="space-y-3">
                    {['Subida inteligente de CV', 'Análisis de perfil con IA', 'Recomendaciones personalizadas', 'Match con empresas'].map((feature, index) => (
                      <li key={index} className="flex items-center text-slate-700">
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
              <div className="group relative bg-white rounded-3xl p-8 border border-slate-200 hover:border-purple-300 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/25">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Agencias</h3>
                  <p className="text-slate-600 mb-6">Optimiza tu operación y escala tu negocio de reclutamiento</p>
                  <ul className="space-y-3">
                    {['Gestión masiva de talento', 'Analytics avanzados', 'Colaboración en equipo', 'Pipeline automation'].map((feature, index) => (
                      <li key={index} className="flex items-center text-slate-700">
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
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Transforma tu proceso en 
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent"> 3 pasos simples</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  step: "1",
                  title: "Sube & Procesa",
                  description: "Carga CVs en cualquier formato. Nuestra IA extrae automáticamente información clave como experiencia, habilidades y educación.",
                  icon: "📄",
                  color: "blue"
                },
                {
                  step: "2",
                  title: "Analiza & Evalúa",
                  description: "Algoritmos de IA avanzada analizan perfiles, calculan compatibilidad y generan puntuaciones inteligentes.",
                  icon: "🔍",
                  color: "purple"
                },
                {
                  step: "3",
                  title: "Decide & Contrata",
                  description: "Obtén insights accionables, rankings comparativos y recomendaciones para tomar la mejor decisión de contratación.",
                  icon: "🎯",
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
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Features Section - Nueva */}
        <section className="py-20 bg-gradient-to-br from-slate-900 to-blue-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Tecnología IA de 
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> última generación</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {[
                { name: "NLP Avanzado", desc: "Procesamiento de lenguaje natural para entender contextos" },
                { name: "Machine Learning", desc: "Modelos que mejoran con cada interacción" },
                { name: "Computer Vision", desc: "Análisis de documentos y formatos complejos" },
                { name: "Predictive Analytics", desc: "Predicción de éxito y retención" }
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
        <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000')] bg-cover bg-center opacity-10"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              ¿Listo para el futuro del reclutamiento?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Únete a las empresas más innovadoras que ya están transformando su forma de encontrar talento.
            </p>
            <button 
              onClick={() => setShowAuthModal(true)}
              className="group bg-white text-blue-600 hover:bg-slate-100 px-12 py-5 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-2xl transform hover:scale-105"
            >
              <span className="flex items-center gap-3">
                Comenzar Gratis 
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            <p className="text-blue-200/80 text-sm mt-4">
              Sin tarjeta de crédito • Prueba de 14 días
            </p>
          </div>
        </section>
      </main>

      <Footer />

      {/* Auth Modal - Mejorada */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-auto border border-slate-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900">
                  {activeForm === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
                </h3>
                <button 
                  onClick={() => setShowAuthModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex bg-slate-100 rounded-2xl p-1 mb-8">
                <button
                  className={`flex-1 py-3 text-center font-medium text-sm rounded-xl transition-all duration-300 ${
                    activeForm === 'login'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                  onClick={() => setActiveForm('login')}
                >
                  INICIAR SESIÓN
                </button>
                <button
                  className={`flex-1 py-3 text-center font-medium text-sm rounded-xl transition-all duration-300 ${
                    activeForm === 'register'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                  onClick={() => setActiveForm('register')}
                >
                  REGISTRARSE
                </button>
              </div>

              <div className="pt-2">
                {activeForm === 'login' ? <LoginForm onSwitchToRegister={() => setActiveForm('register')} /> : <RegisterForm onSwitchToLogin={() => setActiveForm('login')} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </AccessibilityProvider>
  )
}