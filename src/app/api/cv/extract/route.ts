// app/api/cv/extract/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Helpers locales para validación
function validateCVFile(file: File) {
  const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!file || !file.type) return { valid: false, error: 'Archivo inválido' };
  if (!allowed.includes(file.type)) return { valid: false, error: 'Tipo de archivo no soportado (solo PDF, DOC, DOCX)' };
  // Sin límite de tamaño
  return { valid: true };
}
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('[cv/extract] Nueva solicitud')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const cvId = formData.get('cv_id') as string

    console.log('[cv/extract] FormData recibido:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      cvId: cvId
    })

    if (!file) {
      console.error('[cv/extract] No se proporcionó archivo')
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    // Validar archivo
    const validation = validateCVFile(file)
    console.log('[cv/extract] Validación de archivo:', validation)
    
    if (!validation.valid) {
      console.error('[cv/extract] Validación fallida:', validation.error)
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Extraer texto del CV usando pdf2json (específico para Node.js)
    let text = ''
    try {
      console.log('[cv/extract] Iniciando extracción de texto del PDF...')
      const arrayBuffer = await file.arrayBuffer()
      console.log('[cv/extract] ArrayBuffer obtenido, tamaño:', arrayBuffer.byteLength)
      
      // Importar pdf2json dinámicamente
      const PDFParser = (await import('pdf2json')).default
      console.log('[cv/extract] pdf2json importado correctamente')
      
      // Crear instancia del parser
      const pdfParser = new PDFParser()
      
      // Procesar el PDF con una promesa
      text = await new Promise<string>((resolve, reject) => {
        let extractedText = ''
        
        pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
          try {
            console.log('[cv/extract] PDF parseado:', {
              numPages: pdfData.Pages?.length || 0
            })
            
            // Extraer texto de todas las páginas
            if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
              for (const page of pdfData.Pages) {
                if (page.Texts && Array.isArray(page.Texts)) {
                  for (const text of page.Texts) {
                    if (text.R && Array.isArray(text.R)) {
                      for (const run of text.R) {
                        if (run.T) {
                          // Decodificar texto URI-encoded
                          extractedText += decodeURIComponent(run.T) + ' '
                        }
                      }
                    }
                  }
                  extractedText += '\n\n'
                }
              }
            }
            
            console.log('[cv/extract] Texto extraído:', {
              hasText: !!extractedText,
              textLength: extractedText.length,
              numPages: pdfData.Pages?.length || 0,
              preview: extractedText.substring(0, 200)
            })
            
            resolve(extractedText.trim())
          } catch (parseErr: any) {
            console.error('[cv/extract] Error procesando datos del PDF:', parseErr)
            reject(parseErr)
          }
        })
        
        pdfParser.on('pdfParser_dataError', (errData: any) => {
          console.error('[cv/extract] Error en pdf2json:', errData.parserError)
          reject(new Error(errData.parserError || 'Error desconocido al parsear PDF'))
        })
        
        // Procesar el buffer
        const buffer = Buffer.from(arrayBuffer)
        pdfParser.parseBuffer(buffer)
      })
      
      if (!text) {
        console.warn('[cv/extract] El PDF no contiene texto extraíble')
      }
    } catch (err: any) {
      console.error('[cv/extract] Error extrayendo texto del CV:', err)
      console.error('[cv/extract] Stack:', err.stack)
      console.error('[cv/extract] Message:', err.message)
      text = ''
    }

    console.log('[cv/extract] Resultado de extracción:', {
      hasText: !!text,
      textLength: text.length,
      preview: text.substring(0, 100)
    })

    // Guardar el texto extraído en la base de datos (user_cvs.cv_text)
    let dbResult = null;
    if (cvId) {
      console.log('[cv/extract] Guardando texto en BD para CV:', cvId)
      const { data, error } = await supabase
        .from('user_cvs')
        .update({ cv_text: text })
        .eq('id', cvId)
        .select();
      
      if (error) {
        console.error('[cv/extract] Error guardando en BD:', error)
      } else {
        console.log('[cv/extract] Texto guardado en BD exitosamente')
      }
      
      dbResult = { data, error };
    }

    return NextResponse.json({
      success: true,
      text,
      textLength: text.length,
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
