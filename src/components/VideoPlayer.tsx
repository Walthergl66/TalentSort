"use client"
import React, { useRef, useState, useEffect } from "react"
import { useAccessibility } from "./Accesibilidad/AccessibilityProvider"

interface VideoPlayerProps {
  src: string
  title?: string
  className?: string
}

export default function VideoPlayer({ src, title = "Video", className = "" }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { state } = useAccessibility()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [transcript, setTranscript] = useState("")
  const [transcriptHistory, setTranscriptHistory] = useState<string[]>([])
  const recognitionRef = useRef<any>(null)
  const [isRecognitionActive, setIsRecognitionActive] = useState(false)
  const lastFinalTranscriptRef = useRef("")

  // Inicializar reconocimiento de voz
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = "es-ES"
    recognition.interimResults = true
    recognition.continuous = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      try {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " "
          } else {
            interimTranscript += transcript
          }
        }

        // Si hay transcripción final nueva, reemplazar la línea anterior
        if (finalTranscript && finalTranscript !== lastFinalTranscriptRef.current) {
          lastFinalTranscriptRef.current = finalTranscript
          // Solo mantener la última línea
          setTranscriptHistory([finalTranscript.trim()])
          setTranscript(interimTranscript.trim())
        } else {
          // Solo actualizar el texto interim
          setTranscript(interimTranscript.trim())
        }
      } catch (e) {
        console.error("Error en reconocimiento:", e)
      }
    }

    recognition.onerror = (event: any) => {
      console.error("Error de reconocimiento:", event.error)
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setIsRecognitionActive(false)
      }
    }

    recognition.onend = () => {
      // Auto-reiniciar si el video sigue reproduciéndose y los subtítulos están activos
      if (isPlaying && state.captionsEnabled && videoRef.current && !videoRef.current.paused) {
        try {
          recognition.start()
        } catch (e) {
          // Ya está iniciado
        }
      } else {
        setIsRecognitionActive(false)
        setTranscript("")
        setTranscriptHistory([])
        lastFinalTranscriptRef.current = ""
      }
    }

    recognitionRef.current = recognition

    return () => {
      try {
        recognition.stop()
      } catch (e) {
        // Ignorar
      }
    }
  }, [])

  // Controlar el reconocimiento de voz según el estado
  useEffect(() => {
    if (!recognitionRef.current) return

    if (state.captionsEnabled && isPlaying && videoRef.current && !videoRef.current.paused) {
      try {
        if (!isRecognitionActive) {
          recognitionRef.current.start()
          setIsRecognitionActive(true)
        }
      } catch (e) {
        console.error("Error al iniciar reconocimiento:", e)
      }
    } else {
      try {
        if (isRecognitionActive) {
          recognitionRef.current.stop()
          setIsRecognitionActive(false)
          setTranscript("")
          setTranscriptHistory([])
          lastFinalTranscriptRef.current = ""
        }
      } catch (e) {
        // Ignorar
      }
    }
  }, [state.captionsEnabled, isPlaying])

  const togglePlay = () => {
    if (!videoRef.current) return

    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return
    setDuration(videoRef.current.duration)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    const time = parseFloat(e.target.value)
    videoRef.current.currentTime = time
    setCurrentTime(time)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return
    const vol = parseFloat(e.target.value)
    videoRef.current.volume = vol
    setVolume(vol)
  }

  const toggleFullscreen = () => {
    if (!videoRef.current) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      videoRef.current.requestFullscreen()
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
      >
        Tu navegador no soporta el elemento de video.
      </video>

      {/* Subtítulos en tiempo real */}
      {state.captionsEnabled && (transcriptHistory.length > 0 || transcript) && (
        <div className="absolute bottom-20 left-0 right-0 px-4 pointer-events-none">
          <div className="bg-black/80 backdrop-blur-sm text-white px-6 py-3 rounded-lg text-center max-w-4xl mx-auto">
            <div className="space-y-1">
              {/* Mostrar el historial de líneas finalizadas (hasta 3) */}
              {transcriptHistory.map((line, index) => (
                <p key={index} className="text-base leading-relaxed opacity-70">
                  {line}
                </p>
              ))}
              {/* Mostrar la línea actual (interim) con mayor opacidad */}
              {transcript && (
                <p className="text-lg leading-relaxed font-medium">
                  {transcript}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Controles personalizados */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4">
          {/* Barra de progreso */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`
              }}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Controles de reproducción */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                aria-label={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isPlaying ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              <span className="text-white text-sm font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Controles de volumen */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Indicador de subtítulos */}
            {state.captionsEnabled && (
              <div className="flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded-full">
                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-blue-400 font-medium">Subtítulos en tiempo real</span>
              </div>
            )}

            {/* Botón de pantalla completa */}
            <button
              onClick={toggleFullscreen}
              className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Pantalla completa"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Título del video */}
      {title && (
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
          <h3 className="text-white font-semibold">{title}</h3>
        </div>
      )}
    </div>
  )
}
