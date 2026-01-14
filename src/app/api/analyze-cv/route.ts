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
  console.log('🔔 /api/analyze-cv - Nueva solicitud recibida');
  
  try {
    const body = await request.json();
    console.log('📦 Body recibido:', {
      hasCvText: !!body.cv_text,
      cvTextLength: body.cv_text?.length || 0,
      hasJobDescription: !!body.job_description,
      jobDescLength: body.job_description?.length || 0,
      hasRequiredSkills: !!body.required_skills,
      hasRequiredExperience: !!body.required_experience
    });
    
    // Validar campos requeridos mínimos
    if (!body.cv_text || !body.job_description) {
      console.error('❌ Validación fallida: Campos faltantes');
      return NextResponse.json(
        { 
          error: 'Campos requeridos faltantes',
          detalles: 'Se requiere cv_text y job_description'
        },
        { status: 400 }
      );
    }

    console.log('✅ Validación pasada, llamando a sendMessageToChatAgent...');
    
    // Llamar a sendMessageToChatAgent con el objeto esperado
    const respuesta = await sendMessageToChatAgent({
      cvText: body.cv_text,
      jobDescription: body.job_description,
      requiredSkills: body.required_skills,
      requiredExperience: body.required_experience
    });
    
    console.log('✅ Respuesta de IA recibida:', {
      hasScore: !!respuesta.score,
      score: respuesta.score,
      hasMatchPercentage: !!respuesta.match_percentage,
      matchPercentage: respuesta.match_percentage,
      hasError: !!respuesta.error
    });
    
    // La respuesta ya es un objeto JSON
    return NextResponse.json(respuesta);
  } catch (error: any) {
    console.error('💥 Error en /api/analyze-cv:', error);
    console.error('💥 Error message:', error.message);
    console.error('💥 Error stack:', error.stack);
    
    return NextResponse.json(
      {
        error: 'Error al analizar el CV',
        detalles: error.message || 'Error desconocido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
