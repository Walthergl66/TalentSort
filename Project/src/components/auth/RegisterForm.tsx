// components/auth/RegisterForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import PostRegistrationSurvey, { SurveyResponses } from './PostRegistrationSurvey'
import TermsModal from '../legal/TermsModal'
import PrivacyModal from '../legal/PrivacyModal'
import Tooltip, { HelpIcon } from '@/components/common/Tooltip'

export default function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showSurvey, setShowSurvey] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Listener para abrir modal de privacidad desde el modal de términos
  useEffect(() => {
    const handleOpenPrivacy = () => {
      setShowTermsModal(false)
      setShowPrivacyModal(true)
    }
    window.addEventListener('openPrivacyModal', handleOpenPrivacy)
    return () => window.removeEventListener('openPrivacyModal', handleOpenPrivacy)
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' })
      return
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' })
      return
    }

    if (!formData.acceptTerms) {
      setMessage({ type: 'error', text: 'Debes aceptar los términos y condiciones' })
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            company_name: formData.company_name
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error

      if (data.user) {
        setMessage({ 
          type: 'success', 
          text: '¡Registro exitoso! Por favor, verifica tu email para confirmar la cuenta.' 
        })
        
        // Limpiar formulario
        setFormData({
          full_name: '',
          company_name: '',
          email: '',
          password: '',
          confirmPassword: '',
          acceptTerms: false
        })

        // Mostrar encuesta de satisfacción después de 1 segundo
        setTimeout(() => {
          setShowSurvey(true)
        }, 1000)
      }
      
    } catch (error: any) {
      console.error('Error en registro:', error)
      setMessage({ 
        type: 'error', 
        text: error.message || 'Error al registrarse. Intenta nuevamente.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSurveySubmit = async (responses: SurveyResponses) => {
    try {
      // Calcular promedio de satisfacción
      const average = (responses.clarity + responses.ease + responses.time + 
                      responses.satisfaction + responses.wouldRecommend) / 5

      // Guardar en localStorage para analytics (en producción, enviar a backend)
      const surveyData = {
        ...responses,
        average,
        timestamp: new Date().toISOString(),
        email: formData.email
      }
      
      const existingSurveys = JSON.parse(localStorage.getItem('registration_surveys') || '[]')
      existingSurveys.push(surveyData)
      localStorage.setItem('registration_surveys', JSON.stringify(existingSurveys))

      console.log('📊 Encuesta post-registro guardada:', surveyData)
      
      // En producción, aquí se enviaría a una API:
      // await fetch('/api/surveys/registration', {
      //   method: 'POST',
      //   body: JSON.stringify(surveyData)
      // })
      
    } catch (error) {
      console.error('Error guardando encuesta:', error)
    }
  }

  const handleSurveyClose = () => {
    setShowSurvey(false)
  }

  return (
    <>
      <form onSubmit={handleRegister} className="space-y-4">
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo *
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            required
            value={formData.full_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            placeholder="Tu nombre completo"
          />
        </div>

        <div>
          <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
            Empresa
          </label>
          <input
            type="text"
            id="company_name"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            placeholder="Nombre de tu empresa (opcional)"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Correo Electrónico *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
          placeholder="tu@empresa.com"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
            Contraseña *
            <Tooltip content="Usa al menos 6 caracteres. Recomendamos combinar letras mayúsculas, minúsculas, números y símbolos para mayor seguridad.">
              <HelpIcon />
            </Tooltip>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            placeholder="Mínimo 6 caracteres"
            minLength={6}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
            Confirmar Contraseña *
            <Tooltip content="Repite la contraseña exactamente como la escribiste arriba para confirmar que la recuerdas.">
              <HelpIcon />
            </Tooltip>
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
            placeholder="Repite tu contraseña"
            minLength={6}
          />
        </div>
      </div>

      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="acceptTerms"
          name="acceptTerms"
          checked={formData.acceptTerms}
          onChange={handleChange}
          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          required
        />
        <label htmlFor="acceptTerms" className="text-sm text-gray-600 flex items-start gap-1.5">
          <span>
            Acepto los{' '}
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="text-blue-600 hover:text-blue-500 underline font-medium"
            >
              términos y condiciones
            </button>{' '}
            y la{' '}
            <button
              type="button"
              onClick={() => setShowPrivacyModal(true)}
              className="text-blue-600 hover:text-blue-500 underline font-medium"
            >
              política de privacidad
            </button>
          </span>
          <Tooltip content="Debes leer y aceptar los términos legales antes de crear tu cuenta. Haz clic en los enlaces para ver los detalles.">
            <HelpIcon className="flex-shrink-0 mt-0.5" />
          </Tooltip>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

      <div className="text-center text-sm text-gray-600 pt-2 border-t border-gray-200">
        ¿Ya tienes cuenta?{' '}
        <button
          type="button"
          onClick={() => {/* Esta función se maneja en el parent */}}
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          Inicia sesión
        </button>
      </div>
    </form>

    {/* Encuesta Post-Registro */}
    {showSurvey && (
      <PostRegistrationSurvey 
        onSubmit={handleSurveySubmit}
        onClose={handleSurveyClose}
      />
    )}

    {/* Modales Legales */}
    <TermsModal 
      isOpen={showTermsModal}
      onClose={() => setShowTermsModal(false)}
    />
    <PrivacyModal 
      isOpen={showPrivacyModal}
      onClose={() => setShowPrivacyModal(false)}
    />
  </>
  )
}