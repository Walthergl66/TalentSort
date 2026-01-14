/**
 * @fileoverview Entidad Usuario
 * @module core/entidades
 */

import { Entidad } from './EntidadBase';
import { Email, Telefono } from '../objetos-valor';
import { RolUsuario, NivelSuscripcion } from '@/compartido/tipos/enumeraciones';
import { ErrorValidacion } from '@/compartido/errores';

/**
 * Propiedades para crear un Usuario
 */
export interface PropiedadesUsuario {
  id: string;
  email: string;
  nombreCompleto: string;
  nombreEmpresa?: string;
  telefono?: string;
  rol: RolUsuario;
  nivelSuscripcion?: NivelSuscripcion;
  urlAvatar?: string;
  ubicacion?: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

/**
 * Entidad Usuario del dominio
 */
export class Usuario extends Entidad<PropiedadesUsuario> {
  private readonly email: Email;
  private nombreCompleto: string;
  private nombreEmpresa?: string;
  private telefono?: Telefono;
  private readonly rol: RolUsuario;
  private nivelSuscripcion: NivelSuscripcion;
  private urlAvatar?: string;
  private ubicacion?: string;
  private readonly fechaCreacion: Date;
  private fechaActualizacion: Date;

  private constructor(props: PropiedadesUsuario) {
    super(props.id);
    this.email = Email.crear(props.email);
    this.nombreCompleto = props.nombreCompleto;
    this.nombreEmpresa = props.nombreEmpresa;
    this.telefono = props.telefono ? Telefono.crear(props.telefono) : undefined;
    this.rol = props.rol;
    this.nivelSuscripcion = props.nivelSuscripcion || NivelSuscripcion.GRATUITO;
    this.urlAvatar = props.urlAvatar;
    this.ubicacion = props.ubicacion;
    this.fechaCreacion = props.fechaCreacion;
    this.fechaActualizacion = props.fechaActualizacion;
  }

  static crear(props: PropiedadesUsuario): Usuario {
    // Validaciones de negocio
    if (!props.nombreCompleto || props.nombreCompleto.trim().length < 2) {
      throw new ErrorValidacion('El nombre completo debe tener al menos 2 caracteres');
    }

    if (props.rol === RolUsuario.EMPRESA && !props.nombreEmpresa) {
      throw new ErrorValidacion('El nombre de empresa es requerido para usuarios tipo empresa');
    }

    return new Usuario(props);
  }

  // Getters
  obtenerEmail(): string {
    return this.email.obtenerValor();
  }

  obtenerNombreCompleto(): string {
    return this.nombreCompleto;
  }

  obtenerNombreEmpresa(): string | undefined {
    return this.nombreEmpresa;
  }

  obtenerTelefono(): string | undefined {
    return this.telefono?.obtenerValor();
  }

  obtenerRol(): RolUsuario {
    return this.rol;
  }

  obtenerNivelSuscripcion(): NivelSuscripcion {
    return this.nivelSuscripcion;
  }

  obtenerUrlAvatar(): string | undefined {
    return this.urlAvatar;
  }

  obtenerUbicacion(): string | undefined {
    return this.ubicacion;
  }

  obtenerFechaCreacion(): Date {
    return this.fechaCreacion;
  }

  obtenerFechaActualizacion(): Date {
    return this.fechaActualizacion;
  }

  // Métodos de negocio
  esEmpresa(): boolean {
    return this.rol === RolUsuario.EMPRESA;
  }

  esCandidato(): boolean {
    return this.rol === RolUsuario.CANDIDATO;
  }

  esAdministrador(): boolean {
    return this.rol === RolUsuario.ADMINISTRADOR;
  }

  tieneSuscripcionPremium(): boolean {
    return this.nivelSuscripcion !== NivelSuscripcion.GRATUITO;
  }

  actualizarPerfil(datos: {
    nombreCompleto?: string;
    nombreEmpresa?: string;
    telefono?: string;
    ubicacion?: string;
    urlAvatar?: string;
  }): void {
    if (datos.nombreCompleto) {
      if (datos.nombreCompleto.trim().length < 2) {
        throw new ErrorValidacion('El nombre completo debe tener al menos 2 caracteres');
      }
      this.nombreCompleto = datos.nombreCompleto;
    }

    if (datos.nombreEmpresa !== undefined) {
      this.nombreEmpresa = datos.nombreEmpresa;
    }

    if (datos.telefono) {
      this.telefono = Telefono.crear(datos.telefono);
    }

    if (datos.ubicacion !== undefined) {
      this.ubicacion = datos.ubicacion;
    }

    if (datos.urlAvatar !== undefined) {
      this.urlAvatar = datos.urlAvatar;
    }

    this.fechaActualizacion = new Date();
  }

  mejorarSuscripcion(nuevoNivel: NivelSuscripcion): void {
    const niveles = [
      NivelSuscripcion.GRATUITO,
      NivelSuscripcion.PROFESIONAL,
      NivelSuscripcion.EMPRESARIAL,
    ];

    const nivelActualIndex = niveles.indexOf(this.nivelSuscripcion);
    const nuevoNivelIndex = niveles.indexOf(nuevoNivel);

    if (nuevoNivelIndex <= nivelActualIndex) {
      throw new ErrorValidacion('El nuevo nivel debe ser superior al actual');
    }

    this.nivelSuscripcion = nuevoNivel;
    this.fechaActualizacion = new Date();
  }
}
