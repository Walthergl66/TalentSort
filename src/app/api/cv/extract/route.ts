// app/api/cv/extract/route.ts
import { NextRequest, NextResponse } from 'next/server'
// Helpers locales para validación y estimación de páginas
function validateCVFile(file: File) {
  const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!file || !file.type) return { valid: false, error: 'Archivo inválido' };
  if (!allowed.includes(file.type)) return { valid: false, error: 'Tipo de archivo no soportado' };
  if (file.size > 5 * 1024 * 1024) return { valid: false, error: 'El archivo supera el límite de 5MB' };
  return { valid: true };
}

function estimatePages(size: number) {
  // Estimación simple: 1 página ~= 200KB-400KB, usar 300KB como promedio
  return Math.max(1, Math.ceil(size / 300000));
}
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    // Validar archivo
    const validation = validateCVFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Validar número de páginas (máximo 3)
    const estimatedPages = estimatePages(file.size)
    if (estimatedPages > 3) {
      return NextResponse.json(
        { error: 'El CV no puede tener más de 3 páginas. Por favor, reduce el tamaño del archivo.' },
        { status: 400 }
      )
    }

    // Extraer texto del CV usando OCR real (pdf-parse) con import dinámico
    let text = ''
    try {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const pdfMod: any = await import('pdf-parse')
      const PDFParse: any = pdfMod.PDFParse
      const parser = new PDFParse({ buffer })
      const pdfData = await parser.getText()
      text = pdfData.text || ''
    } catch (err) {
      console.error('Error extrayendo texto del CV:', err)
      text = ''
    }

    // Guardar el texto extraído en la base de datos (user_cvs.cv_text)
    const cvId = formData.get('cv_id') as string | null;
    let dbResult = null;
    if (cvId) {
      const { data, error } = await supabase
        .from('user_cvs')
        .update({ cv_text: text })
        .eq('id', cvId)
        .select();
      dbResult = { data, error };
    }

    return NextResponse.json({
      success: true,
      text,
      estimatedPages,
      dbResult
    })
  } catch (error: any) {
    console.error('Error en /api/cv/extract:', error)
    return NextResponse.json(
      { error: error.message || 'Error al procesar el CV' },
      { status: 500 }
    )
  }
}
