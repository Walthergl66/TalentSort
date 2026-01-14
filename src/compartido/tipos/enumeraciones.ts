/**
 * @fileoverview Tipos compartidos de la aplicación
 * @module compartido/tipos
 */

/**
 * Rol de usuario en el sistema
 */
export enum RolUsuario {
  EMPRESA = 'empresa',
  CANDIDATO = 'candidato',
  ADMINISTRADOR = 'administrador',
}

/**
 * Nivel de suscripción
 */
export enum NivelSuscripcion {
  GRATUITO = 'gratuito',
  PROFESIONAL = 'profesional',
  EMPRESARIAL = 'empresarial',
}

/**
 * Estado de una vacante
 */
export enum EstadoVacante {
  ABIERTA = 'abierta',
  CERRADA = 'cerrada',
  BORRADOR = 'borrador',
}

/**
 * Tipo de empleo
 */
export enum TipoEmpleo {
  TIEMPO_COMPLETO = 'tiempo_completo',
  MEDIO_TIEMPO = 'medio_tiempo',
  CONTRATO = 'contrato',
  FREELANCE = 'freelance',
}

/**
 * Estado de una aplicación
 */
export enum EstadoAplicacion {
  PENDIENTE = 'pendiente',
  EN_REVISION = 'en_revision',
  ENTREVISTA = 'entrevista',
  RECHAZADA = 'rechazada',
  ACEPTADA = 'aceptada',
}

/**
 * Tipo de archivo soportado para CVs
 */
export enum TipoArchivo {
  PDF = 'application/pdf',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  DOC = 'application/msword',
}

/**
 * Idioma soportado
 */
export enum Idioma {
  ESPAÑOL = 'es',
  INGLES = 'en',
}
