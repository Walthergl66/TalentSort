'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function CandidatePipeline() {
  const [pipelineData, setPipelineData] = useState({
    applied: 0,
    under_review: 0,
    interview_scheduled: 0,
    offer_received: 0,
    rejected: 0
  })
  const [recentApplications, setRecentApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPipelineData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Obtener conteos por estado de postulaciones del usuario
        const statuses = ['applied', 'under_review', 'interview_scheduled', 'offer_received', 'rejected']
        const counts: Record<string, number> = {}

        for (const status of statuses) {
          const { count } = await supabase
            .from('job_applications')
            .select('*', { count: 'exact', head: true })
            .eq('candidate_id', user.id)
            .eq('status', status)
          
          counts[status] = count || 0
        }

        setPipelineData(counts as any)

        // Obtener postulaciones recientes del usuario
        const { data: applications } = await supabase
          .from('job_applications')
          .select(`
            *,
            job_positions (
              title,
              company_name,
              salary_range
            )
          `)
          .eq('candidate_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        setRecentApplications(applications || [])
      } catch (error) {
        console.error('Error fetching pipeline data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPipelineData()
  }, [])

  const pipelineStages = [
    {
      name: 'Aplicadas',
      count: pipelineData.applied,
      status: 'applied',
      color: 'bg-blue-100 text-blue-800',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      name: 'En Revisión',
      count: pipelineData.under_review,
      status: 'under_review',
      color: 'bg-yellow-100 text-yellow-800',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      name: 'Entrevistas',
      count: pipelineData.interview_scheduled,
      status: 'interview_scheduled',
      color: 'bg-purple-100 text-purple-800',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h2a2 2 0 012 2v1m-6 0h6m-6 0l1 10a2 2 0 002 2h4a2 2 0 002-2l1-10" />
        </svg>
      )
    },
    {
      name: 'Ofertas',
      count: pipelineData.offer_received,
      status: 'offer_received',
      color: 'bg-green-100 text-green-800',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    {
      name: 'Rechazadas',
      count: pipelineData.rejected,
      status: 'rejected',
      color: 'bg-red-100 text-red-800',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    }
  ]

  const getStatusBadge = (status: string) => {
    const stage = pipelineStages.find(s => s.status === status)
    if (!stage) return null

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stage.color}`}>
        {stage.name}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Estado de mis Postulaciones
        </h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Ver todas
        </button>
      </div>

      {/* Stages overview */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {pipelineStages.map((stage, index) => (
          <div
            key={index}
            className="text-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200"
          >
            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${stage.color} mb-2`}>
              {stage.icon}
            </div>
            <p className="text-2xl font-semibold text-gray-900">{stage.count}</p>
            <p className="text-xs text-gray-600">{stage.name}</p>
          </div>
        ))}
      </div>

      {/* Recent applications */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">
          Postulaciones Recientes
        </h4>
        <div className="space-y-3">
          {recentApplications.length > 0 ? (
            recentApplications.map((application: any) => (
              <div
                key={application.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {application.job_positions?.company_name?.charAt(0) || 'C'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {application.job_positions?.title || 'Trabajo sin título'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {application.job_positions?.company_name || 'Empresa no especificada'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {application.job_positions?.salary_range || 'No especificado'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Salario
                    </p>
                  </div>
                  {getStatusBadge(application.status)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm text-gray-500">
                No hay postulaciones aún
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Comienza aplicando a trabajos que te interesen
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}