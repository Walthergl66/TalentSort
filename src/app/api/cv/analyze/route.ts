// app/api/cv/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/aiService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cvText, jobRequirements, jobTitle } = body

    if (!cvText || !jobRequirements || !jobTitle) {
      return NextResponse.json(
        { error: 'Faltan parámetros requeridos: cvText, jobRequirements, jobTitle' },
        { status: 400 }
      )
    }

    // Analizar CV con la IA
    const analysis = await aiService.analyzeCV(cvText, jobRequirements, jobTitle)

    return NextResponse.json({
      success: true,
      data: analysis
    })
  } catch (error: any) {
    console.error('Error en /api/cv/analyze:', error)
    return NextResponse.json(
      { error: error.message || 'Error al analizar el CV' },
      { status: 500 }
    )
  }
}
