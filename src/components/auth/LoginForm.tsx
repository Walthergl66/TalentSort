// components/auth/LoginForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Tooltip, { HelpIcon } from '@/components/common/Tooltip'

interface LoginFormProps {
  onSwitchToRegister?: () => void
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isBlocked, setIsBlocked] = useState(false)
  const [remainingTime, setRemainingTime] = useState(0)
  const [rememberMe, setRememberMe] = useState(true) // Por defecto activado
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setIsBlocked(false)

    try {
      // Configurar el tipo de persistencia según la preferencia del usuario
      if (!rememberMe) {
        // Si no quiere recordar, usar sesión de solo memoria (se borra al cerrar navegador)
        await supabase.auth.updateUser({}, {
          emailRedirectTo: undefined
        })
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      // Si no quiere persistencia, guardar en sessionStorage en lugar de localStorage
      if (!rememberMe && data.session) {
        // La sesión solo durará mientras el navegador esté abierto
        sessionStorage.setItem('supabase.auth.session', JSON.stringify(data.session))
        localStorage.removeItem('supabase.auth.token')
      }

      console.log('Login exitoso:', data)
      
      // Redirigir al dashboard después del login exitoso
      if (data.session) {
        console.log('[Login] Exitoso, redirigiendo...')
        console.log('[Login] Usuario:', data.session.user)
        router.push('/dashboard')
      }
      
    } catch (error: any) {
      console.error('Error en login:', error)
      
      // Detectar diferentes tipos de errores y mostrar mensajes personalizados
      let errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.'
      
      if (error.message) {
        const msg = error.message.toLowerCase()
        
        // Detectar bloqueo por rate limiting o demasiados intentos
        if (msg.includes('rate limit') || msg.includes('too many') || msg.includes('temporarily')) {
          setIsBlocked(true)
          setRemainingTime(300) // 5 minutos por defecto
          errorMessage = 'Cuenta bloqueada temporalmente por seguridad. Por favor, espera 5 minutos antes de intentar nuevamente.'
          
          // Countdown timer
          const timer = setInterval(() => {
            setRemainingTime((prev) => {
              if (prev <= 1) {
                clearInterval(timer)
                setIsBlocked(false)
                return 0
              }
              return prev - 1
            })
          }, 1000)
        } 
        // Credenciales inválidas
        else if (msg.includes('invalid') || msg.includes('incorrect')) {
          errorMessage = 'Credenciales incorrectas. Verifica tu email y contraseña.'
        }
        // Email no confirmado
        else if (msg.includes('email not confirmed') || msg.includes('confirm')) {
          errorMessage = 'Email no confirmado. Por favor verifica tu correo electrónico.'
          
          // Ofrecer reenviar email de confirmación
          setTimeout(() => {
            const resend = confirm('¿Quieres que reenviemos el email de confirmación?')
            if (resend) {
              supabase.auth.resend({
                type: 'signup',
                email: formData.email,
              }).then(({ error }) => {
                if (error) {
                  alert('Error al reenviar: ' + error.message)
                } else {
                  alert('Email de confirmación reenviado. Revisa tu bandeja de entrada y spam.')
                }
              })
            }
          }, 500)
        }
        // Usuario no encontrado
        else if (msg.includes('user not found')) {
          errorMessage = 'No existe una cuenta con este email. ¿Quieres registrarte?'
        }
        // Otro error
        else {
          errorMessage = error.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <div className={`border rounded-lg p-4 ${
          isBlocked 
            ? 'bg-orange-50 border-orange-300' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {isBlocked ? (
                <svg className="h-5 w-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3 flex-1">
              <p className={`text-sm font-medium ${
                isBlocked ? 'text-orange-800' : 'text-red-800'
              }`}>
                {error}
              </p>
              {isBlocked && remainingTime > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-orange-700 mb-2">
                    <span>Tiempo restante:</span>
                    <span className="font-mono font-bold">
                      {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(remainingTime / 300) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-orange-600 mt-2">
                    Nota: Después de 3 intentos fallidos, bloqueamos temporalmente el acceso por seguridad.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="tu@empresa.com"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Contraseña
          </label>
          <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
            ¿Olvidaste?
          </a>
        </div>
        <input
          type="password"
          id="password"
          name="password"
          required
          value={formData.password}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
          placeholder="••••••••"
        />
      </div>

      {/* Remember Me Checkbox */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="remember-me" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-1">
            Recordarme
            <Tooltip content="Si activas esta opción, tu sesión permanecerá activa incluso después de cerrar el navegador. Desactívala en equipos compartidos.">
              <HelpIcon />
            </Tooltip>
          </label>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {rememberMe ? (
            <span className="flex items-center text-green-600">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Sesión persistente
            </span>
          ) : (
            <span className="flex items-center text-orange-600">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Sesión temporal
            </span>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || isBlocked}
        className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        {loading ? 'Iniciando sesión...' : isBlocked ? 'Bloqueado' : 'Iniciar sesión'}
      </button>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700 mt-4">
        ¿No tienes cuenta?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          Regístrate gratis
        </button>
      </div>
    </form>
  )
}