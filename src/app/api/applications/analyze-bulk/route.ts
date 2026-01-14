// app/api/applications/analyze-bulk/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { aiService } from '@/lib/aiService'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, userId } = body

    if (!jobId || !userId) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: jobId, userId' },
        { status: 400 }
      )
    }

    // Verificar que el usuario sea el dueño de la vacante
    const { data: job, error: jobError } = await supabase
      .from('job_vacancies')
      .select('*')
      .eq('id', jobId)
      .eq('company_id', userId)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Vacante no encontrada o no tienes permiso' },
        { status: 404 }
      )
    }

    // Obtener todas las aplicaciones pendientes
    const { data: applications, error: appsError } = await supabase
      .from('job_applications')
      .select(`
        *,
        candidate:profiles!job_applications_candidate_id_fkey(*),
        cv:candidate_cvs!job_applications_cv_id_fkey(*)
      `)
      .eq('job_id', jobId)
      .eq('status', 'pending')

    if (appsError) {
      throw new Error('Error al obtener aplicaciones')
    }

    if (!applications || applications.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay aplicaciones pendientes para analizar',
        data: []
      })
    }

    // Preparar datos para análisis masivo
    const applicationsToAnalyze = applications.map(app => ({
      candidateId: app.candidate_id,
      candidateName: app.candidate.full_name,
      cvText: app.cv.cv_text
    }))

    // Analizar todos los CVs
    const analyses = await aiService.analyzeBulkCVs(
      applicationsToAnalyze,
      job.requirements,
      job.title
    )

    // Actualizar aplicaciones con los resultados
    const updates = analyses.map(async (result) => {
      const app = applications.find(a => a.candidate_id === result.candidateId)
      if (!app) return null

      return supabase
        .from('job_applications')
        .update({
          status: 'reviewing',
          ai_score: result.analysis.score,
          match_percentage: result.analysis.match_percentage,
          ai_analysis: result.analysis,
          updated_at: new Date().toISOString()
        })
        .eq('id', app.id)
    })

    await Promise.all(updates)

    return NextResponse.json({
      success: true,
      message: `Se analizaron ${analyses.length} aplicaciones`,
      data: analyses
    })
  } catch (error: any) {
    console.error('Error en /api/applications/analyze-bulk:', error)
    return NextResponse.json(
      { error: error.message || 'Error al analizar aplicaciones' },
      { status: 500 }
    )
  }
}
