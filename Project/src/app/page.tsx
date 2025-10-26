// app/page.tsx
'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'

export default function Home() {
  const [activeForm, setActiveForm] = useState<'login' | 'register'>('login')

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section - Más minimalista */}
        <section className="bg-white border-b border-gray-100 py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Talent AI
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Encuentra al candidato perfecto con inteligencia artificial. 
                Analiza CVs, evalúa habilidades y optimiza tu proceso de reclutamiento.
              </p>
            </div>
          </div>
        </section>

        {/* Forms Section - Integrado con features */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                {/* Login/Register Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex border-b border-gray-200 mb-6">
                    <button
                      className={`flex-1 py-3 text-center font-medium text-sm ${
                        activeForm === 'login'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveForm('login')}
                    >
                      INICIAR SESIÓN
                    </button>
                    <button
                      className={`flex-1 py-3 text-center font-medium text-sm ${
                        activeForm === 'register'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveForm('register')}
                    >
                      REGISTRARSE
                    </button>
                  </div>

                  <div className="pt-2">
                    {activeForm === 'login' ? <LoginForm /> : <RegisterForm />}
                  </div>
                </div>

                {/* Features List - Más concisa */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Optimiza tu proceso de selección
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Análisis inteligente de CVs</h4>
                        <p className="text-sm text-gray-600 mt-1">Extracción automática de experiencia, habilidades y educación</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Clasificación por puntuación IA</h4>
                        <p className="text-sm text-gray-600 mt-1">Ranking automático basado en relevancia para el puesto</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Búsqueda semántica</h4>
                        <p className="text-sm text-gray-600 mt-1">Encuentra candidatos por habilidades y experiencia específica</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Dashboard analítico</h4>
                        <p className="text-sm text-gray-600 mt-1">Métricas y insights sobre tu pipeline de reclutamiento</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats minimalistas */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">85%</div>
                      <div className="text-xs text-gray-500 mt-1">Tiempo ahorrado</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">4.8x</div>
                      <div className="text-xs text-gray-500 mt-1">Más eficiencia</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">99%</div>
                      <div className="text-xs text-gray-500 mt-1">Precisión IA</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section - Minimalista */}
        <section className="py-12 bg-white border-t border-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">
                Confiado por equipos de RH en
              </h3>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                <div className="text-gray-400 font-semibold">TechCorp</div>
                <div className="text-gray-400 font-semibold">InnovateSA</div>
                <div className="text-gray-400 font-semibold">GlobalTech</div>
                <div className="text-gray-400 font-semibold">StartUpHub</div>
                <div className="text-gray-400 font-semibold">EnterpriseX</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}