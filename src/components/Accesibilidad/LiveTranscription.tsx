"use client"
import React, { useEffect, useRef, useState } from "react"
import { useAccessibility } from "./AccessibilityProvider"
import "./accessibility.css"

export default function LiveTranscription() {
  const { state, setState } = useAccessibility()
  const [supported, setSupported] = useState(true)
  const [active, setActive] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [rawError, setRawError] = useState<string | null>(null)
  const [micTest, setMicTest] = useState<string | null>(null)
  const [online, setOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const recognitionRef = useRef<any | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [diagLogs, setDiagLogs] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      return
    }

    const rec = new SpeechRecognition()
    rec.lang = "es-ES"
    rec.interimResults = true
    rec.continuous = true
    rec.maxAlternatives = 1

    rec.onresult = (ev: any) => {
      // Build transcript from results
      try {
        const parts: string[] = []
        for (let i = 0; i < ev.results.length; i++) {
          parts.push(ev.results[i][0].transcript)
        }
        setTranscript(parts.join(" "))
        setError(null) // Limpiar error si funciona
      } catch (e) {
        // ignore
      }
    }

    rec.onstart = () => {
      setActive(true)
      setError(null)
      setTranscript("")
    }
    
    rec.onend = () => {
      setActive(false)
      // Auto-reiniciar si está habilitado
      if (state.liveTranscriptionEnabled) {
        setTimeout(() => {
          try {
            if (recognitionRef.current && state.liveTranscriptionEnabled) {
              recognitionRef.current.start()
            }
          } catch (e) {
            // El micrófono puede no estar disponible
          }
        }, 500)
      }
    }
    
    rec.onerror = (e: any) => {
      // Map known errors to friendly messages and keep raw for diagnostics
      try {
        const raw = e?.error || e?.name || e?.message || JSON.stringify(e)
        const rawStr = String(raw)
        setRawError(rawStr)
        const r = rawStr.toLowerCase()
        let friendly = rawStr
        if (r.includes('network')) friendly = 'Error de red: comprueba tu conexión a Internet'
        else if (r.includes('not-allowed') || r.includes('permission')) friendly = 'Permiso denegado: habilita el micrófono en el navegador'
        else if (r.includes('no-speech')) friendly = 'No se detectó voz en el micrófono'
        else if (r.includes('audio-capture')) friendly = 'No se detectó dispositivo de entrada (micrófono)'
        else if (r.includes('aborted')) friendly = 'Reconocimiento interrumpido'
        setError(friendly)
        console.error('SpeechRecognition raw error:', raw)
      } catch (ex) {
        setError('Error de reconocimiento de voz')
      }
      setActive(false)
    }

    recognitionRef.current = rec

    return () => {
      try { rec.stop() } catch (e) {}
      recognitionRef.current = null
    }
  }, [])

  // Start/stop based on state.liveTranscriptionEnabled
  useEffect(() => {
    if (!recognitionRef.current) return
    const rec = recognitionRef.current
    // If liveTranscriptionEnabled becomes false, ensure recognition is stopped
    if (!state.liveTranscriptionEnabled) {
      try { rec.stop() } catch (e) {}
      setTranscript("")
      setActive(false)
      setError(null)
    }
  }, [state.liveTranscriptionEnabled])

  // Track online/offline status
  useEffect(() => {
    function handleOnline() { setOnline(true) }
    function handleOffline() { setOnline(false) }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline) }
  }, [])

  const testMic = async () => {
    setMicTest(null)
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicTest('API getUserMedia no disponible en este navegador')
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // if we got stream, mic works
      setMicTest('Micrófono detectado correctamente')
      // stop tracks
      stream.getTracks().forEach(t => t.stop())
    } catch (err: any) {
      const msg = err?.name || err?.message || String(err)
      if (String(msg).toLowerCase().includes('notallowed') || String(msg).toLowerCase().includes('permission')) {
        setMicTest('Permiso denegado para usar el micrófono')
      } else {
        setMicTest(String(msg))
      }
    }
  }

  const pushDiag = (msg: string) => setDiagLogs(s => [...s, `${new Date().toLocaleTimeString()}: ${msg}`])

  const runDiagnostics = async () => {
    setDiagLogs([])
    pushDiag('Iniciando diagnóstico...')

    // 1) Soporte de SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    pushDiag(`SpeechRecognition disponible: ${!!SpeechRecognition}`)

    // 2) Intentar arrancar un reconocimiento corto para capturar errores (network/permission/etc)
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition()
        rec.lang = 'es-ES'
        rec.interimResults = true
        let seenError = false
        rec.onerror = (e: any) => {
          const raw = e?.error || e?.message || JSON.stringify(e)
          pushDiag(`SpeechRecognition error: ${raw}`)
          seenError = true
        }
        rec.onstart = () => pushDiag('SpeechRecognition: started')
        rec.onend = () => pushDiag('SpeechRecognition: ended')
        try {
          rec.start()
          pushDiag('Intentando start() — acepta el permiso si el navegador lo solicita')
          // stop after a few seconds
          setTimeout(() => {
            try { rec.stop(); pushDiag('Se detuvo la prueba de SpeechRecognition (timeout)') } catch (e) { pushDiag('stop() falló: ' + String(e)) }
          }, 5000)
        } catch (err: any) {
          pushDiag('start() lanzó: ' + (err?.message || String(err)))
        }
        // give it a short time to surface an error
        await new Promise(r => setTimeout(r, 1800))
        if (!seenError) pushDiag('No se detectó error inmediato al arrancar SpeechRecognition')
      } catch (err: any) {
        pushDiag('Error creando SpeechRecognition: ' + (err?.message || String(err)))
      }
    }

    // 3) Permissions API (microphone)
    try {
      if ((navigator as any).permissions && (navigator as any).permissions.query) {
        try {
          // some browsers may not accept 'microphone' so guard
          const p = await (navigator as any).permissions.query({ name: 'microphone' as any })
          pushDiag(`Permiso micrófono: state=${p.state}`)
        } catch (e) {
          pushDiag('Permissions API: no se pudo consultar microfono: ' + String(e))
        }
      } else {
        pushDiag('Permissions API no disponible en este navegador')
      }
    } catch (err: any) {
      pushDiag('Error Permissions API: ' + String(err))
    }

    // 4) getUserMedia prueba
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        pushDiag('getUserMedia no disponible')
      } else {
        try {
          const s = await navigator.mediaDevices.getUserMedia({ audio: true })
          pushDiag('getUserMedia OK — pistas abiertas: ' + s.getTracks().length)
          s.getTracks().forEach((t: any) => t.stop())
        } catch (err: any) {
          pushDiag('getUserMedia fallo: ' + (err?.name || err?.message || String(err)))
        }
      }
    } catch (err: any) {
      pushDiag('Error en getUserMedia: ' + String(err))
    }

    // 5) Contexto seguro / red / userAgent
    try {
      pushDiag('isSecureContext: ' + String(window.isSecureContext))
      pushDiag('navigator.onLine: ' + String(navigator.onLine))
      pushDiag('location.protocol: ' + location.protocol + ' host: ' + location.host)
      pushDiag('userAgent: ' + navigator.userAgent)
    } catch (err: any) {
      pushDiag('Error leyendo contexto: ' + String(err))
    }

    pushDiag('Diagnóstico finalizado')
  }

  const startRecognition = () => {
    setError(null)
    if (!recognitionRef.current) { setError('Reconocimiento no disponible'); return }
    try {
      recognitionRef.current.start()
      setActive(true)
    } catch (e: any) {
      // often thrown if already started or permission denied
      const msg = e?.message || e?.name || String(e)
      setError(String(msg))
      setActive(false)
    }
  }

  const stopRecognition = () => {
    if (!recognitionRef.current) return
    try { recognitionRef.current.stop(); setActive(false) } catch (e) { /* ignore */ }
  }

  // Avoid rendering on the server/early client render to prevent hydration mismatch.
  if (!mounted) return null
  if (!supported) return null
  if (!state.liveTranscriptionEnabled) return null

  return (
    <div className="live-transcription-overlay" aria-live="polite" role="status">
      <div className="live-transcription-header">
        <span>Transcripción en vivo</span>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          {active ? <span className="live-transcription-status">●</span> : null}
          <button
            className="live-transcription-close"
            aria-label="Cerrar transcripción"
            onClick={() => setState({ liveTranscriptionEnabled: false })}
          >
            ✕
          </button>
        </div>
      </div>
      <div className="live-transcription-body">{error ? <span style={{color:'#ff9b9b'}}>{error}</span> : (transcript || '...')}</div>
      <div className="live-transcription-controls">
        <button onClick={startRecognition} aria-label="Iniciar transcripción">Iniciar</button>
        <button onClick={stopRecognition} aria-label="Detener transcripción">Detener</button>
        <button onClick={testMic} aria-label="Probar micrófono">Probar micrófono</button>
        <button onClick={runDiagnostics} aria-label="Ejecutar diagnóstico">Diagnóstico</button>
      </div>
      <div className="live-transcription-hint">{!online ? 'Sin conexión: comprueba tu Internet' : 'Haz clic en Iniciar y acepta el permiso del micrófono si se solicita.'}</div>
      {micTest ? <div style={{marginTop:8, fontSize:12, color:'#ddd'}}>{micTest}</div> : null}
      {rawError ? (
        <div style={{marginTop:8}}>
          <button onClick={() => setShowDetails(s => !s)} style={{background:'transparent', border:'1px solid rgba(255,255,255,0.08)', color:'#fff', padding:'4px 8px', borderRadius:6}}>
            {showDetails ? 'Ocultar detalles' : 'Mostrar detalles'}
          </button>
          {showDetails ? <pre style={{whiteSpace:'pre-wrap', color:'#f0f0f0', fontSize:12, marginTop:6}}>{rawError}</pre> : null}
        </div>
      ) : null}
      {diagLogs && diagLogs.length > 0 ? (
        <div style={{marginTop:12, maxHeight:220, overflow:'auto', background:'rgba(0,0,0,0.25)', padding:8, borderRadius:6}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, marginBottom:6}}>
            <strong>Registro diagnóstico</strong>
            <div style={{display:'flex', gap:6}}>
              <button onClick={() => setDiagLogs([])} style={{padding:'4px 8px', borderRadius:6}}>Limpiar</button>
            </div>
          </div>
          <pre style={{whiteSpace:'pre-wrap', fontSize:12, color:'#fff', margin:0}}>{diagLogs.join('\n')}</pre>
        </div>
      ) : null}
    </div>
  )
}
