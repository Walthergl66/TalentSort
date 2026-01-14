/**
 * @fileoverview Manejador centralizado de errores
 * @module compartido/errores
 */

import { ErrorAplicacion } from './ErroresBase';

/**
 * Tipo de resultado para operaciones que pueden fallar
 */
export type Resultado<T, E = Error> =
  | { exito: true; valor: T }
  | { exito: false; error: E };

/**
 * Crea un resultado exitoso
 */
export function exito<T>(valor: T): Resultado<T, never> {
  return { exito: true, valor };
}

/**
 * Crea un resultado con error
 */
export function fallo<E extends Error>(error: E): Resultado<never, E> {
  return { exito: false, error };
}

/**
 * Ejecuta una función de forma segura y retorna un Resultado
 */
export async function ejecutarSeguro<T>(
  fn: () => Promise<T>
): Promise<Resultado<T, Error>> {
  try {
    const valor = await fn();
    return exito(valor);
  } catch (error) {
    if (error instanceof ErrorAplicacion) {
      return fallo(error);
    }
    
    return fallo(
      new Error(error instanceof Error ? error.message : 'Error desconocido')
    );
  }
}

/**
 * Convierte un error en un mensaje amigable para el usuario
 */
export function obtenerMensajeError(error: unknown): string {
  if (error instanceof ErrorAplicacion) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ha ocurrido un error inesperado';
}

/**
 * Registra un error en la consola (puede extenderse para enviar a servicio de logging)
 */
export function registrarError(error: Error, contexto?: string): void {
  console.error(
    `[ERROR${contexto ? ` - ${contexto}` : ''}]:`,
    error.message,
    error.stack
  );

  if (error instanceof ErrorAplicacion && error.detalles) {
    console.error('Detalles:', error.detalles);
  }
}
