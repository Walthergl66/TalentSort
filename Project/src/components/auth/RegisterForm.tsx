// components/auth/RegisterForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import PostRegistrationSurvey, { SurveyResponses } from './PostRegistrationSurvey'
import TermsModal from '../legal/TermsModal'
import PrivacyModal from '../legal/PrivacyModal'
import Tooltip, { HelpIcon } from '@/components/common/Tooltip'

interface RegisterFormProps {
  onSwitchToLogin?: () => void
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showSurvey, setShowSurvey] = useState(false)
  const [showSurveyPrompt, setShowSurveyPrompt] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Función para calcular la fortaleza de la contraseña
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' }
    
    let strength = 0
    
    // Longitud
    if (password.length >= 8) strength += 25
    if (password.length >= 12) strength += 15
    
    // Contiene minúsculas
    if (/[a-z]/.test(password)) strength += 15
    
    // Contiene mayúsculas
    if (/[A-Z]/.test(password)) strength += 15
    
    // Contiene números
    if (/[0-9]/.test(password)) strength += 15
    
    // Contiene caracteres especiales
    if (/[^A-Za-z0-9]/.test(password)) strength += 15
    
    // Determinar etiqueta y color
    if (strength < 40) {
      return { strength, label: 'Débil', color: 'bg-red-500' }
    } else if (strength < 70) {
      return { strength, label: 'Media', color: 'bg-yellow-500' }
    } else {
      return { strength, label: 'Fuerte', color: 'bg-green-500' }
    }
  }

  const passwordStrength = getPasswordStrength(formData.password)

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

        // Mostrar modal preguntando si quiere hacer la encuesta después de 1.5 segundos
        setTimeout(() => {
          setShowSurveyPrompt(true)
        }, 1500)
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

  const handleAcceptSurvey = () => {
    setShowSurveyPrompt(false)
    setShowSurvey(true)
  }

  const handleDeclineSurvey = () => {
    setShowSurveyPrompt(false)
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
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Indicador de fortaleza de contraseña */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Fortaleza:</span>
                <span className={`text-xs font-medium ${
                  passwordStrength.strength < 40 ? 'text-red-600' :
                  passwordStrength.strength < 70 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {passwordStrength.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${passwordStrength.strength}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <p className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                  {formData.password.length >= 8 ? '✓' : '○'} Al menos 8 caracteres
                </p>
                <p className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                  {/[A-Z]/.test(formData.password) ? '✓' : '○'} Una letra mayúscula
                </p>
                <p className={/[a-z]/.test(formData.password) ? 'text-green-600' : ''}>
                  {/[a-z]/.test(formData.password) ? '✓' : '○'} Una letra minúscula
                </p>
                <p className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                  {/[0-9]/.test(formData.password) ? '✓' : '○'} Un número
                </p>
                <p className={/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                  {/[^A-Za-z0-9]/.test(formData.password) ? '✓' : '○'} Un carácter especial (!@#$%)
                </p>
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
            Confirmar Contraseña *
            <Tooltip content="Repite la contraseña exactamente como la escribiste arriba para confirmar que la recuerdas.">
              <HelpIcon />
            </Tooltip>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
              placeholder="Repite tu contraseña"
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Indicador de coincidencia de contraseñas */}
          {formData.confirmPassword && (
            <div className="mt-2">
              {formData.password === formData.confirmPassword ? (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Las contraseñas coinciden
                </p>
              ) : (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Las contraseñas no coinciden
                </p>
              )}
            </div>
          )}
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
          onClick={onSwitchToLogin}
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          Inicia sesión
        </button>
      </div>
    </form>

    {/* Modal de pregunta para hacer la encuesta */}
    {showSurveyPrompt && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full animate-slideUp">
          <div className="text-center">
            {/* Icono */}
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            {/* Título */}
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
              ¡Gracias por registrarte! 🎉
            </h3>

            {/* Mensaje */}
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              ¿Te gustaría ayudarnos a mejorar compartiendo tu experiencia de registro?
              <br />
              <span className="text-xs text-gray-500 mt-2 block">Solo tomará 1-2 minutos</span>
            </p>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAcceptSurvey}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Sí, quiero ayudar
              </button>
              <button
                onClick={handleDeclineSurvey}
                className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Ahora no
              </button>
            </div>

            {/* Mensaje adicional */}
            <p className="text-xs text-gray-500 mt-4">
              Tu opinión es muy valiosa para nosotros
            </p>
          </div>
        </div>
      </div>
    )}

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