/**
 * EJEMPLOS DE USO - Sistema de Evaluación de Usabilidad
 * 
 * Este archivo muestra cómo integrar las encuestas de usabilidad
 * en diferentes partes de la aplicación.
 */

import { useState } from 'react'
import { triggerTaskCompleteSurvey } from '@/components/usability'

// ============================================
// EJEMPLO 1: Trigger después de subir CV
// ============================================

export const CVUploadExample = () => {
  const handleUploadSuccess = async () => {
    // ... lógica de subida de CV
    
    // Trigger NASA-TLX después de completar la tarea
    triggerTaskCompleteSurvey('Subir y analizar CV')
  }

  return (
    <button onClick={handleUploadSuccess}>
      Subir CV
    </button>
  )
}

// ============================================
// EJEMPLO 2: Trigger después de postularse
// ============================================

export const JobApplicationExample = () => {
  const handleApplyToJob = async (jobTitle: string) => {
    // ... lógica de postulación
    
    // Trigger con nombre de la tarea dinámico
    triggerTaskCompleteSurvey(`Postularse a: ${jobTitle}`)
  }

  return (
    <button onClick={() => handleApplyToJob('Desarrollador Frontend')}>
      Postularse
    </button>
  )
}

// ============================================
// EJEMPLO 3: Trigger después de crear vacante
// ============================================

export const CreateVacancyExample = () => {
  const handleCreateVacancy = async (formData: any) => {
    // ... lógica de creación de vacante
    
    // Trigger después de acción compleja
    triggerTaskCompleteSurvey('Crear nueva vacante con IA')
  }

  return (
    <form onSubmit={handleCreateVacancy}>
      {/* Formulario de vacante */}
      <button type="submit">Crear vacante</button>
    </form>
  )
}

// ============================================
// EJEMPLO 4: Trigger condicional
// ============================================

export const ConditionalTriggerExample = () => {
  const handleComplexAction = async () => {
    const success = await performComplexTask()
    
    // Solo trigger si la tarea fue exitosa
    if (success) {
      triggerTaskCompleteSurvey('Configurar perfil avanzado')
    }
  }

  return <button onClick={handleComplexAction}>Acción Compleja</button>
}

// ============================================
// EJEMPLO 5: Múltiples tareas en secuencia
// ============================================

export const MultipleTasksExample = () => {
  const handleWorkflow = async () => {
    // Tarea 1
    await uploadCV()
    
    // Tarea 2
    await fillProfile()
    
    // Tarea 3
    await applyToJobs()
    
    // Trigger solo después de completar todo el flujo
    triggerTaskCompleteSurvey('Completar proceso de candidatura completo')
  }

  return <button onClick={handleWorkflow}>Proceso Completo</button>
}

// ============================================
// EJEMPLO 6: Tracking de tiempo de tarea
// ============================================

export const TaskTimingExample = () => {
  const [taskStartTime, setTaskStartTime] = useState<number | null>(null)

  const startTask = () => {
    setTaskStartTime(Date.now())
  }

  const completeTask = () => {
    if (taskStartTime) {
      const duration = Date.now() - taskStartTime
      console.log(`Tarea completada en ${duration}ms`)
      
      // El componente NASA-TLX calculará la duración automáticamente
      triggerTaskCompleteSurvey('Editar información de perfil')
    }
  }

  return (
    <>
      <button onClick={startTask}>Iniciar Edición</button>
      <button onClick={completeTask}>Guardar Cambios</button>
    </>
  )
}

// ============================================
// EJEMPLO 7: Integración con hooks personalizados
// ============================================

export const useTaskTracking = (taskName: string) => {
  const completeTask = () => {
    triggerTaskCompleteSurvey(taskName)
  }

  return { completeTask }
}

// Uso del hook
export const HookExample = () => {
  const { completeTask } = useTaskTracking('Buscar candidatos con filtros avanzados')

  const handleSearch = async () => {
    // ... lógica de búsqueda
    completeTask()
  }

  return <button onClick={handleSearch}>Buscar</button>
}

// ============================================
// EJEMPLO 8: Prevenir múltiples triggers
// ============================================

export const PreventDuplicatesExample = () => {
  const [hastriggered, setHasTriggered] = useState(false)

  const handleImportantAction = async () => {
    // ... lógica de acción
    
    // Solo trigger una vez por sesión
    if (!hasTriggered) {
      triggerTaskCompleteSurvey('Importar datos masivos')
      setHasTriggered(true)
    }
  }

  return <button onClick={handleImportantAction}>Importar</button>
}

// ============================================
// FUNCIONES DE AYUDA
// ============================================

const performComplexTask = async (): Promise<boolean> => {
  // Simula una tarea compleja
  return true
}

const uploadCV = async () => {
  // Lógica de subida
}

const fillProfile = async () => {
  // Lógica de perfil
}

const applyToJobs = async () => {
  // Lógica de postulación
}

export default {
  CVUploadExample,
  JobApplicationExample,
  CreateVacancyExample,
  ConditionalTriggerExample,
  MultipleTasksExample,
  TaskTimingExample,
  HookExample,
  PreventDuplicatesExample
}
