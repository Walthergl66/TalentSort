"use client"

/**
 * SkipLink Component
 * WCAG 2.4.1 - Bypass Blocks (Level A)
 * 
 * Permite a usuarios de teclado y lectores de pantalla saltar directamente
 * al contenido principal sin tener que navegar por el menú/header completo.
 */
export const SkipLink: React.FC = () => {
  return (
    <>
      <a 
        href="#main-content" 
        className="skip-link"
        aria-label="Saltar al contenido principal"
      >
        Saltar al contenido principal
      </a>
      <a 
        href="#navigation" 
        className="skip-link"
        style={{ left: '180px' }}
        aria-label="Saltar a la navegación"
      >
        Saltar a navegación
      </a>
    </>
  )
}

export default SkipLink
