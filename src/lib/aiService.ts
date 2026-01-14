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
  let prompt = `Eres un sistema experto en reclutamiento. Analiza el siguiente CV en relación a la vacante. Devuelve SOLO un JSON válido con la estructura exacta: {\n  \"score\": número del 0 al 100,\n  \"match_percentage\": número del 0 al 100,\n  \"analysis\": string,\n  \"skills_match\": string,\n  \"experience_analysis\": string\n}\nNo agregues texto fuera del JSON.\n\n--- CV ---\n${cvText}\n\n--- Descripción del puesto ---\n${jobDescription}`;
  if (Array.isArray(requiredSkills) && requiredSkills.length > 0) {
    prompt += `\nHabilidades requeridas: ${requiredSkills.join(', ')}`;
  }
  if (requiredExperience) {
    prompt += `\nAños de experiencia requeridos: ${requiredExperience}`;
  }

  try {
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: prompt }),
    });

    if (!response.ok) {
      throw new Error(`Error en el servicio de chat: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.response || data.message || JSON.stringify(data);
    try {
      return JSON.parse(text);
    } catch {
      return { error: 'La IA no devolvió un JSON válido', raw: text };
    }
  } catch (error) {
    console.error('Error en sendMessageToChatAgent:', error);
    throw new Error('No se pudo obtener respuesta del chat IA.');
  }
}
