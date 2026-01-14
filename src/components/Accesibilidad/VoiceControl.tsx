"use client"
import React, { useEffect, useRef, useState } from "react"
import { useAccessibility } from "./AccessibilityProvider"
import "./accessibility.css"

export default function VoiceControl() {
  const { state, setState } = useAccessibility()
  const [isListening, setIsListening] = useState(false)
  const [lastCommand, setLastCommand] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const [voiceControlEnabled, setVoiceControlEnabled] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Evitar error de hidratación
  useEffect(() => {
    setMounted(true)
  }, [])

  // Mapeo de comandos de voz
  const commandMap: Record<string, () => void> = {
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
      speak(`Tamaño de texto aumentado a ${Math.round(newScale * 100)}%`)
    },
    "reducir texto": () => {
      const newScale = Math.max(state.fontScale - 0.2, 0.8)
      setState({ fontScale: newScale })
      speak(`Tamaño de texto reducido a ${Math.round(newScale * 100)}%`)
    },
    "texto normal": () => {
      setState({ fontScale: 1 })
      speak("Tamaño de texto restaurado")
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

    // Animaciones
    "reducir animaciones": () => {
      setState({ reducedMotion: true })
      speak("Animaciones reducidas")
    },
    "activar animaciones": () => {
      setState({ reducedMotion: false })
      speak("Animaciones activadas")
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

    // Transcripción en vivo
    "activar transcripción": () => {
      setState({ liveTranscriptionEnabled: true })
      speak("Transcripción en vivo activada")
    },
    "desactivar transcripción": () => {
      setState({ liveTranscriptionEnabled: false })
      speak("Transcripción en vivo desactivada")
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

    // Ayuda
    "ayuda": () => {
      speak("Comandos disponibles: activar o desactivar alto contraste, aumentar o reducir texto, activar o desactivar subtítulos, activar o desactivar transcripción, activar o desactivar navegación teclado, activar o desactivar botones grandes, reducir o activar animaciones, desactivar comando de voz")
    },

    // Restablecer
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
      speak("Configuración restablecida")
    },

    // Desactivar control por voz
    "desactivar comando de voz": () => {
      speak("Desactivando control por voz")
      setTimeout(() => {
        setVoiceControlEnabled(false)
      }, 1500)
    },
    "apagar voz": () => {
      speak("Desactivando control por voz")
      setTimeout(() => {
        setVoiceControlEnabled(false)
      }, 1500)
    },
    "detener comandos": () => {
      speak("Desactivando control por voz")
      setTimeout(() => {
        setVoiceControlEnabled(false)
      }, 1500)
    },
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
          <p>🎤 Escuchando... Di comandos como:</p>
          <ul>
            <li>"Activar alto contraste"</li>
            <li>"Aumentar texto"</li>
            <li>"Activar subtítulos"</li>
            <li>"Desactivar comando de voz"</li>
            <li>"Ayuda" para más comandos</li>
          </ul>
        </div>
      )}
    </div>
  )
}
