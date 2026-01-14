/**
 * @fileoverview Utilidades para formato de datos
 * @module compartido/utilidades
 */

/**
 * Formatea un número como moneda
 */
export function formatearMoneda(
  cantidad: number,
  moneda: string = 'USD',
  idioma: string = 'es-MX'
): string {
  return new Intl.NumberFormat(idioma, {
    style: 'currency',
    currency: moneda,
  }).format(cantidad);
}

/**
 * Formatea una fecha
 */
export function formatearFecha(
  fecha: Date | string,
  formato: 'corto' | 'largo' | 'relativo' = 'largo',
  idioma: string = 'es-MX'
): string {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;

  if (formato === 'relativo') {
    return formatearFechaRelativa(fechaObj, idioma);
  }

  const opciones: Intl.DateTimeFormatOptions =
    formato === 'corto'
      ? { year: 'numeric', month: '2-digit', day: '2-digit' }
      : { year: 'numeric', month: 'long', day: 'numeric' };

  return new Intl.DateTimeFormat(idioma, opciones).format(fechaObj);
}

/**
 * Formatea una fecha de forma relativa (hace X días, hace X horas, etc.)
 */
export function formatearFechaRelativa(
  fecha: Date,
  idioma: string = 'es-MX'
): string {
  const ahora = new Date();
  const diferenciaMilisegundos = ahora.getTime() - fecha.getTime();
  const diferenciaSegundos = Math.floor(diferenciaMilisegundos / 1000);
  const diferenciaMinutos = Math.floor(diferenciaSegundos / 60);
  const diferenciaHoras = Math.floor(diferenciaMinutos / 60);
  const diferenciaDias = Math.floor(diferenciaHoras / 24);

  if (diferenciaDias > 30) {
    return formatearFecha(fecha, 'largo', idioma);
  }

  if (diferenciaDias > 0) {
    return `hace ${diferenciaDias} día${diferenciaDias > 1 ? 's' : ''}`;
  }

  if (diferenciaHoras > 0) {
    return `hace ${diferenciaHoras} hora${diferenciaHoras > 1 ? 's' : ''}`;
  }

  if (diferenciaMinutos > 0) {
    return `hace ${diferenciaMinutos} minuto${diferenciaMinutos > 1 ? 's' : ''}`;
  }

  return 'hace un momento';
}

/**
 * Formatea bytes a un formato legible
 */
export function formatearBytes(bytes: number, decimales: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimales < 0 ? 0 : decimales;
  const tamaños = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + tamaños[i];
}

/**
 * Formatea un porcentaje
 */
export function formatearPorcentaje(
  valor: number,
  decimales: number = 0
): string {
  return `${valor.toFixed(decimales)}%`;
}

/**
 * Formatea un número de teléfono
 */
export function formatearTelefono(telefono: string): string {
  // Remover caracteres no numéricos
  const numeros = telefono.replace(/\D/g, '');

  // Formato: (XXX) XXX-XXXX para números de 10 dígitos
  if (numeros.length === 10) {
    return `(${numeros.slice(0, 3)}) ${numeros.slice(3, 6)}-${numeros.slice(6)}`;
  }

  return telefono;
}

/**
 * Extrae las iniciales de un nombre
 */
export function obtenerIniciales(nombre: string): string {
  return nombre
    .split(' ')
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Pluraliza una palabra según la cantidad
 */
export function pluralizar(
  cantidad: number,
  singular: string,
  plural?: string
): string {
  if (cantidad === 1) {
    return `${cantidad} ${singular}`;
  }
  return `${cantidad} ${plural || singular + 's'}`;
}
