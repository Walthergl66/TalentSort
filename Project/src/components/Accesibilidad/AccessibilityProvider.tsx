"use client"
import React, { createContext, useContext, useEffect, useState } from "react"

type AccessibilityState = {
  highContrast: boolean
  contrastLevel: "soft" | "medium" | "high"
  fontScale: number
  letterSpacing: boolean
  reducedMotion: boolean
  keyboardNavigation: boolean
  largeButtons: boolean
  ttsEnabled: boolean
  hoverToSpeak: boolean
  liveTranscriptionEnabled: boolean
  captionsEnabled: boolean
  customColor?: string | null
}

type AccessibilityContextType = {
  state: AccessibilityState
  setState: (s: Partial<AccessibilityState>) => void
  reset: () => void
  speakPage: () => void
}

const defaultState: AccessibilityState = {
  highContrast: false,
  contrastLevel: "medium",
  fontScale: 1,
  letterSpacing: false,
  reducedMotion: false,
  keyboardNavigation: false,
  largeButtons: false,
  ttsEnabled: false,
  hoverToSpeak: false,
  liveTranscriptionEnabled: false,
  captionsEnabled: false,
  customColor: null,
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) throw new Error("useAccessibility must be used inside AccessibilityProvider")
  return ctx
}

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setInternalState] = useState<AccessibilityState>(defaultState)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage only on client after hydration
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("a11y:settings") : null
      const loaded = raw ? JSON.parse(raw) : defaultState
      setInternalState(loaded)
    } catch (e) {
      setInternalState(defaultState)
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    // persist only after hydration
    if (!isHydrated) return
    
    try {
      localStorage.setItem("a11y:settings", JSON.stringify(state))
    } catch {
      // ignore
    }

    // apply classes / CSS variables on html element
    const root = document.documentElement
    if (state.highContrast) root.classList.add("a11y-high-contrast")
    else root.classList.remove("a11y-high-contrast")

    // contrast level classes (soft, medium, high)
    root.classList.remove("a11y-contrast-soft", "a11y-contrast-medium", "a11y-contrast-high")
    root.classList.add(`a11y-contrast-${state.contrastLevel}`)

    root.style.setProperty("--a11y-font-scale", String(state.fontScale))
    if (state.letterSpacing) root.classList.add("a11y-letter-spacing")
    else root.classList.remove("a11y-letter-spacing")

    if (state.reducedMotion) root.classList.add("a11y-reduced-motion")
    else root.classList.remove("a11y-reduced-motion")

    if (state.keyboardNavigation) root.classList.add("a11y-keyboard-nav")
    else root.classList.remove("a11y-keyboard-nav")

    if (state.largeButtons) root.classList.add("a11y-large-buttons")
    else root.classList.remove("a11y-large-buttons")

    if (state.customColor) root.style.setProperty("--a11y-accent", state.customColor)
    else root.style.removeProperty("--a11y-accent")
  }, [state, isHydrated])

  // hover-to-speak: speak text when pointer moves over elements (optional)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!state.hoverToSpeak || !state.ttsEnabled) return

    let lastText = ''
    let lastTimeout: number | null = null

    const handler = (ev: PointerEvent) => {
      try {
        const target = ev.target as HTMLElement | null
        if (!target) return

        // don't read the accessibility menu itself or its controls
        if (target.closest && (target.closest('.a11y-menu') || target.closest('.a11y-menu-root'))) return

        // prefer accessible name attributes
        let text = ''
        if (target.getAttribute) {
          text = (target.getAttribute('aria-label') || target.getAttribute('title') || target.getAttribute('alt') || '').trim()
        }
        if (!text) text = (target.textContent || '').trim()
        if (!text) return

        // normalize and shorten
        text = text.replace(/\s+/g, ' ').slice(0, 300)

        if (!text || text === lastText) return

        // debounce short interval to avoid too-frequent speech
        if (lastTimeout) {
          window.clearTimeout(lastTimeout)
        }

        lastText = text
        lastTimeout = window.setTimeout(() => { lastText = '' ; lastTimeout = null }, 900)

        // speak
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel()
          const u = new SpeechSynthesisUtterance(text)
          u.rate = 1
          u.pitch = 1
          window.speechSynthesis.speak(u)
        }
      } catch (e) {
        // ignore errors
      }
    }

    window.addEventListener('pointerover', handler, { capture: true })
    return () => {
      window.removeEventListener('pointerover', handler, { capture: true })
      if (lastTimeout) window.clearTimeout(lastTimeout)
    }
  }, [state.hoverToSpeak, state.ttsEnabled])

  const setState = (s: Partial<AccessibilityState>) => setInternalState(prev => ({ ...prev, ...s }))

  const reset = () => setInternalState(defaultState)

  const speakPage = () => {
    if (!('speechSynthesis' in window)) return
    const text = document.body.innerText || document.body.textContent || ''
    if (!text) return
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = 1
    utter.pitch = 1
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }

  return (
    <AccessibilityContext.Provider value={{ state, setState, reset, speakPage }}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export default AccessibilityProvider
