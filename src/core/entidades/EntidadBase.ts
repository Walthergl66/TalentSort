/**
 * @fileoverview Entidad base del dominio
 * @module core/entidades
 */

/**
 * Entidad base con identificador único
 */
export abstract class Entidad<T> {
  protected constructor(protected readonly id: string) {}

  obtenerID(): string {
    return this.id;
  }

  equals(objeto?: Entidad<T>): boolean {
    if (!objeto) return false;
    if (this === objeto) return true;
    return this.id === objeto.id;
  }
}
