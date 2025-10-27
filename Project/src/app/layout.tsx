import type { Metadata } from 'next'
import AccessibilityProvider from '@/components/Accesibilidad/AccessibilityProvider'
import AccessibilityMenu from '@/components/Accesibilidad/AccessibilityMenu'
import './globals.css'
import '@/components/Accesibilidad/accessibility.css'

export const metadata: Metadata = {
  title: 'Talent AI - Sistema de Reclutamiento Inteligente',
  description: 'Plataforma inteligente para análisis de CVs, gestión de candidatos y optimización del proceso de reclutamiento con IA.',
  keywords: 'reclutamiento, IA, CVs, candidatos, recursos humanos, talent acquisition',
  authors: [{ name: 'Talent AI Team' }],
  creator: 'Talent AI',
  publisher: 'Talent AI',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  openGraph: {
    title: 'Talent AI - Sistema de Reclutamiento Inteligente',
    description: 'Optimiza tu proceso de reclutamiento con inteligencia artificial',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Talent AI - Sistema de Reclutamiento Inteligente',
    description: 'Optimiza tu proceso de reclutamiento con inteligencia artificial',
  },
  // Metadatos de accesibilidad
  other: {
    'theme-color': '#3b82f6',
    'color-scheme': 'light dark',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" dir="ltr">
      <head>
        {/* Enlaces de skip para accesibilidad */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Metadatos adicionales de accesibilidad */}
        <meta name="color-scheme" content="light dark" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        {/* Skip link para navegación por teclado */}
        <a 
          href="#main-content" 
          className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
        >
          Saltar al contenido principal
        </a>
        
        <AccessibilityProvider>
          <main id="main-content" role="main">
            {children}
          </main>
          <AccessibilityMenu />
        </AccessibilityProvider>

        {/* Script para detectar navegación por teclado */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function handleFirstTab(e) {
                  if (e.keyCode === 9) {
                    document.body.classList.add('user-is-tabbing');
                    window.removeEventListener('keydown', handleFirstTab);
                  }
                }
                window.addEventListener('keydown', handleFirstTab);
              })();
            `
          }}
        />
      </body>
    </html>
  )
}