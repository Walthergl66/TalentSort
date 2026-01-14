/**
 * @fileoverview Constantes de la aplicación
 * @module compartido/constantes
 */

/**
 * Límites de validación
 */
export const LIMITES = {
  // Perfil de usuario
  NOMBRE_MINIMO: 2,
  NOMBRE_MAXIMO: 100,
  TELEFONO_MINIMO: 10,
  TELEFONO_MAXIMO: 15,
  
  // Contraseña
  CONTRASENA_MINIMA: 8,
  CONTRASENA_MAXIMA: 128,
  
  // CV
  TAMANO_MAXIMO_CV: 10 * 1024 * 1024, // 10MB
  EXPERIENCIA_MINIMA: 0,
  EXPERIENCIA_MAXIMA: 50,
  
  // Vacante
  TITULO_VACANTE_MINIMO: 5,
  TITULO_VACANTE_MAXIMO: 200,
  DESCRIPCION_MINIMA: 50,
  DESCRIPCION_MAXIMA: 5000,
  REQUISITOS_MINIMOS: 20,
  REQUISITOS_MAXIMOS: 3000,
  HABILIDADES_MINIMAS: 1,
  HABILIDADES_MAXIMAS: 50,
  
  // Análisis
  PUNTUACION_MINIMA: 0,
  PUNTUACION_MAXIMA: 100,
} as const;

/**
 * Expresiones regulares comunes
 */
export const REGEX = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  TELEFONO: /^\+?[1-9]\d{1,14}$/,
  URL: /^https?:\/\/.+/,
} as const;

/**
 * Mensajes de error comunes
 */
export const MENSAJES_ERROR = {
  // Autenticación
  CREDENCIALES_INVALIDAS: 'Correo electrónico o contraseña incorrectos',
  SESION_EXPIRADA: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente',
  NO_AUTENTICADO: 'Debes iniciar sesión para acceder a este recurso',
  NO_AUTORIZADO: 'No tienes permisos para realizar esta acción',
  
  // Validación
  CAMPO_REQUERIDO: 'Este campo es obligatorio',
  EMAIL_INVALIDO: 'El correo electrónico no es válido',
  TELEFONO_INVALIDO: 'El número de teléfono no es válido',
  CONTRASENA_DEBIL: 'La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales',
  
  // Archivos
  ARCHIVO_MUY_GRANDE: 'El archivo es demasiado grande. Tamaño máximo: 10MB',
  TIPO_ARCHIVO_NO_SOPORTADO: 'Tipo de archivo no soportado. Usa PDF, DOC o DOCX',
  
  // General
  ERROR_INESPERADO: 'Ha ocurrido un error inesperado. Por favor intenta nuevamente',
  RECURSO_NO_ENCONTRADO: 'El recurso solicitado no existe',
  OPERACION_FALLIDA: 'La operación no pudo completarse',
} as const;

/**
 * Mensajes de éxito
 */
export const MENSAJES_EXITO = {
  REGISTRO_EXITOSO: 'Registro completado exitosamente',
  INICIO_SESION_EXITOSO: 'Has iniciado sesión correctamente',
  PERFIL_ACTUALIZADO: 'Tu perfil ha sido actualizado',
  CV_SUBIDO: 'CV cargado exitosamente',
  CV_ANALIZADO: 'Análisis del CV completado',
  VACANTE_CREADA: 'Vacante publicada exitosamente',
  APLICACION_ENVIADA: 'Aplicación enviada correctamente',
} as const;

/**
 * Rutas de la aplicación
 */
export const RUTAS = {
  INICIO: '/',
  LOGIN: '/auth/login',
  REGISTRO: '/auth/registro',
  DASHBOARD: '/dashboard',
  PERFIL: '/dashboard/perfil',
  VACANTES: '/vacantes',
  CV: '/dashboard/cv',
  APLICACIONES: '/dashboard/aplicaciones',
} as const;

/**
 * Configuración de la API de IA
 */
export const CONFIG_IA = {
  URL_BASE: process.env.NEXT_PUBLIC_AI_API_URL || 'https://iausabilidad-production.up.railway.app',
  TIMEOUT: 30000, // 30 segundos
  REINTENTOS: 3,
  RETRASO_REINTENTO: 1000, // 1 segundo
} as const;

/**
 * Configuración de Supabase
 */
export const CONFIG_SUPABASE = {
  URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
} as const;
