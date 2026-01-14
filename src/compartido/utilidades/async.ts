/**
 * @fileoverview Utilidades asíncronas y de promesas
 * @module compartido/utilidades
 */

/**
 * Espera un tiempo determinado
 */
export function esperar(milisegundos: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milisegundos));
}

/**
 * Reintenta una función asíncrona un número determinado de veces
 */
export async function reintentar<T>(
  fn: () => Promise<T>,
  intentos: number = 3,
  retraso: number = 1000
): Promise<T> {
  let ultimoError: Error | undefined;

  for (let i = 0; i < intentos; i++) {
    try {
      return await fn();
    } catch (error) {
      ultimoError = error as Error;
      
      if (i < intentos - 1) {
        await esperar(retraso * (i + 1)); // Backoff exponencial
      }
    }
  }

  throw ultimoError;
}

/**
 * Ejecuta una promesa con timeout
 */
export async function conTimeout<T>(
  promesa: Promise<T>,
  milisegundos: number,
  mensajeError: string = 'Operación excedió el tiempo límite'
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(mensajeError)), milisegundos)
  );

  return Promise.race([promesa, timeout]);
}

/**
 * Debounce: Retrasa la ejecución de una función
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  espera: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | undefined;

  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), espera);
  };
}

/**
 * Throttle: Limita la frecuencia de ejecución de una función
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limite: number
): (...args: Parameters<T>) => void {
  let enEspera = false;

  return function (this: any, ...args: Parameters<T>) {
    if (!enEspera) {
      func.apply(this, args);
      enEspera = true;
      setTimeout(() => {
        enEspera = false;
      }, limite);
    }
  };
}

/**
 * Ejecuta funciones en lote con control de concurrencia
 */
export async function ejecutarEnLote<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrencia: number = 5
): Promise<R[]> {
  const resultados: R[] = [];
  const cola = [...items];

  async function procesarSiguiente(): Promise<void> {
    const item = cola.shift();
    if (!item) return;

    const resultado = await fn(item);
    resultados.push(resultado);

    if (cola.length > 0) {
      await procesarSiguiente();
    }
  }

  const workers = Array(Math.min(concurrencia, items.length))
    .fill(null)
    .map(() => procesarSiguiente());

  await Promise.all(workers);
  return resultados;
}
