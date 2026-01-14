/**
 * @fileoverview Utilidades para validación de datos
 * @module compartido/utilidades
 */

import { REGEX, LIMITES } from '../constantes';

/**
 * Valida un correo electrónico
 */
export function esEmailValido(email: string): boolean {
  return REGEX.EMAIL.test(email);
}

/**
 * Valida un número de teléfono
 */
export function esTelefonoValido(telefono: string): boolean {
  return REGEX.TELEFONO.test(telefono);
}

/**
 * Valida una URL
 */
export function esUrlValida(url: string): boolean {
  return REGEX.URL.test(url);
}

/**
 * Valida la fortaleza de una contraseña
 */
export function esContrasenaSegura(contrasena: string): {
  esValida: boolean;
  errores: string[];
} {
  const errores: string[] = [];

  if (contrasena.length < LIMITES.CONTRASENA_MINIMA) {
    errores.push(`Debe tener al menos ${LIMITES.CONTRASENA_MINIMA} caracteres`);
  }

  if (contrasena.length > LIMITES.CONTRASENA_MAXIMA) {
    errores.push(`No debe exceder ${LIMITES.CONTRASENA_MAXIMA} caracteres`);
  }

  if (!/[a-z]/.test(contrasena)) {
    errores.push('Debe incluir al menos una letra minúscula');
  }

  if (!/[A-Z]/.test(contrasena)) {
    errores.push('Debe incluir al menos una letra mayúscula');
  }

  if (!/\d/.test(contrasena)) {
    errores.push('Debe incluir al menos un número');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(contrasena)) {
    errores.push('Debe incluir al menos un carácter especial');
  }

  return {
    esValida: errores.length === 0,
    errores,
  };
}

/**
 * Valida el tamaño de un archivo
 */
export function esTamanoArchivoValido(
  tamanoByte: number,
  maxBytes: number = LIMITES.TAMANO_MAXIMO_CV
): boolean {
  return tamanoByte > 0 && tamanoByte <= maxBytes;
}

/**
 * Valida el tipo de archivo
 */
export function esTipoArchivoValido(
  tipoMime: string,
  tiposPermitidos: string[]
): boolean {
  return tiposPermitidos.includes(tipoMime);
}

/**
 * Sanitiza un string removiendo caracteres peligrosos
 */
export function sanitizarTexto(texto: string): string {
  return texto
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
}

/**
 * Trunca un texto a un número máximo de caracteres
 */
export function truncarTexto(texto: string, maxLength: number): string {
  if (texto.length <= maxLength) return texto;
  return texto.substring(0, maxLength - 3) + '...';
}

/**
 * Capitaliza la primera letra de un string
 */
export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

/**
 * Convierte un string a slug (URL-friendly)
 */
export function aSlug(texto: string): string {
  return texto
    .toLowerCase()
    .trim()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
