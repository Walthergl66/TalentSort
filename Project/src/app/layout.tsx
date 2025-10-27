// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import AccessibilityProvider from '../components/Accesibilidad/AccessibilityProvider'
import AccessibilityMenu from '../components/Accesibilidad/AccessibilityMenu'
import '../components/Accesibilidad/accessibility.css'

export const metadata: Metadata = {
  title: 'Sistema de Reclutamiento IA',
  description: 'Plataforma inteligente para gestión de CVs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50">
        <AccessibilityProvider>
          {children}
          <AccessibilityMenu />
        </AccessibilityProvider>
      </body>
    </html>
  )
}