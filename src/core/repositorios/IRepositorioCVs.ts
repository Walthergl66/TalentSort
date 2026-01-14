/**
 * @fileoverview Interfaz del repositorio de CVs
 * @module core/repositorios
 */

import { CV } from '../entidades/CV';
import { Resultado } from '@/compartido/errores';

/**
 * Filtros para búsqueda de CVs
 */
export interface FiltrosCVs {
  idUsuario?: string;
  habilidades?: string[];
  experienciaMinima?: number;
  ubicacion?: string;
  busqueda?: string;
  limite?: number;
  offset?: number;
}

/**
 * Interfaz del repositorio de CVs
 */
export interface IRepositorioCVs {
  /**
   * Obtiene un CV por su ID
   */
  obtenerPorId(id: string): Promise<Resultado<CV, Error>>;

  /**
   * Obtiene todos los CVs de un usuario
   */
  obtenerPorUsuario(
    idUsuario: string,
    limite?: number,
    offset?: number
  ): Promise<Resultado<CV[], Error>>;

  /**
   * Busca CVs con filtros
   */
  buscar(filtros: FiltrosCVs): Promise<Resultado<CV[], Error>>;

  /**
   * Guarda un nuevo CV
   */
  guardar(cv: CV): Promise<Resultado<CV, Error>>;

  /**
   * Actualiza un CV existente
   */
  actualizar(cv: CV): Promise<Resultado<CV, Error>>;

  /**
   * Elimina un CV
   */
  eliminar(id: string): Promise<Resultado<void, Error>>;

  /**
   * Cuenta el número total de CVs que coinciden con los filtros
   */
  contar(filtros: FiltrosCVs): Promise<Resultado<number, Error>>;
}
