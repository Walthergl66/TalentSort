// lib/aiService.ts

const AI_API_URL = 'https://chatagent-saborforaneofork-production.up.railway.app/chat';

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

  console.log('🚀 Enviando solicitud a IA:', AI_API_URL);
  console.log('📝 Tamaño del prompt:', prompt.length, 'caracteres');

  try {
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: prompt }),
    });

    console.log('📡 Respuesta HTTP status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response body:', errorText);
      throw new Error(`Error en el servicio de chat: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Respuesta completa de IA:', JSON.stringify(data).substring(0, 200) + '...');

    // Intentar extraer el texto de la respuesta
    // La API puede devolver { reply: "..." } o { response: "..." } o directamente el texto
    let text = data.reply || data.response || data.message || data.text || JSON.stringify(data);
    console.log('📄 Texto extraído:', text.substring(0, 200) + '...');

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
      console.log('✨ JSON parseado exitosamente:', parsed);
      return parsed;
    } catch (parseError) {
      console.error('❌ Error al parsear JSON:', parseError);
      console.error('📄 Texto que falló:', text);
      
      // Intentar extraer JSON del texto si está mezclado con otra cosa
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('✨ JSON extraído y parseado exitosamente');
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
    console.error('💥 Error en sendMessageToChatAgent:', error);
    console.error('💥 Stack:', error.stack);
    throw new Error(`No se pudo obtener respuesta del chat IA: ${error.message}`);
  }
}
