'use client'

import { useRouter } from 'next/navigation'

export default function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      name: 'Actualizar CV',
      description: 'Subir o actualizar tu CV',
      href: '/dashboard/cv',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      color: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    {
      name: 'Buscar Trabajos',
      description: 'Explorar oportunidades',
      href: '/dashboard/jobs/search',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      color: 'bg-green-600 hover:bg-green-700 text-white'
    },
    {
      name: 'Mi Perfil',
      description: 'Editar perfil profesional',
      href: '/dashboard/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: 'bg-gray-600 hover:bg-gray-700 text-white'
    }
  ]

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={() => router.push(action.href)}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${action.color} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
          aria-label={action.description}
        >
          {action.icon}
          <span className="ml-2 hidden sm:inline">
            {action.name}
          </span>
        </button>
      ))}
    </div>
  )
}