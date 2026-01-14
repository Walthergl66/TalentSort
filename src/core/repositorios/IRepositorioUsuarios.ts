/**
 * @fileoverview Interfaces de repositorios del dominio
 * @module core/repositorios
 */

import { Usuario } from '../entidades/Usuario';
import { Resultado } from '@/compartido/errores';

/**
 * Interfaz del repositorio de usuarios
 */
export interface IRepositorioUsuarios {
  /**
   * Obtiene un usuario por su ID
   */
  obtenerPorId(id: string): Promise<Resultado<Usuario, Error>>;

  /**
   * Obtiene un usuario por su email
   */
  obtenerPorEmail(email: string): Promise<Resultado<Usuario, Error>>;

  /**
   * Guarda un nuevo usuario
   */
  guardar(usuario: Usuario): Promise<Resultado<Usuario, Error>>;

  /**
   * Actualiza un usuario existente
   */
  actualizar(usuario: Usuario): Promise<Resultado<Usuario, Error>>;

  /**
   * Elimina un usuario
   */
  eliminar(id: string): Promise<Resultado<void, Error>>;

  /**
   * Verifica si existe un usuario con el email dado
   */
  existeEmail(email: string): Promise<Resultado<boolean, Error>>;
}
