/**
 * @fileoverview Objetos de valor del dominio
 * @module core/objetos-valor
 */

import { esEmailValido, esTelefonoValido, esContrasenaSegura } from '@/compartido/utilidades';
import { ErrorValidacion } from '@/compartido/errores';

/**
 * Objeto de valor: Email
 */
export class Email {
  private constructor(private readonly valor: string) {}

  static crear(email: string): Email {
    if (!email || !email.trim()) {
      throw new ErrorValidacion('El email es requerido');
    }

    if (!esEmailValido(email)) {
      throw new ErrorValidacion('El formato del email no es válido');
    }

    return new Email(email.toLowerCase().trim());
  }

  obtenerValor(): string {
    return this.valor;
  }

  equals(otro: Email): boolean {
    return this.valor === otro.valor;
  }
}

/**
 * Objeto de valor: Teléfono
 */
export class Telefono {
  private constructor(private readonly valor: string) {}

  static crear(telefono: string): Telefono {
    if (!telefono || !telefono.trim()) {
      throw new ErrorValidacion('El teléfono es requerido');
    }

    if (!esTelefonoValido(telefono)) {
      throw new ErrorValidacion('El formato del teléfono no es válido');
    }

    return new Telefono(telefono.trim());
  }

  obtenerValor(): string {
    return this.valor;
  }
}

/**
 * Objeto de valor: Contraseña
 */
export class Contrasena {
  private constructor(private readonly valor: string) {}

  static crear(contrasena: string): Contrasena {
    if (!contrasena) {
      throw new ErrorValidacion('La contraseña es requerida');
    }

    const { esValida, errores } = esContrasenaSegura(contrasena);

    if (!esValida) {
      throw new ErrorValidacion('Contraseña no cumple los requisitos', {
        errores,
      });
    }

    return new Contrasena(contrasena);
  }

  obtenerValor(): string {
    return this.valor;
  }
}

/**
 * Objeto de valor: Puntuación (0-100)
 */
export class Puntuacion {
  private constructor(private readonly valor: number) {}

  static crear(valor: number): Puntuacion {
    if (valor < 0 || valor > 100) {
      throw new ErrorValidacion('La puntuación debe estar entre 0 y 100');
    }

    return new Puntuacion(Math.round(valor));
  }

  obtenerValor(): number {
    return this.valor;
  }

  esBuena(): boolean {
    return this.valor >= 70;
  }

  esExcelente(): boolean {
    return this.valor >= 90;
  }
}

/**
 * Objeto de valor: Rango Salarial
 */
export class RangoSalarial {
  private constructor(
    private readonly minimo: number,
    private readonly maximo: number
  ) {}

  static crear(minimo: number, maximo: number): RangoSalarial {
    if (minimo < 0) {
      throw new ErrorValidacion('El salario mínimo debe ser mayor o igual a 0');
    }

    if (maximo < minimo) {
      throw new ErrorValidacion('El salario máximo debe ser mayor al mínimo');
    }

    return new RangoSalarial(minimo, maximo);
  }

  obtenerMinimo(): number {
    return this.minimo;
  }

  obtenerMaximo(): number {
    return this.maximo;
  }

  estaEnRango(salario: number): boolean {
    return salario >= this.minimo && salario <= this.maximo;
  }
}
