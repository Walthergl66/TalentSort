/**
 * @fileoverview Servicio de IA para análisis de CVs
 * @module infraestructura/servicios-externos
 */

import { CONFIG_IA } from '@/compartido/constantes';
import { ErrorInfraestructura } from '@/compartido/errores';
import { reintentar, conTimeout } from '@/compartido/utilidades';

/**
 * Request para análisis de CV
 */
export interface SolicitudAnalisisCV {
  textoCV: string;
  descripcionPuesto: string;
  habilidadesRequeridas: string[];
  anosExperienciaRequeridos: number;
  requisitosAdicionales?: string[];
}

/**
 * Respuesta del análisis de CV
 */
export interface RespuestaAnalisisCV {
  puntuacion: number; // 0-100
  porcentajeCoincidencia: number; // 0-100
  analisis: {
    evaluacion: string;
    recomendacion: string;
    fortalezas: string[];
    debilidades: string[];
    recomendaciones: string[];
  };
  coincidenciaHabilidades?: {
    requeridas: string[];
    encontradas: string[];
    faltantes: string[];
  };
  analisisExperiencia?: {
    anos: number;
    relevancia: string;
  };
}

/**
 * Request para extracción de texto de CV
 */
export interface SolicitudExtraccionCV {
  archivoBase64: string;
  nombreArchivo: string;
}

/**
 * Respuesta de extracción de CV
 */
export interface RespuestaExtraccionCV {
  texto: string;
  metadatos: {
    paginas: number;
    tamano: number;
    formato: string;
  };
}

/**
 * Servicio de IA para análisis y procesamiento de CVs
 */
export class ServicioIA {
  private readonly urlBase: string;
  private readonly timeout: number;
  private readonly reintentos: number;

  constructor() {
    this.urlBase = CONFIG_IA.URL_BASE;
    this.timeout = CONFIG_IA.TIMEOUT;
    this.reintentos = CONFIG_IA.REINTENTOS;

    console.log('🔧 ServicioIA inicializado con:', {
      urlBase: this.urlBase,
      timeout: this.timeout,
      reintentos: this.reintentos,
      env_var: process.env.NEXT_PUBLIC_AI_API_URL
    });

    if (!this.urlBase) {
      throw new ErrorInfraestructura(
        'URL del servicio de IA no configurada',
        { variable: 'NEXT_PUBLIC_AI_API_URL' }
      );
    }
  }

  /**
   * Analiza un CV comparándolo con los requisitos de una vacante
   */
  async analizarCV(solicitud: SolicitudAnalisisCV): Promise<RespuestaAnalisisCV> {
    const respuesta = await reintentar(
      async () => {
        const resultado = await conTimeout(
          this.enviarSolicitudATS(solicitud),
          this.timeout,
          'El análisis del CV excedió el tiempo límite'
        );
        return resultado;
      },
      this.reintentos,
      CONFIG_IA.RETRASO_REINTENTO
    );

    return this.procesarRespuestaATS(respuesta);
  }

  /**
   * Extrae texto de un archivo CV
   */
  async extraerTextoCV(solicitud: SolicitudExtraccionCV): Promise<RespuestaExtraccionCV> {
    try {
      const respuesta = await reintentar(
        async () => {
          const resultado = await conTimeout(
            fetch(`${this.urlBase}/api/extract-cv`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fileBase64: solicitud.archivoBase64,
                fileName: solicitud.nombreArchivo,
              }),
            }),
            this.timeout,
            'La extracción del CV excedió el tiempo límite'
          );
          return resultado;
        },
        this.reintentos,
        CONFIG_IA.RETRASO_REINTENTO
      );

      if (!respuesta.ok) {
        const textoError = await respuesta.text();
        throw new ErrorInfraestructura(
          `Error al extraer texto del CV: ${respuesta.statusText}`,
          { status: respuesta.status, detalle: textoError }
        );
      }

      const datos = await respuesta.json();
      
      return {
        texto: datos.text || datos.texto,
        metadatos: {
          paginas: datos.metadata?.pages || datos.metadatos?.paginas || 0,
          tamano: datos.metadata?.size || datos.metadatos?.tamano || 0,
          formato: datos.metadata?.format || datos.metadatos?.formato || 'desconocido',
        },
      };
    } catch (error) {
      console.error('Error al extraer texto del CV:', error);
      throw new ErrorInfraestructura(
        'No se pudo extraer el texto del CV. Por favor, intenta con otro archivo.',
        { error }
      );
    }
  }

  /**
   * Analiza múltiples CVs en lote
   */
  async analizarCVsEnLote(
    solicitudes: Array<SolicitudAnalisisCV & { id: string; nombre: string }>
  ): Promise<Array<{ id: string; nombre: string; analisis: RespuestaAnalisisCV }>> {
    const resultados = await Promise.all(
      solicitudes.map(async (solicitud) => {
        try {
          const analisis = await this.analizarCV(solicitud);
          return {
            id: solicitud.id,
            nombre: solicitud.nombre,
            analisis,
          };
        } catch (error) {
          console.error(`Error al analizar CV de ${solicitud.nombre}:`, error);
          // Retornar análisis con puntuación 0 en caso de error
          return {
            id: solicitud.id,
            nombre: solicitud.nombre,
            analisis: {
              puntuacion: 0,
              porcentajeCoincidencia: 0,
              analisis: {
                evaluacion: 'Error al analizar el CV',
                recomendacion: 'No se pudo completar el análisis',
                fortalezas: [],
                debilidades: ['Error en el procesamiento'],
                recomendaciones: ['Volver a intentar el análisis'],
              },
            },
          };
        }
      })
    );

    // Ordenar por puntuación descendente
    return resultados.sort((a, b) => b.analisis.puntuacion - a.analisis.puntuacion);
  }

  /**
   * Envía una solicitud al endpoint de ATS matching
   */
  private async enviarSolicitudATS(solicitud: SolicitudAnalisisCV): Promise<any> {
    // Extraer habilidades del texto del CV si no se proporcionan explícitamente
    const skillsFromText = this.extraerHabilidades(solicitud.textoCV);
    const candidateSkills = skillsFromText.length > 0 ? skillsFromText : (solicitud.habilidadesRequeridas.length > 0 ? solicitud.habilidadesRequeridas : ["Habilidades generales"]);
    
    // Extraer años de experiencia del texto si no se proporciona
    const experienceYears = this.extraerExperiencia(solicitud.textoCV) || solicitud.anosExperienciaRequeridos || 1;
    
    const body = {
      vacante: {
        job_title: "Posición a evaluar",
        job_description: solicitud.descripcionPuesto || "Evaluar perfil del candidato",
        hard_skills: solicitud.habilidadesRequeridas.length > 0 ? solicitud.habilidadesRequeridas : ["General"],
        years_experience: solicitud.anosExperienciaRequeridos || 0
      },
      candidato: {
        cv_text: solicitud.textoCV,
        skills: candidateSkills,
        years_experience: experienceYears,
        education: "No especificado",
        languages: ["Español"],
        location: "No especificada",
        has_work_permit: true
      }
    };

    console.log('📤 Enviando solicitud a ATS:', {
      url: `${this.urlBase}/api/v1/ats/match`,
      vacante: {
        title: body.vacante.job_title,
        skills_count: body.vacante.hard_skills.length,
        experience: body.vacante.years_experience
      },
      candidato: {
        cv_length: body.candidato.cv_text.length,
        skills_count: body.candidato.skills.length,
        experience: body.candidato.years_experience
      }
    });

    console.log('📦 Body completo que se enviará:', JSON.stringify(body, null, 2));

    const respuesta = await fetch(`${this.urlBase}/api/v1/ats/match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!respuesta.ok) {
      let textoError = '';
      try {
        const jsonError = await respuesta.json();
        textoError = JSON.stringify(jsonError, null, 2);
        console.error('❌ Error JSON de API ATS:', jsonError);
        
        // Si el error es por falta de GROQ_API_KEY, usar análisis mock
        if (textoError.includes('GROQ_API_KEY') || textoError.includes('no está configurada')) {
          console.warn('⚠️  Servicio de IA no configurado, usando análisis simulado');
          return this.generarAnalisisMock(solicitud);
        }
      } catch {
        textoError = await respuesta.text();
        console.error('❌ Error de texto de API ATS:', textoError);
      }
      
      console.error('❌ Detalles completos del error:', {
        status: respuesta.status,
        statusText: respuesta.statusText,
        error: textoError,
        url: `${this.urlBase}/api/v1/ats/match`,
        requestBody: body
      });
      
      throw new ErrorInfraestructura(
        `Error en el servicio de IA: ${respuesta.statusText}`,
        { status: respuesta.status, detalle: textoError }
      );
    }

    const data = await respuesta.json();
    console.log('✅ Respuesta ATS recibida:', {
      match_score: data.match_score,
      status: data.status
    });

    return data;
  }

  /**
   * Extrae años de experiencia del texto del CV
   */
  private extraerExperiencia(textoCV: string): number | null {
    const patterns = [
      /(\d+)\+?\s*(?:años?|years?)\s*de\s*experiencia/i,
      /experiencia:\s*(\d+)\s*(?:años?|years?)/i,
      /(?:años?|years?)\s*de\s*experiencia:\s*(\d+)/i,
      /(\d+)\s*(?:años?|years?)/i
    ];

    for (const pattern of patterns) {
      const match = textoCV.match(pattern);
      if (match && match[1]) {
        const years = parseInt(match[1], 10);
        if (years > 0 && years <= 50) {
          return years;
        }
      }
    }

    return null;
  }

  /**
   * Extrae habilidades del texto del CV
   */
  private extraerHabilidades(textoCV: string): string[] {
    const skillsComunes = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'React', 'Angular', 'Vue',
      'Node.js', 'Express', 'Django', 'Flask', 'Spring', '.NET', 'SQL', 'MongoDB',
      'PostgreSQL', 'MySQL', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
      'Git', 'Jenkins', 'CI/CD', 'Agile', 'Scrum', 'REST', 'GraphQL', 'HTML',
      'CSS', 'Tailwind', 'Bootstrap', 'Next.js', 'Redux', 'API', 'Testing',
      'Jest', 'Mocha', 'Selenium', 'Leadership', 'Communication', 'Teamwork'
    ];

    const encontradas: string[] = [];
    const textoLower = textoCV.toLowerCase();

    for (const skill of skillsComunes) {
      if (textoLower.includes(skill.toLowerCase())) {
        encontradas.push(skill);
      }
    }

    return encontradas;
  }

  /**
   * Procesa la respuesta del análisis ATS
   */
  private procesarRespuestaATS(respuestaATS: any): RespuestaAnalisisCV {
    try {
      return {
        puntuacion: Math.round(respuestaATS.match_score || 0),
        porcentajeCoincidencia: Math.round(respuestaATS.match_score || 0),
        analisis: {
          evaluacion: respuestaATS.summary || 'No disponible',
          recomendacion: respuestaATS.status === 'APROBADO' 
            ? 'Se recomienda continuar con el proceso de selección' 
            : respuestaATS.status === 'RECHAZADO'
            ? 'No cumple con los requisitos mínimos'
            : 'Requiere revisión manual',
          fortalezas: respuestaATS.skill_analysis?.matched_skills || [],
          debilidades: respuestaATS.skill_analysis?.missing_skills || [],
          recomendaciones: respuestaATS.recommendations || [],
        },
        coincidenciaHabilidades: {
          requeridas: respuestaATS.skill_analysis?.hard_skills_score ? ['Habilidades técnicas evaluadas'] : [],
          encontradas: respuestaATS.skill_analysis?.matched_skills || [],
          faltantes: respuestaATS.skill_analysis?.missing_skills || [],
        },
        analisisExperiencia: {
          anos: 0,
          relevancia: `Score de experiencia: ${respuestaATS.experience_score || 0}/100`,
        },
      };
    } catch (error) {
      console.error('Error al procesar respuesta ATS:', error);
      throw new ErrorInfraestructura(
        'No se pudo procesar la respuesta del análisis',
        { error, respuesta: respuestaATS }
      );
    }
  }

  /**
   * Valida un archivo de CV
   */
  validarArchivoCV(archivo: File): { esValido: boolean; error?: string } {
    const TAMANO_MAXIMO = 10 * 1024 * 1024; // 10MB
    const TIPOS_PERMITIDOS = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (archivo.size > TAMANO_MAXIMO) {
      return {
        esValido: false,
        error: 'El archivo es demasiado grande. Tamaño máximo: 10MB.',
      };
    }

    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      return {
        esValido: false,
        error: 'Formato no válido. Solo se permiten archivos PDF, DOC y DOCX.',
      };
    }

    return { esValido: true };
  }

  /**
   * Convierte un archivo a base64
   */
  async archivoABase64(archivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();
      
      lector.onload = () => {
        const resultado = lector.result as string;
        // Remover el prefijo data:application/...;base64,
        const base64 = resultado.split(',')[1];
        resolve(base64);
      };

      lector.onerror = () => {
        reject(new ErrorInfraestructura('Error al leer el archivo'));
      };

      lector.readAsDataURL(archivo);
    });
  }

  /**
   * Genera un análisis mock cuando el servicio externo no está disponible
   */
  private generarAnalisisMock(solicitud: SolicitudAnalisisCV): any {
    const skills = this.extraerHabilidades(solicitud.textoCV);
    const experience = this.extraerExperiencia(solicitud.textoCV) || 1;
    
    // Calcular score básico basado en coincidencias
    const matchedSkills = solicitud.habilidadesRequeridas.filter(skill => 
      skills.some(s => s.toLowerCase().includes(skill.toLowerCase()) || 
                       skill.toLowerCase().includes(s.toLowerCase()))
    );
    
    const skillScore = solicitud.habilidadesRequeridas.length > 0
      ? (matchedSkills.length / solicitud.habilidadesRequeridas.length) * 100
      : 70;
    
    const experienceScore = Math.min((experience / (solicitud.anosExperienciaRequeridos || 1)) * 100, 100);
    
    const match_score = Math.round((skillScore * 0.7) + (experienceScore * 0.3));
    
    return {
      match_score: match_score,
      status: match_score >= 70 ? 'APROBADO' : match_score >= 50 ? 'PENDIENTE' : 'RECHAZADO',
      skill_analysis: {
        hard_skills_score: skillScore,
        soft_skills_score: 70,
        matched_skills: matchedSkills,
        missing_skills: solicitud.habilidadesRequeridas.filter(s => !matchedSkills.includes(s))
      },
      experience_score: experienceScore,
      compliance_check: {
        education_match: true,
        has_work_permit: true,
        location_match: true
      },
      recommendations: [
        'Revisar experiencia específica en el sector',
        'Validar referencias profesionales',
        'Realizar entrevista técnica'
      ],
      summary: `Candidato con ${experience} años de experiencia. Match del ${match_score}% con los requisitos del puesto.`,
      detailed_analysis: `El candidato presenta un perfil ${match_score >= 70 ? 'sólido' : 'en desarrollo'} con ${matchedSkills.length} de ${solicitud.habilidadesRequeridas.length} habilidades requeridas. ${match_score >= 70 ? 'Se recomienda continuar con el proceso.' : 'Requiere evaluación adicional.'}`
    };
  }
}

// Exportar instancia singleton
export const servicioIA = new ServicioIA();
