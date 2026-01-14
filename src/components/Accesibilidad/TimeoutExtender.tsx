"use client"

import { useState, useEffect } from 'react'

/**
 * TimeoutExtender Component
 * WCAG 2.2.1 - Timing Adjustable (Level A)
 * WCAG 2.2.6 - Timeouts (Level AAA)
 * 
 * Advierte al usuario antes de que expire una sesión y permite extender el tiempo.
 */

interface TimeoutExtenderProps {
  warningTime?: number // Tiempo en segundos antes del timeout para mostrar advertencia (default: 120s)
  totalTime?: number // Tiempo total de la sesión en segundos (default: 1800s = 30min)
  onTimeout?: () => void // Callback cuando se agota el tiempo
  onExtend?: () => void // Callback cuando el usuario extiende el tiempo
}

export const TimeoutExtender: React.FC<TimeoutExtenderProps> = ({
  warningTime = 120,
  totalTime = 1800,
  onTimeout,
  onExtend
}) => {
  const [showWarning, setShowWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(totalTime)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (!isActive) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1

        // Mostrar advertencia
        if (newTime === warningTime) {
          setShowWarning(true)
          // Anunciar a lectores de pantalla
          announceToScreenReader('Advertencia: Su sesión expirará pronto. Haga clic en "Extender tiempo" para continuar.')
        }

        // Timeout alcanzado
        if (newTime <= 0) {
          setIsActive(false)
          if (onTimeout) onTimeout()
          return 0
        }

        return newTime
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, warningTime, onTimeout])

  const handleExtend = () => {
    setTimeRemaining(totalTime)
    setShowWarning(false)
    if (onExtend) onExtend()
    announceToScreenReader('Tiempo extendido exitosamente.')
  }

  const handleDismiss = () => {
    setShowWarning(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!showWarning) return null

  return (
    <>
      {/* Screen reader announcement region */}
      <div 
        role="alert" 
        aria-live="assertive" 
        className="sr-only"
        id="timeout-announcement"
      />

      {/* Warning modal */}
      <div 
        role="alertdialog"
        aria-labelledby="timeout-title"
        aria-describedby="timeout-description"
        className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4 border-4 border-yellow-500">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 id="timeout-title" className="text-xl font-bold text-gray-900 dark:text-white">
              ⏰ Sesión por expirar
            </h2>
          </div>

          <p id="timeout-description" className="text-gray-700 dark:text-gray-300 mb-4">
            Su sesión expirará en <strong className="text-red-600 dark:text-red-400 text-xl">{formatTime(timeRemaining)}</strong>.
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Para continuar trabajando, haga clic en "Extender tiempo". 
            También puede ajustar el tiempo de sesión en la configuración.
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label="Cerrar advertencia"
            >
              Cerrar
            </button>
            <button
              onClick={handleExtend}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold"
              autoFocus
              aria-label="Extender tiempo de sesión"
            >
              ⏱️ Extender tiempo
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-500 mt-4 text-center">
            WCAG 2.2.1 - Timing Adjustable
          </p>
        </div>
      </div>
    </>
  )
}

// Utilidad para anunciar a lectores de pantalla
function announceToScreenReader(message: string) {
  const announcement = document.getElementById('timeout-announcement')
  if (announcement) {
    announcement.textContent = message
    // Limpiar después de 1 segundo
    setTimeout(() => {
      announcement.textContent = ''
    }, 1000)
  }
}

export default TimeoutExtender
