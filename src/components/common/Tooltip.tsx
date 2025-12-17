'use client'

import { ReactNode } from 'react'

interface TooltipProps {
  content: string
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export default function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900'
  }

  return (
    <div className="help-tooltip relative inline-block group">
      {children}
      <div 
        className={`
          tooltip-content
          invisible opacity-0 group-hover:visible group-hover:opacity-100
          absolute ${positionClasses[position]}
          bg-gray-900 text-white text-xs rounded-lg py-2 px-3
          transition-all duration-200 ease-in-out
          whitespace-normal max-w-xs z-50
          shadow-lg
        `}
        role="tooltip"
      >
        {content}
        <div 
          className={`
            absolute ${arrowClasses[position]}
            border-4 border-transparent
          `}
        />
      </div>
    </div>
  )
}

// Componente de icono de ayuda reutilizable
export function HelpIcon({ className = '' }: { className?: string }) {
  return (
    <svg 
      className={`w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors ${className}`}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
      />
    </svg>
  )
}

// Componente Label con Tooltip integrado
export function LabelWithTooltip({ 
  label, 
  tooltip, 
  required = false,
  htmlFor
}: { 
  label: string
  tooltip: string
  required?: boolean
  htmlFor?: string
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-2">
      <div className="flex items-center gap-1.5">
        {label}
        {required && <span className="text-red-500">*</span>}
        <Tooltip content={tooltip}>
          <HelpIcon />
        </Tooltip>
      </div>
    </label>
  )
}
