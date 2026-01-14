import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
// Usar import dinámico de pdf-parse para evitar problemas en el bundle

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { cvId } = await request.json()

    console.log('📥 Extract CV text request:', { cvId })

    if (!cvId) {
      return NextResponse.json(
        { error: 'CV ID es requerido' },
        { status: 400 }
      )
    }

    // Obtener datos del CV de la base de datos
    const { data: cvData, error: cvError } = await supabase
      .from('user_cvs')
      .select('file_name, storage_path, summary, skills, experience_years, current_position, candidate_name, candidate_email')
      .eq('id', cvId)
      .maybeSingle()

    console.log('📄 CV data fetched:', { found: !!cvData, error: cvError })

    if (cvError || !cvData) {
      console.error('Error fetching CV:', cvError)
      return NextResponse.json(
        { error: 'CV no encontrado' },
        { status: 404 }
      )
    }

    let extractedText = ''

    // Si tiene storage_path, intentar descargar y extraer PDF
    if (cvData.storage_path) {
      try {
        console.log('📦 Descargando PDF desde storage:', cvData.storage_path)
        
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('cvs')
          .download(cvData.storage_path)

        if (!downloadError && fileData) {
          // Convertir Blob a Buffer
          const arrayBuffer = await fileData.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          
          // Extraer texto del PDF usando la nueva API v2 (import dinámico)
          const pdfMod: any = await import('pdf-parse');
          const PDFParse: any = pdfMod.PDFParse;
          const parser = new PDFParse({ buffer });
          const pdfData = await parser.getText();
          extractedText = pdfData.text;
          console.log('✅ Texto extraído del PDF:', {
            length: extractedText.length
          });
        } else {
          console.warn('⚠️ No se pudo descargar el PDF:', downloadError)
        }
      } catch (error) {
        console.error('Error extrayendo PDF:', error)
        // Continuar con fallback
      }
    }

    // Si ya tiene summary o texto extraído, usarlo
    const finalText = extractedText || cvData.summary || `
INFORMACIÓN DEL CANDIDATO
Nombre: ${cvData.candidate_name || 'No especificado'}
Email: ${cvData.candidate_email || 'No especificado'}
Posición actual: ${cvData.current_position || 'No especificada'}
Años de experiencia: ${cvData.experience_years || 0}

HABILIDADES
${cvData.skills && cvData.skills.length > 0 ? cvData.skills.join(', ') : 'No especificadas'}

RESUMEN
El candidato ha presentado su currículum con la siguiente información básica.
    `.trim()

    return NextResponse.json({
      text: finalText,
      metadata: {
        candidate_name: cvData.candidate_name,
        candidate_email: cvData.candidate_email,
        skills: cvData.skills || [],
        experience_years: cvData.experience_years || 0,
        current_position: cvData.current_position,
        extracted_from_pdf: !!extractedText
      }
    })

  } catch (error: any) {
    console.error('Error extracting CV text:', error)
    return NextResponse.json(
      { error: error.message || 'Error al extraer texto del CV' },
      { status: 500 }
    )
  }
}

