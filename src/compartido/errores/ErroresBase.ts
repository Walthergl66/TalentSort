/**
 * @fileoverview Clases de error personalizadas para manejo centralizado de errores
 * @module compartido/errores
 */

/**
 * Error base personalizado de la aplicación
 */
export abstract class ErrorAplicacion extends Error {
  constructor(
    message: string,
    public readonly codigo: string,
    public readonly detalles?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error de validación de datos
 */
export class ErrorValidacion extends ErrorAplicacion {
  constructor(message: string, detalles?: Record<string, any>) {
    super(message, 'ERROR_VALIDACION', detalles);
  }
}

/**
 * Error de autenticación
 */
export class ErrorAutenticacion extends ErrorAplicacion {
  constructor(message: string, detalles?: Record<string, any>) {
    super(message, 'ERROR_AUTENTICACION', detalles);
  }
}

/**
 * Error de autorización
 */
export class ErrorAutorizacion extends ErrorAplicacion {
  constructor(message: string, detalles?: Record<string, any>) {
    super(message, 'ERROR_AUTORIZACION', detalles);
  }
}

/**
 * Error de recurso no encontrado
 */
export class ErrorNoEncontrado extends ErrorAplicacion {
  constructor(recurso: string, id?: string) {
    super(
      `${recurso}${id ? ` con id ${id}` : ''} no encontrado`,
      'ERROR_NO_ENCONTRADO',
      { recurso, id }
    );
  }
}

/**
 * Error de negocio
 */
export class ErrorNegocio extends ErrorAplicacion {
  constructor(message: string, detalles?: Record<string, any>) {
    super(message, 'ERROR_NEGOCIO', detalles);
  }
}

/**
 * Error de infraestructura (base de datos, servicios externos, etc.)
 */
export class ErrorInfraestructura extends ErrorAplicacion {
  constructor(message: string, detalles?: Record<string, any>) {
    super(message, 'ERROR_INFRAESTRUCTURA', detalles);
  }
}

/**
 * Error de configuración
 */
export class ErrorConfiguracion extends ErrorAplicacion {
  constructor(message: string, detalles?: Record<string, any>) {
    super(message, 'ERROR_CONFIGURACION', detalles);
  }
}
