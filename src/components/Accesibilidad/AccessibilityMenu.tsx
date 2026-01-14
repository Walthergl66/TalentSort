"use client"
import React, { useEffect, useRef, useState } from "react"
import { useAccessibility } from "./AccessibilityProvider"
import "./accessibility.css"

export const AccessibilityMenu: React.FC = () => {
  const { state, setState, reset, speakPage } = useAccessibility()
  const [open, setOpen] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // ESC para cerrar
      if (e.key === "Escape") {
        setOpen(false)
        setActiveSubmenu(null)
      }
      
      // Alt + A para abrir/cerrar el menú
      if (e.altKey && e.key === "a") {
        e.preventDefault()
        setOpen(v => !v)
      }

      // Atajos de teclado cuando el menú está abierto
      if (open) {
        // Alt + 1: Alto contraste
        if (e.altKey && e.key === "1") {
          e.preventDefault()
          setState({ highContrast: !state.highContrast })
        }
        // Alt + 2: Aumentar texto
        if (e.altKey && e.key === "2") {
          e.preventDefault()
          setState({ fontScale: Math.min(state.fontScale + 0.1, 1.6) })
        }
        // Alt + 3: Reducir texto
        if (e.altKey && e.key === "3") {
          e.preventDefault()
          setState({ fontScale: Math.max(state.fontScale - 0.1, 0.8) })
        }
        // Alt + 4: Navegación por teclado
        if (e.altKey && e.key === "4") {
          e.preventDefault()
          setState({ keyboardNavigation: !state.keyboardNavigation })
        }
        // Alt + 5: Leer página
        if (e.altKey && e.key === "5") {
          e.preventDefault()
          setState({ ttsEnabled: true })
          speakPage()
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, state, setState, speakPage])

  useEffect(() => {
    if (open && dialogRef.current) dialogRef.current.focus()
  }, [open])

  const toggle = (k: keyof typeof state) => {
    // @ts-ignore
    setState({ [k]: !state[k] })
  }

  const toggleSubmenu = (submenu: string) => {
    setActiveSubmenu(activeSubmenu === submenu ? null : submenu)
  }

  return (
    <div className="a11y-menu-root">
      <button
        aria-haspopup="dialog"
        aria-expanded={open}
        className="a11y-toggle-button"
        onClick={() => setOpen(v => !v)}
        title="Abrir menú de accesibilidad (Alt + A)"
        aria-label="Menú de accesibilidad"
      >
        {/* Icono: persona en silla de ruedas (inline SVG) */}
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg">
          <circle cx="8" cy="4.5" r="1.5" />
          <path d="M10 8.5h3l1 3h2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 12.5c0 .6.2 1.2.6 1.6L12 18" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="17" cy="17" r="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M14.5 14.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span>Accesibilidad</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Menú de accesibilidad"
          tabIndex={-1}
          ref={dialogRef}
          className="a11y-menu a11y-menu-lateral"
        >
          <header className="a11y-menu-header">
            <h3>Accesibilidad</h3>
            <button onClick={() => setOpen(false)} aria-label="Cerrar menú (ESC)">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          {/* Información de atajos */}
          <div className="a11y-shortcuts-info">
            <p className="text-xs text-gray-600 mb-2">
              <strong>Atajos de teclado:</strong>
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li><kbd>Alt+A</kbd> Abrir/Cerrar menú</li>
              <li><kbd>Alt+1</kbd> Alto contraste</li>
              <li><kbd>Alt+2/3</kbd> Ajustar texto</li>
              <li><kbd>Alt+4</kbd> Nav. teclado</li>
              <li><kbd>Alt+5</kbd> Leer página</li>
              <li><kbd>ESC</kbd> Cerrar</li>
            </ul>
          </div>

          {/* Submenú: Visual */}
          <section className="a11y-submenu">
            <button 
              className="a11y-submenu-header"
              onClick={() => toggleSubmenu('visual')}
              aria-expanded={activeSubmenu === 'visual'}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Visual
              </span>
              <span className="a11y-submenu-arrow">{activeSubmenu === 'visual' ? '▼' : '▶'}</span>
            </button>
            
            {activeSubmenu === 'visual' && (
              <div className="a11y-submenu-content">
                <label>
                  <input
                    type="checkbox"
                    checked={state.highContrast}
                    onChange={() => toggle("highContrast")}
                  />
                  <span>Alto contraste <kbd className="a11y-kbd">Alt+1</kbd></span>
                </label>

                <label>
                  Nivel de contraste:
                  <select value={state.contrastLevel} onChange={(e) => setState({ contrastLevel: e.target.value as any })}>
                    <option value="soft">Suave</option>
                    <option value="medium">Medio</option>
                    <option value="high">Alto</option>
                  </select>
                </label>

                <label>
                  <span className="flex justify-between items-center">
                    Tamaño de texto: <strong>{Math.round(state.fontScale * 100)}%</strong>
                    <span className="text-xs">
                      <kbd className="a11y-kbd">Alt+2/3</kbd>
                    </span>
                  </span>
                  <input
                    aria-label="Escala de fuente"
                    type="range"
                    min={0.8}
                    max={1.6}
                    step={0.1}
                    value={state.fontScale}
                    onChange={(e) => setState({ fontScale: Number(e.target.value) })}
                  />
                </label>

                <label>
                  Familia de fuente:
                  <select value={state.fontFamily} onChange={(e) => setState({ fontFamily: e.target.value })}>
                    <option value="system-ui">Sistema (predeterminada)</option>
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="'Times New Roman', serif">Times New Roman</option>
                    <option value="'Courier New', monospace">Courier New</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="Verdana, sans-serif">Verdana</option>
                    <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
                    <option value="Tahoma, sans-serif">Tahoma</option>
                    <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                  </select>
                </label>

                <label>
                  <input type="checkbox" checked={state.letterSpacing} onChange={() => toggle("letterSpacing")} />
                  Aumentar espaciado entre letras y líneas
                </label>
              </div>
            )}
          </section>

          {/* Submenú: Motriz / Operable */}
          <section className="a11y-submenu">
            <button 
              className="a11y-submenu-header"
              onClick={() => toggleSubmenu('motor')}
              aria-expanded={activeSubmenu === 'motor'}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Motriz / Operable
              </span>
              <span className="a11y-submenu-arrow">{activeSubmenu === 'motor' ? '▼' : '▶'}</span>
            </button>
            
            {activeSubmenu === 'motor' && (
              <div className="a11y-submenu-content">
                <label>
                  <input type="checkbox" checked={state.keyboardNavigation} onChange={() => toggle("keyboardNavigation")} />
                  <span>Navegación por teclado <kbd className="a11y-kbd">Alt+4</kbd></span>
                </label>

                <label>
                  <input type="checkbox" checked={state.largeButtons} onChange={() => toggle("largeButtons")} />
                  Botones grandes
                </label>

                <label>
                  <input type="checkbox" checked={state.reducedMotion} onChange={() => toggle("reducedMotion")} />
                  Reducir animaciones
                </label>
              </div>
            )}
          </section>

          {/* Submenú: Audible / Multimedia */}
          <section className="a11y-submenu">
            <button 
              className="a11y-submenu-header"
              onClick={() => toggleSubmenu('audio')}
              aria-expanded={activeSubmenu === 'audio'}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 0112.728 0" />
                </svg>
                Audible / Multimedia
              </span>
              <span className="a11y-submenu-arrow">{activeSubmenu === 'audio' ? '▼' : '▶'}</span>
            </button>
            
            {activeSubmenu === 'audio' && (
              <div className="a11y-submenu-content">
                <label>
                  <input type="checkbox" checked={state.captionsEnabled} onChange={() => toggle("captionsEnabled")} />
                  Subtítulos / transcripciones automáticas
                </label>

                <label>
                  <input type="checkbox" checked={state.hoverToSpeak} onChange={() => { setState({ hoverToSpeak: !state.hoverToSpeak, ttsEnabled: state.hoverToSpeak ? state.ttsEnabled : true }) }} />
                  Leer al pasar el cursor (hover-to-speak)
                </label>

                {/* <label>
                  <input
                    type="checkbox"
                    checked={state.liveTranscriptionEnabled}
                    onChange={() => setState({ liveTranscriptionEnabled: !state.liveTranscriptionEnabled })}
                  />
                  Transcripción en vivo (Web Speech API)
                </label> */}

                <div className="a11y-tts-controls">
                  <button onClick={() => { setState({ ttsEnabled: true }); speakPage() }}>
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                      Leer página <kbd className="a11y-kbd">Alt+5</kbd>
                    </span>
                  </button>
                  <button onClick={() => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); setState({ ttsEnabled: false }) }}>
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                      Detener lectura
                    </span>
                  </button>
                </div>
              </div>
            )}
          </section>

          <footer className="a11y-menu-footer">
            <button onClick={() => { reset(); setOpen(false) }}>Restablecer</button>
            <small>WCAG 2.2 — opciones visibles</small>
          </footer>
        </div>
      )}
    </div>
  )
}

export default AccessibilityMenu
