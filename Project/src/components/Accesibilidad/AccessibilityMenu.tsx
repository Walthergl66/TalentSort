"use client"
import React, { useEffect, useRef, useState } from "react"
import { useAccessibility } from "./AccessibilityProvider"
import "./accessibility.css"

export const AccessibilityMenu: React.FC = () => {
  const { state, setState, reset, speakPage } = useAccessibility()
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    if (open && dialogRef.current) dialogRef.current.focus()
  }, [open])

  const toggle = (k: keyof typeof state) => {
    // @ts-ignore
    setState({ [k]: !state[k] })
  }

  return (
    <div className="a11y-menu-root">
      <button
        aria-haspopup="dialog"
        aria-expanded={open}
        className="a11y-toggle-button"
        onClick={() => setOpen(v => !v)}
        title="Abrir menú de accesibilidad"
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
          className="a11y-menu"
        >
          <header className="a11y-menu-header">
            <h3>Accesibilidad</h3>
            <button onClick={() => setOpen(false)} aria-label="Cerrar menú">✕</button>
          </header>

          <section>
            <h4>Visual</h4>
            <label>
              <input
                type="checkbox"
                checked={state.highContrast}
                onChange={() => toggle("highContrast")}
              />
              Alto contraste
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
              Tamaño de texto: <strong>{Math.round(state.fontScale * 100)}%</strong>
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
              <input type="checkbox" checked={state.letterSpacing} onChange={() => toggle("letterSpacing")} />
              Aumentar espaciado entre letras y líneas
            </label>

            <label>
              Color de acento:
              <input
                aria-label="Color personalizado"
                type="color"
                value={state.customColor || "#3b82f6"}
                onChange={(e) => setState({ customColor: e.target.value })}
              />
            </label>
          </section>

          <section>
            <h4>Motriz / Operable</h4>
            <label>
              <input type="checkbox" checked={state.keyboardNavigation} onChange={() => toggle("keyboardNavigation")} />
              Navegación por teclado (mejor foco)
            </label>

            <label>
              <input type="checkbox" checked={state.largeButtons} onChange={() => toggle("largeButtons")} />
              Botones grandes
            </label>

            <label>
              <input type="checkbox" checked={state.reducedMotion} onChange={() => toggle("reducedMotion")} />
              Reducir animaciones
            </label>
          </section>

          <section>
            <h4>Audible / Multimedia</h4>
            <label>
              <input type="checkbox" checked={state.captionsEnabled} onChange={() => toggle("captionsEnabled")} />
              Subtítulos / transcripciones automáticas (cuando estén disponibles)
            </label>

                    <label>
                      <input type="checkbox" checked={state.hoverToSpeak} onChange={() => { setState({ hoverToSpeak: !state.hoverToSpeak, ttsEnabled: state.hoverToSpeak ? state.ttsEnabled : true }) }} />
                      Leer al pasar el cursor (hover-to-speak)
                    </label>

            <div className="a11y-tts-controls">
              <button onClick={() => { setState({ ttsEnabled: true }); speakPage() }}>Leer página</button>
              <button onClick={() => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); setState({ ttsEnabled: false }) }}>Detener lectura</button>
            </div>
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
