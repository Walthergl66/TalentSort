/**
 * @fileoverview API Route para análisis de CVs
 * @module app/api/analyze-cv
 */

import { NextRequest, NextResponse } from 'next/server';

import { sendMessageToChatAgent } from '@/lib/aiService';

/**
 * POST /api/analyze-cv
 * Analiza un CV comparándolo con los requisitos de una vacante
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validar campos requeridos mínimos
    if (!body.cv_text || !body.job_description) {
      return NextResponse.json(
        { 
          error: 'Campos requeridos faltantes',
          detalles: 'Se requiere cv_text y job_description'
        },
        { status: 400 }
      );
    }

    // Llamar a sendMessageToChatAgent con el objeto esperado
    const respuesta = await sendMessageToChatAgent({
      cvText: body.cv_text,
      jobDescription: body.job_description,
      requiredSkills: body.required_skills,
      requiredExperience: body.required_experience
    });
      // La respuesta ya es un objeto JSON
      return NextResponse.json(respuesta);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Error al analizar el CV',
        detalles: error.message || 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
