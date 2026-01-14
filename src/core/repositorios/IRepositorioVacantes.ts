/**
 * @fileoverview Interfaz del repositorio de vacantes
 * @module core/repositorios
 */

import { Vacante } from '../entidades/Vacante';
import { Resultado } from '@/compartido/errores';
import { EstadoVacante } from '@/compartido/tipos/enumeraciones';

/**
 * Filtros para búsqueda de vacantes
 */
export interface FiltrosVacantes {
  idEmpresa?: string;
  estado?: EstadoVacante;
  ubicacion?: string;
  tipoEmpleo?: string;
  habilidades?: string[];
  experienciaMinima?: number;
  salarioMinimo?: number;
  busqueda?: string;
  limite?: number;
  offset?: number;
}

/**
 * Interfaz del repositorio de vacantes
 */
export interface IRepositorioVacantes {
  /**
   * Obtiene una vacante por su ID
   */
  obtenerPorId(id: string): Promise<Resultado<Vacante, Error>>;

  /**
   * Obtiene todas las vacantes de una empresa
   */
  obtenerPorEmpresa(
    idEmpresa: string,
    limite?: number,
    offset?: number
  ): Promise<Resultado<Vacante[], Error>>;

  /**
   * Busca vacantes con filtros
   */
  buscar(filtros: FiltrosVacantes): Promise<Resultado<Vacante[], Error>>;

  /**
   * Guarda una nueva vacante
   */
  guardar(vacante: Vacante): Promise<Resultado<Vacante, Error>>;

  /**
   * Actualiza una vacante existente
   */
  actualizar(vacante: Vacante): Promise<Resultado<Vacante, Error>>;

  /**
   * Elimina una vacante
   */
  eliminar(id: string): Promise<Resultado<void, Error>>;

  /**
   * Cuenta el número total de vacantes que coinciden con los filtros
   */
  contar(filtros: FiltrosVacantes): Promise<Resultado<number, Error>>;
}
