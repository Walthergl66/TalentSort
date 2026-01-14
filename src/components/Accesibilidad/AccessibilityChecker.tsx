"use client"

import { useState, useEffect } from 'react'

/**
 * Verificador de Accesibilidad WCAG
 * Herramienta para comprobar el cumplimiento de criterios WCAG 2.1/2.2
 */

interface AccessibilityCheck {
  id: string
  category: 'Motriz' | 'Visual' | 'Auditiva'
  criterion: string
  level: 'A' | 'AA' | 'AAA'
  description: string
  howToTest: string
  status: 'pass' | 'fail' | 'pending'
  notes?: string
}

export default function AccessibilityChecker() {
  const [checks, setChecks] = useState<AccessibilityCheck[]>([
    // MOTRIZ
    {
      id: 'M1',
      category: 'Motriz',
      criterion: '2.4.1 Bypass Blocks',
      level: 'A',
      description: 'Mecanismos para saltar bloques repetitivos',
      howToTest: '1. Recargar página\n2. Presionar Tab\n3. Verificar que aparezcan enlaces "Skip to main content" y "Skip to navigation"',
      status: 'pending'
    },
    {
      id: 'M2',
      category: 'Motriz',
      criterion: '2.1.1 Keyboard',
      level: 'A',
      description: 'Toda funcionalidad disponible por teclado',
      howToTest: '1. Usar solo Tab/Shift+Tab/Enter/Espacio\n2. Navegar por dashboard completo\n3. Verificar que todos los botones y enlaces funcionen',
      status: 'pending'
    },
    {
      id: 'M3',
      category: 'Motriz',
      criterion: '2.4.7 Focus Visible',
      level: 'AA',
      description: 'Indicador de foco claramente visible',
      howToTest: '1. Navegar con Tab\n2. Verificar outline azul de 3-4px en elementos enfocados\n3. Comprobar contraste mínimo 3:1',
      status: 'pending'
    },
    {
      id: 'M4',
      category: 'Motriz',
      criterion: '2.5.8 Target Size (Minimum)',
      level: 'AA',
      description: 'Objetivos táctiles mínimo 44x44px',
      howToTest: '1. Inspeccionar botones con DevTools\n2. Verificar que tengan min-width/height de 44px\n3. Probar en dispositivo móvil',
      status: 'pending'
    },
    {
      id: 'M5',
      category: 'Motriz',
      criterion: '2.2.1 Timing Adjustable',
      level: 'A',
      description: 'Permitir ajustar tiempos límite',
      howToTest: '1. Esperar 28 minutos\n2. Verificar que aparezca modal de timeout\n3. Presionar "Extender sesión"\n4. Verificar que la sesión se extiende',
      status: 'pending'
    },
    {
      id: 'M6',
      category: 'Motriz',
      criterion: '2.4.11 Focus Not Obscured (Minimum)',
      level: 'AA',
      description: 'Foco no debe quedar oculto',
      howToTest: '1. Navegar con Tab por toda la página\n2. Verificar que el elemento enfocado nunca quede oculto por headers/footers\n3. Scroll automático debe posicionar elemento visible',
      status: 'pending'
    },

    // VISUAL
    {
      id: 'V1',
      category: 'Visual',
      criterion: '1.4.3 Contrast (Minimum)',
      level: 'AA',
      description: 'Contraste mínimo 4.5:1 texto normal',
      howToTest: '1. Usar extensión WCAG Color Contrast Checker\n2. Verificar texto negro sobre blanco\n3. Verificar texto en modo oscuro',
      status: 'pending'
    },
    {
      id: 'V2',
      category: 'Visual',
      criterion: '1.4.10 Reflow',
      level: 'AA',
      description: 'Contenido adaptable sin scroll horizontal hasta 320px',
      howToTest: '1. Abrir DevTools\n2. Establecer viewport 320x568px\n3. Verificar que no aparezca scroll horizontal\n4. Verificar que todo el contenido sea accesible',
      status: 'pending'
    },
    {
      id: 'V3',
      category: 'Visual',
      criterion: '1.4.11 Non-text Contrast',
      level: 'AA',
      description: 'Contraste 3:1 para elementos UI',
      howToTest: '1. Verificar contraste de bordes de botones\n2. Verificar iconos y gráficos\n3. Usar herramienta de contraste',
      status: 'pending'
    },
    {
      id: 'V4',
      category: 'Visual',
      criterion: '1.4.12 Text Spacing',
      level: 'AA',
      description: 'Espaciado de texto ajustable',
      howToTest: '1. Aplicar CSS: line-height: 1.5, letter-spacing: 0.12em\n2. Verificar que no se pierda contenido\n3. Verificar que textos sigan legibles',
      status: 'pending'
    },
    {
      id: 'V5',
      category: 'Visual',
      criterion: '2.3.1 Three Flashes or Below',
      level: 'A',
      description: 'Sin parpadeos más de 3 veces por segundo',
      howToTest: '1. Revisar animaciones\n2. Verificar que no haya flasheos rápidos\n3. Comprobar transiciones suaves',
      status: 'pending'
    },
    {
      id: 'V6',
      category: 'Visual',
      criterion: '1.4.13 Content on Hover or Focus',
      level: 'AA',
      description: 'Contenido hover/focus es descartable y persistente',
      howToTest: '1. Hover sobre tooltips\n2. Verificar que se puedan cerrar con Esc\n3. Verificar que no desaparezcan al mover mouse sobre ellos',
      status: 'pending'
    },

    // AUDITIVA
    {
      id: 'A1',
      category: 'Auditiva',
      criterion: '1.2.1 Audio-only and Video-only',
      level: 'A',
      description: 'Alternativas para contenido solo audio/video',
      howToTest: '1. Localizar videos\n2. Verificar que tengan transcripciones o descripciones\n3. Comprobar accesibilidad de controles',
      status: 'pending'
    },
    {
      id: 'A2',
      category: 'Auditiva',
      criterion: '1.2.2 Captions (Prerecorded)',
      level: 'A',
      description: 'Subtítulos para audio pregrabado',
      howToTest: '1. Reproducir video pregrabado\n2. Activar subtítulos\n3. Verificar sincronización',
      status: 'pending'
    },
    {
      id: 'A3',
      category: 'Auditiva',
      criterion: '1.4.2 Audio Control',
      level: 'A',
      description: 'Control sobre audio que se reproduce automáticamente',
      howToTest: '1. Verificar que no haya audio automático\n2. Si lo hay, comprobar botón de pausa/stop\n3. Verificar control de volumen',
      status: 'pending'
    },
    {
      id: 'A4',
      category: 'Auditiva',
      criterion: '2.2.2 Pause, Stop, Hide',
      level: 'A',
      description: 'Pausar/detener contenido en movimiento',
      howToTest: '1. Identificar contenido animado\n2. Verificar controles de pausa\n3. Comprobar preferencia prefers-reduced-motion',
      status: 'pending'
    }
  ])

  const [filter, setFilter] = useState<'all' | 'Motriz' | 'Visual' | 'Auditiva'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pass' | 'fail' | 'pending'>('all')
  const [selectedCheck, setSelectedCheck] = useState<AccessibilityCheck | null>(null)

  const updateCheckStatus = (id: string, status: 'pass' | 'fail' | 'pending', notes?: string) => {
    setChecks(prev => prev.map(check => 
      check.id === id ? { ...check, status, notes } : check
    ))
  }

  const filteredChecks = checks.filter(check => {
    if (filter !== 'all' && check.category !== filter) return false
    if (statusFilter !== 'all' && check.status !== statusFilter) return false
    return true
  })

  const stats = {
    total: checks.length,
    passed: checks.filter(c => c.status === 'pass').length,
    failed: checks.filter(c => c.status === 'fail').length,
    pending: checks.filter(c => c.status === 'pending').length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'fail': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'A': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'AA': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'AAA': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2">♿ Verificador de Accesibilidad WCAG</h1>
        <p className="text-blue-100">Comprueba el cumplimiento de criterios WCAG 2.1/2.2</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Criterios</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg shadow">
          <div className="text-sm text-green-600 dark:text-green-400 mb-1">✅ Cumplidos</div>
          <div className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.passed}</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg shadow">
          <div className="text-sm text-red-600 dark:text-red-400 mb-1">❌ No Cumplidos</div>
          <div className="text-3xl font-bold text-red-700 dark:text-red-300">{stats.failed}</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">⏳ Pendientes</div>
          <div className="text-3xl font-bold text-gray-700 dark:text-gray-300">{stats.pending}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoría
            </label>
            <div className="flex gap-2">
              {(['all', 'Motriz', 'Visual', 'Auditiva'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {cat === 'all' ? 'Todas' : cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado
            </label>
            <div className="flex gap-2">
              {(['all', 'pass', 'fail', 'pending'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status === 'all' && 'Todos'}
                  {status === 'pass' && '✅ Cumplido'}
                  {status === 'fail' && '❌ No cumplido'}
                  {status === 'pending' && '⏳ Pendiente'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Checks List */}
      <div className="space-y-4">
        {filteredChecks.map(check => (
          <div
            key={check.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(check.status)}`}>
                    {check.status === 'pass' && '✅ Cumplido'}
                    {check.status === 'fail' && '❌ No cumplido'}
                    {check.status === 'pending' && '⏳ Pendiente'}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getLevelColor(check.level)}`}>
                    {check.level}
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {check.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {check.id}: {check.criterion}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-3">{check.description}</p>
                
                <details className="mt-3">
                  <summary className="cursor-pointer text-blue-600 dark:text-blue-400 font-medium hover:underline">
                    📋 Cómo probar este criterio
                  </summary>
                  <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                      {check.howToTest}
                    </pre>
                  </div>
                </details>

                {check.notes && (
                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 rounded">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Notas:</strong> {check.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => updateCheckStatus(check.id, 'pass')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                ✅ Marcar como cumplido
              </button>
              <button
                onClick={() => updateCheckStatus(check.id, 'fail')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                ❌ Marcar como no cumplido
              </button>
              <button
                onClick={() => updateCheckStatus(check.id, 'pending')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                ⏳ Pendiente
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredChecks.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No hay criterios que coincidan con los filtros seleccionados
        </div>
      )}

      {/* Export Results */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 Exportar Resultados
        </h3>
        <button
          onClick={() => {
            const report = checks.map(c => `${c.id} - ${c.criterion}: ${c.status.toUpperCase()}${c.notes ? ` (${c.notes})` : ''}`).join('\n')
            const blob = new Blob([report], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `accessibility-report-${new Date().toISOString().split('T')[0]}.txt`
            a.click()
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          💾 Descargar Reporte de Accesibilidad
        </button>
      </div>
    </div>
  )
}
