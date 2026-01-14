// lib/aiService.ts

const AI_API_URL = 'https://chatagent-saborforaneofork-production.up.railway.app/chat';
const MAX_RETRIES = 1;
const RETRY_DELAY = 2000; // 2 segundos

// Función auxiliar para esperar
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// extractTextFromPDF se mueve a rutas server-only para evitar errores de bundling

export async function sendMessageToChatAgent({
  cvText,
  jobDescription,
  requiredSkills,
  requiredExperience
}: {
  cvText: string,
  jobDescription: string,
  requiredSkills?: string[],
  requiredExperience?: number
}): Promise<any> {
  // Prompt mejorado para forzar respuesta JSON estructurada
  let prompt = `Eres un sistema experto en reclutamiento. Analiza el siguiente CV en relación a la vacante y devuelve SOLO un objeto JSON válido sin texto adicional.

La respuesta debe tener exactamente esta estructura:
{
  "score": [número del 0 al 10],
  "match_percentage": [número del 0 al 100],
  "analysis": "[análisis detallado del candidato]",
  "skills_match": "[análisis de habilidades]",
  "experience_analysis": "[análisis de experiencia]"
}

--- CV DEL CANDIDATO ---
${cvText}

--- DESCRIPCIÓN DEL PUESTO ---
${jobDescription}`;

  if (Array.isArray(requiredSkills) && requiredSkills.length > 0) {
    prompt += `\n\n--- HABILIDADES REQUERIDAS ---\n${requiredSkills.join(', ')}`;
  }
  if (requiredExperience) {
    prompt += `\n\n--- EXPERIENCIA REQUERIDA ---\n${requiredExperience} años`;
  }

  prompt += '\n\nResponde ÚNICAMENTE con el JSON, sin markdown, sin explicaciones adicionales.';

  console.log('[AI] Enviando solicitud a:', AI_API_URL);
  console.log('[AI] Tamaño del prompt:', prompt.length, 'caracteres');

  let lastError: Error | null = null;

  // Intentar con reintentos
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[AI] Intento ${attempt} de ${MAX_RETRIES}`);

      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: prompt }),
        signal: AbortSignal.timeout(30000) // Timeout de 30 segundos
      });

      console.log('[AI] Respuesta HTTP status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AI] Error response body:', errorText);
        
        // Detectar error de cuota excedida (429 o quota exceeded)
        if (errorText.includes('quota') || errorText.includes('RESOURCE_EXHAUSTED') || response.status === 429) {
          console.error('[AI] Cuota de API excedida');
          throw new Error('QUOTA_EXCEEDED: El servicio de IA ha alcanzado su límite de uso diario. Por favor, intenta mañana o contacta al administrador.');
        }
        
        // Si es un error 500 o 503, reintentar
        if ((response.status === 500 || response.status === 503) && attempt < MAX_RETRIES) {
          console.log(`[AI] Error ${response.status}, reintentando en ${RETRY_DELAY}ms...`);
          lastError = new Error(`Error ${response.status}: Servicio temporalmente no disponible`);
          await sleep(RETRY_DELAY);
          continue;
        }
        
        throw new Error(`Error en el servicio de chat: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[AI] Respuesta recibida:', JSON.stringify(data).substring(0, 200) + '...');

      // Intentar extraer el texto de la respuesta
      // La API puede devolver { reply: "..." } o { response: "..." } o directamente el texto
      let text = data.reply || data.response || data.message || data.text || JSON.stringify(data);
      console.log('[AI] Texto extraído:', text.substring(0, 200) + '...');

      // Intentar parsear el JSON
      try {
        // Limpiar posibles marcadores de markdown
        let cleanText = text.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/```\n?/g, '');
        }
        
        const parsed = JSON.parse(cleanText);
        console.log('[AI] JSON parseado exitosamente:', parsed);
        return parsed;
      } catch (parseError) {
        console.error('[AI] Error al parsear JSON:', parseError);
        console.error('[AI] Texto que falló:', text);
        
        // Intentar extraer JSON del texto si está mezclado con otra cosa
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log('[AI] JSON extraído y parseado exitosamente');
            return parsed;
          } catch {
            // Si aún así falla, devolver error
          }
        }
        
        return { 
          error: 'La IA no devolvió un JSON válido', 
          raw: text,
          score: 0,
          match_percentage: 0,
          analysis: 'Error al procesar la respuesta de IA',
          skills_match: 'No disponible',
          experience_analysis: 'No disponible'
        };
      }
    } catch (error: any) {
      console.error(`[AI] Error en intento ${attempt}:`, error);
      lastError = error;
      
      // Si no es el último intento y es un error de red, reintentar
      if (attempt < MAX_RETRIES && (error.name === 'AbortError' || error.message.includes('fetch'))) {
        console.log(`[AI] Reintentando en ${RETRY_DELAY}ms...`);
        await sleep(RETRY_DELAY);
        continue;
      }
      
      // Si es el último intento o un error no recuperable, lanzar
      break;
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  console.error('[AI] Todos los intentos fallaron');
  throw new Error(`No se pudo obtener respuesta del chat IA después de ${MAX_RETRIES} intentos: ${lastError?.message || 'Error desconocido'}`);
}
