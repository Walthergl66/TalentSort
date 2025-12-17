import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import type { Metadata } from 'next'
import AccessibilityProvider from '@/components/Accesibilidad/AccessibilityProvider'
import AccessibilityMenu from '@/components/Accesibilidad/AccessibilityMenu'
import VoiceControl from '@/components/Accesibilidad/VoiceControl'
import '../globals.css'
import '@/components/Accesibilidad/accessibility.css'

export const metadata: Metadata = {
  title: 'Talent AI - Sistema de Reclutamiento Inteligente',
  description: 'Plataforma inteligente para análisis de CVs, gestión de candidatos y optimización del proceso de reclutamiento con IA.',
  keywords: 'reclutamiento, IA, CVs, candidatos, recursos humanos, talent acquisition',
  authors: [{ name: 'Talent AI Team' }],
  creator: 'Talent AI',
  publisher: 'Talent AI',
  robots: 'index, follow',
  // viewport moved to dedicated export `viewport` (see Next.js metadata API)
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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as 'en' | 'es')) {
    notFound();
  }
 
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} dir="ltr">
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
          {locale === 'es' ? 'Saltar al contenido principal' : 'Skip to main content'}
        </a>
        
        <NextIntlClientProvider messages={messages}>
          <AccessibilityProvider>
            <main id="main-content" role="main">
              {children}
            </main>
            <AccessibilityMenu />
            <VoiceControl />
          </AccessibilityProvider>
        </NextIntlClientProvider>

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
  );
}