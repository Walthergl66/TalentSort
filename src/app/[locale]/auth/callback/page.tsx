'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Primero intentamos manejar el callback de la URL
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error during auth callback:', error)
          router.push('/?error=auth_error')
          return
        }

        // Verificar si hay parámetros de hash en la URL que necesitamos procesar
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (accessToken) {
          // Hay tokens en la URL, procesarlos
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          })

          if (sessionError) {
            console.error('Error setting session:', sessionError)
            router.push('/?error=auth_error')
            return
          }

          if (sessionData.session) {
            console.log('Session established successfully:', sessionData.session.user)
            router.push('/dashboard')
            return
          }
        }

        // Si ya hay una sesión activa, redirigir al dashboard
        if (data.session) {
          console.log('Existing session found:', data.session.user)
          router.push('/dashboard')
        } else {
          // No hay sesión, redirigir al home
          console.log('No session found, redirecting to home')
          router.push('/')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/?error=auth_error')
      }
    }

    // Listener para cambios de estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in, redirecting to dashboard')
        router.push('/dashboard')
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out, redirecting to home')
        router.push('/')
      }
    })

    // Ejecutar el callback handler
    handleAuthCallback()

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            Verificando autenticación...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Por favor espera mientras procesamos tu inicio de sesión.
          </p>
        </div>
      </div>
    </div>
  )
}