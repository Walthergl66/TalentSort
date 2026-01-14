"use client"

import { useState, useEffect } from 'react'
import CSATSurvey from './CSATSurvey'
import NASATLXSurvey from './NASATLXSurvey'
import SUSSurvey from './SUSSurvey'

/**
 * UsabilitySurveyManager
 * Gestiona cuándo y qué encuestas mostrar basándose en:
 * - Tiempo de sesión
 * - Acciones completadas
 * - Frecuencia de encuestas
 * - Historial del usuario
 */

interface UsabilitySurveyManagerProps {
  userId: string
  userRole?: string
  enabled?: boolean
}

type SurveyType = 'csat' | 'nasa-tlx' | 'sus' | null

export const UsabilitySurveyManager: React.FC<UsabilitySurveyManagerProps> = ({
  userId,
  userRole = 'unknown',
  enabled = true
}) => {
  const [activeSurvey, setActiveSurvey] = useState<SurveyType>(null)
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [sessionStartTime] = useState(Date.now())
  const [taskInfo, setTaskInfo] = useState<{
    taskId: string
    taskName: string
    startTime: number
  } | null>(null)

  useEffect(() => {
    if (!enabled) return

    // Verificar si ya se mostró una encuesta recientemente
    const lastSurveyTime = localStorage.getItem(`lastSurvey_${userId}`)
    if (lastSurveyTime) {
      const daysSinceLastSurvey = (Date.now() - parseInt(lastSurveyTime)) / (1000 * 60 * 60 * 24)
      if (daysSinceLastSurvey < 7) {
        // No mostrar encuestas si ya se mostró una en los últimos 7 días
        return
      }
    }

    // Escuchar eventos personalizados para triggers de encuestas
    const handleTaskComplete = (e: CustomEvent) => {
      const { taskName } = e.detail
      setTaskInfo({
        taskId: `task_${Date.now()}`,
        taskName,
        startTime: Date.now() - 30000 // Asumimos 30 segundos de tarea
      })
      // Mostrar NASA-TLX después de completar una tarea
      setTimeout(() => setActiveSurvey('nasa-tlx'), 500)
    }

    const handleSessionEnd = () => {
      const sessionDuration = (Date.now() - sessionStartTime) / 1000 / 60
      if (sessionDuration > 5) {
        // Solo mostrar encuestas si la sesión duró más de 5 minutos
        const random = Math.random()
        if (random < 0.5) {
          setActiveSurvey('sus')
        } else {
          setActiveSurvey('csat')
        }
      }
    }

    window.addEventListener('taskCompleted', handleTaskComplete as EventListener)
    window.addEventListener('beforeunload', handleSessionEnd)

    // Trigger automático después de 10 minutos de sesión (opcional)
    const autoTriggerTimer = setTimeout(() => {
      const sessionDuration = (Date.now() - sessionStartTime) / 1000 / 60
      if (sessionDuration >= 10 && !activeSurvey) {
        setActiveSurvey('csat')
      }
    }, 10 * 60 * 1000) // 10 minutos

    return () => {
      window.removeEventListener('taskCompleted', handleTaskComplete as EventListener)
      window.removeEventListener('beforeunload', handleSessionEnd)
      clearTimeout(autoTriggerTimer)
    }
  }, [userId, enabled, sessionStartTime, activeSurvey])

  const handleSurveyComplete = () => {
    localStorage.setItem(`lastSurvey_${userId}`, Date.now().toString())
    setActiveSurvey(null)
  }

  const handleSurveySkip = () => {
    // Marcar como "saltada" pero no contar como completada
    // Permitir que se muestre nuevamente más pronto
    setActiveSurvey(null)
  }

  if (!enabled || !activeSurvey) return null

  const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000 / 60)
  const pagesVisited = parseInt(sessionStorage.getItem('pagesVisited') || '1')

  return (
    <>
      {activeSurvey === 'csat' && (
        <CSATSurvey
          userId={userId}
          sessionId={sessionId}
          userRole={userRole}
          pageContext={window.location.pathname}
          onComplete={handleSurveyComplete}
          onSkip={handleSurveySkip}
        />
      )}

      {activeSurvey === 'nasa-tlx' && taskInfo && (
        <NASATLXSurvey
          userId={userId}
          taskId={taskInfo.taskId}
          taskName={taskInfo.taskName}
          taskDurationSeconds={Math.floor((Date.now() - taskInfo.startTime) / 1000)}
          taskCompleted={true}
          userRole={userRole}
          onComplete={handleSurveyComplete}
          onSkip={handleSurveySkip}
        />
      )}

      {activeSurvey === 'sus' && (
        <SUSSurvey
          userId={userId}
          sessionId={sessionId}
          userRole={userRole}
          sessionDurationMinutes={sessionDuration}
          pagesVisited={pagesVisited}
          onComplete={handleSurveyComplete}
          onSkip={handleSurveySkip}
        />
      )}
    </>
  )
}

/**
 * Helper function to trigger a task completion survey
 * Usage: triggerTaskCompleteSurvey('Crear nueva vacante')
 */
export const triggerTaskCompleteSurvey = (taskName: string) => {
  const event = new CustomEvent('taskCompleted', { detail: { taskName } })
  window.dispatchEvent(event)
}

export default UsabilitySurveyManager
