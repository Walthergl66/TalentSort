"use client"
import React, { useEffect, useRef, useState } from "react"
import { useAccessibility } from "./AccessibilityProvider"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import "./accessibility.css"

export default function VoiceControl() {
  const { state, setState } = useAccessibility()
  const [isListening, setIsListening] = useState(false)
  const [lastCommand, setLastCommand] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const [voiceControlEnabled, setVoiceControlEnabled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [userRole, setUserRole] = useState<string>('candidate') // candidate, company, admin
  const router = useRouter()

  // Evitar error de hidratación
  useEffect(() => {
    setMounted(true)
    fetchUserRole()
  }, [])

  // Obtener rol del usuario
  const fetchUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single()

      if (profile) {
        setUserRole(profile.role || 'candidate')
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
    }
  }

  // Función de navegación
  const navigateTo = (path: string, message: string) => {
    speak(message)
    setTimeout(() => router.push(path), 1000)
  }

  // Comandos base (disponibles para todos los roles)
  const getBaseCommands = (): Record<string, () => void> => ({
    // ==================== ACCESIBILIDAD ====================
    // Alto contraste
    "activar alto contraste": () => {
      setState({ highContrast: true })
      speak("Alto contraste activado")
    },
    "desactivar alto contraste": () => {
      setState({ highContrast: false })
      speak("Alto contraste desactivado")
    },
    "contraste": () => {
      setState({ highContrast: !state.highContrast })
      speak(state.highContrast ? "Alto contraste desactivado" : "Alto contraste activado")
    },

    // Tamaño de texto
    "aumentar texto": () => {
      const newScale = Math.min(state.fontScale + 0.2, 1.6)
      setState({ fontScale: newScale })
      speak(`Tamaño de texto aumentado a ${Math.round(newScale * 100)} por ciento`)
    },
    "texto más grande": () => {
      const newScale = Math.min(state.fontScale + 0.2, 1.6)
      setState({ fontScale: newScale })
      speak(`Texto más grande, ${Math.round(newScale * 100)} por ciento`)
    },
    "reducir texto": () => {
      const newScale = Math.max(state.fontScale - 0.2, 0.8)
      setState({ fontScale: newScale })
      speak(`Tamaño de texto reducido a ${Math.round(newScale * 100)} por ciento`)
    },
    "texto más pequeño": () => {
      const newScale = Math.max(state.fontScale - 0.2, 0.8)
      setState({ fontScale: newScale })
      speak(`Texto más pequeño, ${Math.round(newScale * 100)} por ciento`)
    },
    "texto normal": () => {
      setState({ fontScale: 1 })
      speak("Tamaño de texto restaurado al 100 por ciento")
    },
    "restablecer texto": () => {
      setState({ fontScale: 1 })
      speak("Tamaño de texto restablecido")
    },

    // Espaciado
    "activar espaciado": () => {
      setState({ letterSpacing: true })
      speak("Espaciado aumentado activado")
    },
    "desactivar espaciado": () => {
      setState({ letterSpacing: false })
      speak("Espaciado aumentado desactivado")
    },
    "espaciado": () => {
      setState({ letterSpacing: !state.letterSpacing })
      speak(state.letterSpacing ? "Espaciado desactivado" : "Espaciado activado")
    },

    // Navegación por teclado
    "activar navegación teclado": () => {
      setState({ keyboardNavigation: true })
      speak("Navegación por teclado activada")
    },
    "desactivar navegación teclado": () => {
      setState({ keyboardNavigation: false })
      speak("Navegación por teclado desactivada")
    },

    // Botones grandes
    "activar botones grandes": () => {
      setState({ largeButtons: true })
      speak("Botones grandes activados")
    },
    "desactivar botones grandes": () => {
      setState({ largeButtons: false })
      speak("Botones grandes desactivados")
    },
    "botones grandes": () => {
      setState({ largeButtons: !state.largeButtons })
      speak(state.largeButtons ? "Botones normales" : "Botones grandes activados")
    },

    // Animaciones
    "reducir animaciones": () => {
      setState({ reducedMotion: true })
      speak("Animaciones reducidas")
    },
    "activar animaciones": () => {
      setState({ reducedMotion: false })
      speak("Animaciones activadas")
    },
    "sin animaciones": () => {
      setState({ reducedMotion: true })
      speak("Animaciones desactivadas")
    },

    // Subtítulos
    "activar subtítulos": () => {
      setState({ captionsEnabled: true })
      speak("Subtítulos activados")
    },
    "desactivar subtítulos": () => {
      setState({ captionsEnabled: false })
      speak("Subtítulos desactivados")
    },
    "subtítulos": () => {
      setState({ captionsEnabled: !state.captionsEnabled })
      speak(state.captionsEnabled ? "Subtítulos desactivados" : "Subtítulos activados")
    },

    // Transcripción en vivo
    "activar transcripción": () => {
      setState({ liveTranscriptionEnabled: true })
      speak("Transcripción en vivo activada")
    },
    "desactivar transcripción": () => {
      setState({ liveTranscriptionEnabled: false })
      speak("Transcripción en vivo desactivada")
    },
    "transcripción": () => {
      setState({ liveTranscriptionEnabled: !state.liveTranscriptionEnabled })
      speak(state.liveTranscriptionEnabled ? "Transcripción desactivada" : "Transcripción activada")
    },

    // Hover to speak
    "activar leer al pasar": () => {
      setState({ hoverToSpeak: true, ttsEnabled: true })
      speak("Leer al pasar el cursor activado")
    },
    "desactivar leer al pasar": () => {
      setState({ hoverToSpeak: false })
      speak("Leer al pasar el cursor desactivado")
    },
    "lectura automática": () => {
      setState({ hoverToSpeak: !state.hoverToSpeak, ttsEnabled: !state.hoverToSpeak })
      speak(state.hoverToSpeak ? "Lectura automática desactivada" : "Lectura automática activada")
    },

    // ==================== NAVEGACIÓN GENERAL ====================
    "ir al inicio": () => navigateTo('/dashboard', "Yendo al inicio"),
    "ir a inicio": () => navigateTo('/dashboard', "Yendo al inicio"),
    "página principal": () => navigateTo('/dashboard', "Yendo a la página principal"),
    "dashboard": () => navigateTo('/dashboard', "Abriendo dashboard"),
    "tablero": () => navigateTo('/dashboard', "Abriendo tablero de control"),
    
    "ir al perfil": () => navigateTo('/dashboard/profile', "Abriendo perfil"),
    "mi perfil": () => navigateTo('/dashboard/profile', "Abriendo tu perfil"),
    "ver perfil": () => navigateTo('/dashboard/profile', "Viendo perfil"),
    "editar perfil": () => navigateTo('/dashboard/profile', "Abriendo editor de perfil"),
    
    "configuración": () => navigateTo('/dashboard/settings', "Abriendo configuración"),
    "ajustes": () => navigateTo('/dashboard/settings', "Abriendo ajustes"),
    "preferencias": () => navigateTo('/dashboard/settings', "Abriendo preferencias"),
    
    "cerrar sesión": async () => {
      speak("Cerrando sesión")
      await supabase.auth.signOut()
      setTimeout(() => router.push('/'), 1500)
    },
    "salir": async () => {
      speak("Cerrando sesión")
      await supabase.auth.signOut()
      setTimeout(() => router.push('/'), 1500)
    },
    "desconectar": async () => {
      speak("Desconectando")
      await supabase.auth.signOut()
      setTimeout(() => router.push('/'), 1500)
    },

    // ==================== INFORMACIÓN ====================
    "ayuda": () => {
      const roleHelp = userRole === 'candidate' 
        ? "Como candidato puedes decir: subir currículum, buscar empleos, mis aplicaciones, ver vacantes, actualizar perfil"
        : userRole === 'company'
        ? "Como empresa puedes decir: publicar vacante, ver candidatos, mis vacantes, buscar talento, crear oferta"
        : "Como administrador puedes decir: ver usuarios, estadísticas, moderación, reportes"
      speak(`Comandos de accesibilidad disponibles: alto contraste, aumentar texto, botones grandes, subtítulos. Comandos de navegación: ir al inicio, mi perfil, configuración, cerrar sesión. ${roleHelp}. Di lista de comandos para más opciones`)
    },
    "lista de comandos": () => {
      const commands = userRole === 'candidate'
        ? "Candidato: subir cv, buscar empleos, mis aplicaciones, ver vacantes, editar cv"
        : userRole === 'company'
        ? "Empresa: publicar vacante, ver candidatos, buscar talento, mis vacantes, eliminar vacante"
        : "Admin: ver usuarios, estadísticas, moderación, configuración de sistema"
      speak(`Comandos principales: ${commands}. Accesibilidad: alto contraste, aumentar texto, botones grandes. Navegación: inicio, perfil, configuración, cerrar sesión`)
    },
    "qué puedo decir": () => {
      speak("Puedes usar comandos de accesibilidad como aumentar texto o alto contraste. Comandos de navegación como ir al inicio o mi perfil. Y comandos específicos según tu rol. Di ayuda para más información")
    },
    "comandos disponibles": () => {
      speak("Principales comandos: ayuda, lista de comandos, ir al inicio, mi perfil, configuración, cerrar sesión. Para accesibilidad: alto contraste, aumentar texto, botones grandes, subtítulos. Para tu rol específico di lista de comandos")
    },

    // ==================== UTILIDADES ====================
    "leer página": () => {
      const pageContent = document.querySelector('main')?.textContent?.slice(0, 500) || "No hay contenido disponible"
      speak(`Contenido de la página: ${pageContent}`)
    },
    "qué hay en pantalla": () => {
      const title = document.querySelector('h1')?.textContent || "Sin título"
      speak(`Estás en: ${title}`)
    },
    "dónde estoy": () => {
      const path = window.location.pathname
      const title = document.querySelector('h1')?.textContent || "página sin título"
      speak(`Estás en ${title}`)
    },
    
    "volver": () => {
      speak("Volviendo a la página anterior")
      router.back()
    },
    "regresar": () => {
      speak("Regresando")
      router.back()
    },
    "página anterior": () => {
      speak("Yendo a página anterior")
      router.back()
    },
    
    "recargar": () => {
      speak("Recargando página")
      window.location.reload()
    },
    "actualizar página": () => {
      speak("Actualizando página")
      window.location.reload()
    },
    "refrescar": () => {
      speak("Refrescando página")
      window.location.reload()
    },

    // ==================== RESTABLECER ====================
    "restablecer todo": () => {
      setState({
        highContrast: false,
        fontScale: 1,
        letterSpacing: false,
        reducedMotion: false,
        keyboardNavigation: false,
        largeButtons: false,
        captionsEnabled: false,
        liveTranscriptionEnabled: false,
        hoverToSpeak: false,
      })
      speak("Configuración de accesibilidad restablecida")
    },
    "configuración predeterminada": () => {
      setState({
        highContrast: false,
        fontScale: 1,
        letterSpacing: false,
        reducedMotion: false,
        keyboardNavigation: false,
        largeButtons: false,
        captionsEnabled: false,
        liveTranscriptionEnabled: false,
        hoverToSpeak: false,
      })
      speak("Configuración predeterminada restaurada")
    },

    // ==================== DESACTIVAR CONTROL POR VOZ ====================
    "desactivar comando de voz": () => {
      speak("Desactivando control por voz")
      setTimeout(() => setVoiceControlEnabled(false), 1500)
    },
    "apagar voz": () => {
      speak("Apagando control por voz")
      setTimeout(() => setVoiceControlEnabled(false), 1500)
    },
    "detener comandos": () => {
      speak("Deteniendo comandos de voz")
      setTimeout(() => setVoiceControlEnabled(false), 1500)
    },
    "silencio": () => {
      speak("Desactivando")
      setTimeout(() => setVoiceControlEnabled(false), 1000)
    },
    "stop": () => {
      speak("Deteniendo")
      setTimeout(() => setVoiceControlEnabled(false), 1000)
    },
  })

  // Comandos específicos para CANDIDATOS
  const getCandidateCommands = (): Record<string, () => void> => ({
    // CV / Currículum
    "subir currículum": () => navigateTo('/dashboard/candidates', "Abriendo sección para subir currículum"),
    "subir cv": () => navigateTo('/dashboard/candidates', "Abriendo sección de CV"),
    "cargar cv": () => navigateTo('/dashboard/candidates', "Abriendo gestor de currículums"),
    "mi currículum": () => navigateTo('/dashboard/candidates', "Mostrando tus currículums"),
    "mis cv": () => navigateTo('/dashboard/candidates', "Mostrando tus CV"),
    "ver mi cv": () => navigateTo('/dashboard/candidates', "Viendo tus currículums"),
    "editar cv": () => navigateTo('/dashboard/candidates', "Abriendo editor de CV"),
    "actualizar cv": () => navigateTo('/dashboard/candidates', "Abriendo para actualizar CV"),
    "gestionar cv": () => navigateTo('/dashboard/candidates', "Abriendo gestor de CVs"),
    
    // Búsqueda de empleo
    "buscar empleos": () => navigateTo('/dashboard/jobs', "Buscando empleos disponibles"),
    "buscar trabajo": () => navigateTo('/dashboard/jobs', "Buscando ofertas de trabajo"),
    "buscar vacantes": () => navigateTo('/dashboard/jobs', "Buscando vacantes"),
    "ver empleos": () => navigateTo('/dashboard/jobs', "Mostrando empleos"),
    "ver ofertas": () => navigateTo('/dashboard/jobs', "Mostrando ofertas laborales"),
    "ofertas de trabajo": () => navigateTo('/dashboard/jobs', "Abriendo ofertas de trabajo"),
    "oportunidades": () => navigateTo('/dashboard/jobs', "Mostrando oportunidades laborales"),
    "vacantes disponibles": () => navigateTo('/dashboard/jobs', "Viendo vacantes disponibles"),
    "buscar oportunidades": () => navigateTo('/dashboard/jobs', "Buscando oportunidades"),
    
    // Aplicaciones
    "mis aplicaciones": () => navigateTo('/dashboard/applications', "Mostrando tus aplicaciones"),
    "ver aplicaciones": () => navigateTo('/dashboard/applications', "Viendo aplicaciones enviadas"),
    "aplicaciones enviadas": () => navigateTo('/dashboard/applications', "Mostrando aplicaciones enviadas"),
    "estado de aplicaciones": () => navigateTo('/dashboard/applications', "Verificando estado de aplicaciones"),
    "seguimiento": () => navigateTo('/dashboard/applications', "Abriendo seguimiento de aplicaciones"),
    "mis postulaciones": () => navigateTo('/dashboard/applications', "Viendo tus postulaciones"),
    "postulaciones": () => navigateTo('/dashboard/applications', "Mostrando postulaciones"),
    
    // Alertas y notificaciones
    "ver notificaciones": () => {
      speak("Abriendo notificaciones")
      document.querySelector('[aria-label*="notificación"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    },
    "notificaciones": () => {
      speak("Mostrando notificaciones")
      document.querySelector('[aria-label*="notificación"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    },
    "alertas": () => {
      speak("Mostrando alertas")
      document.querySelector('[aria-label*="notificación"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    },
    
    // Perfil específico
    "actualizar perfil": () => navigateTo('/dashboard/profile', "Abriendo perfil para actualizar"),
    "editar información": () => navigateTo('/dashboard/profile', "Editando información personal"),
    "cambiar foto": () => navigateTo('/dashboard/profile', "Abriendo perfil para cambiar foto"),
    "mis habilidades": () => navigateTo('/dashboard/profile', "Abriendo sección de habilidades"),
    "agregar habilidad": () => navigateTo('/dashboard/profile', "Abriendo para agregar habilidades"),
  })

  // Comandos específicos para EMPRESAS
  const getCompanyCommands = (): Record<string, () => void> => ({
    // Publicar vacantes
    "publicar vacante": () => navigateTo('/dashboard/vacancies/new', "Abriendo formulario para publicar vacante"),
    "crear vacante": () => navigateTo('/dashboard/vacancies/new', "Creando nueva vacante"),
    "nueva vacante": () => navigateTo('/dashboard/vacancies/new', "Abriendo nueva vacante"),
    "publicar oferta": () => navigateTo('/dashboard/vacancies/new', "Publicando oferta laboral"),
    "crear oferta": () => navigateTo('/dashboard/vacancies/new', "Creando oferta de empleo"),
    "nueva oferta": () => navigateTo('/dashboard/vacancies/new', "Nueva oferta laboral"),
    "crear empleo": () => navigateTo('/dashboard/vacancies/new', "Creando empleo"),
    "agregar vacante": () => navigateTo('/dashboard/vacancies/new', "Agregando vacante"),
    
    // Gestión de vacantes
    "mis vacantes": () => navigateTo('/dashboard/vacancies', "Mostrando tus vacantes"),
    "ver vacantes": () => navigateTo('/dashboard/vacancies', "Viendo vacantes publicadas"),
    "vacantes publicadas": () => navigateTo('/dashboard/vacancies', "Mostrando vacantes activas"),
    "gestionar vacantes": () => navigateTo('/dashboard/vacancies', "Abriendo gestor de vacantes"),
    "editar vacantes": () => navigateTo('/dashboard/vacancies', "Abriendo para editar vacantes"),
    "mis ofertas": () => navigateTo('/dashboard/vacancies', "Mostrando tus ofertas"),
    "ofertas activas": () => navigateTo('/dashboard/vacancies', "Viendo ofertas activas"),
    
    // Candidatos
    "ver candidatos": () => navigateTo('/dashboard/candidates', "Mostrando candidatos"),
    "buscar candidatos": () => navigateTo('/dashboard/candidates', "Buscando candidatos"),
    "buscar talento": () => navigateTo('/dashboard/candidates', "Buscando talento"),
    "explorar candidatos": () => navigateTo('/dashboard/candidates', "Explorando candidatos disponibles"),
    "banco de talento": () => navigateTo('/dashboard/candidates', "Abriendo banco de talento"),
    "pool de candidatos": () => navigateTo('/dashboard/candidates', "Mostrando pool de candidatos"),
    "candidatos disponibles": () => navigateTo('/dashboard/candidates', "Viendo candidatos disponibles"),
    
    // Aplicaciones recibidas
    "ver aplicaciones": () => navigateTo('/dashboard/applications', "Viendo aplicaciones recibidas"),
    "aplicaciones recibidas": () => navigateTo('/dashboard/applications', "Mostrando aplicaciones recibidas"),
    "postulaciones recibidas": () => navigateTo('/dashboard/applications', "Viendo postulaciones"),
    "solicitudes": () => navigateTo('/dashboard/applications', "Mostrando solicitudes"),
    "revisar aplicaciones": () => navigateTo('/dashboard/applications', "Revisando aplicaciones"),
    
    // Pipeline y seguimiento
    "pipeline": () => navigateTo('/dashboard/pipeline', "Abriendo pipeline de candidatos"),
    "embudo": () => navigateTo('/dashboard/pipeline', "Mostrando embudo de reclutamiento"),
    "seguimiento de candidatos": () => navigateTo('/dashboard/pipeline', "Abriendo seguimiento"),
    "proceso de selección": () => navigateTo('/dashboard/pipeline', "Viendo proceso de selección"),
    
    // Análisis y estadísticas
    "estadísticas": () => navigateTo('/dashboard/analytics', "Mostrando estadísticas"),
    "analíticas": () => navigateTo('/dashboard/analytics', "Abriendo analíticas"),
    "métricas": () => navigateTo('/dashboard/analytics', "Viendo métricas"),
    "reportes": () => navigateTo('/dashboard/analytics', "Mostrando reportes"),
    "ver reportes": () => navigateTo('/dashboard/analytics', "Abriendo reportes"),
    
    // Perfil de empresa
    "perfil empresa": () => navigateTo('/dashboard/company-profile', "Abriendo perfil de empresa"),
    "editar empresa": () => navigateTo('/dashboard/company-profile', "Editando información de empresa"),
    "información empresa": () => navigateTo('/dashboard/company-profile', "Mostrando información de empresa"),
  })

  // Comandos específicos para ADMINISTRADORES
  const getAdminCommands = (): Record<string, () => void> => ({
    // Gestión de usuarios
    "ver usuarios": () => navigateTo('/dashboard/admin/users', "Mostrando usuarios"),
    "gestionar usuarios": () => navigateTo('/dashboard/admin/users', "Abriendo gestión de usuarios"),
    "administrar usuarios": () => navigateTo('/dashboard/admin/users', "Administrando usuarios"),
    "lista de usuarios": () => navigateTo('/dashboard/admin/users', "Viendo lista de usuarios"),
    
    // Moderación
    "moderación": () => navigateTo('/dashboard/admin/moderation', "Abriendo moderación"),
    "moderar": () => navigateTo('/dashboard/admin/moderation', "Abriendo panel de moderación"),
    "revisar contenido": () => navigateTo('/dashboard/admin/moderation', "Revisando contenido"),
    
    // Configuración del sistema
    "configuración sistema": () => navigateTo('/dashboard/admin/settings', "Abriendo configuración del sistema"),
    "ajustes sistema": () => navigateTo('/dashboard/admin/settings', "Viendo ajustes del sistema"),
    "configuración avanzada": () => navigateTo('/dashboard/admin/settings', "Abriendo configuración avanzada"),
    
    // Estadísticas y reportes
    "estadísticas generales": () => navigateTo('/dashboard/admin/analytics', "Mostrando estadísticas generales"),
    "reportes del sistema": () => navigateTo('/dashboard/admin/reports', "Abriendo reportes del sistema"),
    "métricas sistema": () => navigateTo('/dashboard/admin/analytics', "Viendo métricas del sistema"),
    
    // Usabilidad (nuevos dashboards)
    "usabilidad": () => navigateTo('/dashboard/admin/usability', "Abriendo dashboard de usabilidad"),
    "resultados usabilidad": () => navigateTo('/dashboard/admin/usability', "Mostrando resultados de usabilidad"),
    "encuestas": () => navigateTo('/dashboard/admin/usability', "Viendo encuestas de usabilidad"),
    
    // Accesibilidad
    "verificar accesibilidad": () => navigateTo('/dashboard/admin/accessibility', "Abriendo verificador de accesibilidad"),
    "accesibilidad": () => navigateTo('/dashboard/admin/accessibility', "Abriendo panel de accesibilidad"),
    "cumplimiento wcag": () => navigateTo('/dashboard/admin/accessibility', "Verificando cumplimiento WCAG"),
  })

  // Mapeo completo de comandos según rol
  const commandMap: Record<string, () => void> = {
    ...getBaseCommands(),
    ...(userRole === 'candidate' ? getCandidateCommands() : {}),
    ...(userRole === 'company' ? getCompanyCommands() : {}),
    ...(userRole === 'admin' ? getAdminCommands() : {}),
  }

  // Función para hablar
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'es-ES'
      utterance.rate = 1
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
      setFeedback(text)
      setTimeout(() => setFeedback(null), 3000)
    }
  }

  // Inicializar reconocimiento de voz
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = "es-ES"
    recognition.continuous = true
    recognition.interimResults = false

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1
      const command = event.results[last][0].transcript.toLowerCase().trim()
      setLastCommand(command)
      console.log("Comando recibido:", command)
      
      // Buscar comando coincidente
      let commandFound = false
      for (const [key, action] of Object.entries(commandMap)) {
        if (command.includes(key)) {
          action()
          commandFound = true
          break
        }
      }

      if (!commandFound) {
        console.log("Comando no reconocido:", command)
      }
    }

    recognition.onerror = (event: any) => {
      // Ignorar errores comunes que no son problemas reales
      if (event.error === 'aborted' || event.error === 'no-speech' || event.error === 'network') {
        // No hacer nada, estos son normales
        return
      }
      
      // Solo registrar errores reales
      console.error("Error de reconocimiento de voz:", event.error)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      try {
        recognition.stop()
      } catch (e) {
        // Ignorar
      }
    }
  }, [state])

  // Controlar el reconocimiento según el estado
  useEffect(() => {
    if (!recognitionRef.current || !mounted) return

    if (voiceControlEnabled) {
      try {
        recognitionRef.current.start()
        setIsListening(true)
        speak("Control por voz activado")
      } catch (e: any) {
        if (!e.message || !e.message.includes('already started')) {
          console.error("Error al iniciar control por voz:", e)
        }
      }
    } else {
      try {
        if (isListening) {
          recognitionRef.current.stop()
          setIsListening(false)
        }
      } catch (e) {
        // Ignorar
      }
    }
  }, [voiceControlEnabled, mounted, isListening])

  // Atajo de teclado Alt + V
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'v') {
        e.preventDefault()
        setVoiceControlEnabled(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // No renderizar en el servidor ni antes de la hidratación
  if (!mounted) return null

  return (
    <div className="voice-control-container">
      <button
        className={`voice-control-button ${isListening ? 'listening' : ''}`}
        onClick={() => setVoiceControlEnabled(!voiceControlEnabled)}
        title="Control por voz (Alt + V)"
        aria-label={voiceControlEnabled ? "Desactivar control por voz" : "Activar control por voz"}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
        </svg>
        {isListening && <span className="listening-indicator"></span>}
      </button>

      {feedback && (
        <div className="voice-feedback">
          {feedback}
        </div>
      )}

      {isListening && (
        <div className="voice-commands-hint">
          <p className="font-semibold mb-2">🎤 Escuchando... </p>
          <div className="text-xs space-y-2">
            <div>
              <strong>Accesibilidad:</strong> "alto contraste", "aumentar texto", "botones grandes"
            </div>
            <div>
              <strong>Navegación:</strong> "ir al inicio", "mi perfil", "configuración", "cerrar sesión"
            </div>
            {userRole === 'candidate' && (
              <div>
                <strong>Candidato:</strong> "subir cv", "buscar empleos", "mis aplicaciones", "ver vacantes"
              </div>
            )}
            {userRole === 'company' && (
              <div>
                <strong>Empresa:</strong> "publicar vacante", "ver candidatos", "mis vacantes", "buscar talento"
              </div>
            )}
            {userRole === 'admin' && (
              <div>
                <strong>Admin:</strong> "ver usuarios", "usabilidad", "accesibilidad", "estadísticas"
              </div>
            )}
            <div>
              <strong>Más:</strong> "ayuda", "lista de comandos", "qué puedo decir"
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
