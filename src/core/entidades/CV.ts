/**
 * @fileoverview Entidad CV (Currículum Vitae)
 * @module core/entidades
 */

import { Entidad } from './EntidadBase';
import { Email, Telefono } from '../objetos-valor';
import { ErrorValidacion } from '@/compartido/errores';
import { LIMITES } from '@/compartido/constantes';

/**
 * Propiedades para crear un CV
 */
export interface PropiedadesCV {
  id: string;
  idUsuario: string;
  nombreArchivo: string;
  rutaArchivo: string;
  tamanoArchivo: number;
  tipoArchivo: string;
  textoCV: string;
  nombreCandidato: string;
  emailCandidato: string;
  telefonoCandidato?: string;
  ubicacionCandidato?: string;
  anosExperiencia?: number;
  habilidades: string[];
  educacion?: string;
  experienciaLaboral?: string;
  certificaciones?: string[];
  idiomas?: string[];
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

/**
 * Entidad CV del dominio
 */
export class CV extends Entidad<PropiedadesCV> {
  private readonly idUsuario: string;
  private nombreArchivo: string;
  private rutaArchivo: string;
  private tamanoArchivo: number;
  private tipoArchivo: string;
  private textoCV: string;
  private nombreCandidato: string;
  private emailCandidato: Email;
  private telefonoCandidato?: Telefono;
  private ubicacionCandidato?: string;
  private anosExperiencia?: number;
  private habilidades: string[];
  private educacion?: string;
  private experienciaLaboral?: string;
  private certificaciones: string[];
  private idiomas: string[];
  private readonly fechaCreacion: Date;
  private fechaActualizacion: Date;

  private constructor(props: PropiedadesCV) {
    super(props.id);
    this.idUsuario = props.idUsuario;
    this.nombreArchivo = props.nombreArchivo;
    this.rutaArchivo = props.rutaArchivo;
    this.tamanoArchivo = props.tamanoArchivo;
    this.tipoArchivo = props.tipoArchivo;
    this.textoCV = props.textoCV;
    this.nombreCandidato = props.nombreCandidato;
    this.emailCandidato = Email.crear(props.emailCandidato);
    this.telefonoCandidato = props.telefonoCandidato
      ? Telefono.crear(props.telefonoCandidato)
      : undefined;
    this.ubicacionCandidato = props.ubicacionCandidato;
    this.anosExperiencia = props.anosExperiencia;
    this.habilidades = props.habilidades;
    this.educacion = props.educacion;
    this.experienciaLaboral = props.experienciaLaboral;
    this.certificaciones = props.certificaciones || [];
    this.idiomas = props.idiomas || [];
    this.fechaCreacion = props.fechaCreacion;
    this.fechaActualizacion = props.fechaActualizacion;
  }

  static crear(props: PropiedadesCV): CV {
    // Validaciones de negocio
    if (!props.nombreArchivo) {
      throw new ErrorValidacion('El nombre del archivo es requerido');
    }

    if (!props.textoCV || props.textoCV.trim().length === 0) {
      throw new ErrorValidacion('El contenido del CV no puede estar vacío');
    }

    if (props.tamanoArchivo > LIMITES.TAMANO_MAXIMO_CV) {
      throw new ErrorValidacion(
        `El archivo excede el tamaño máximo permitido de ${LIMITES.TAMANO_MAXIMO_CV / 1024 / 1024}MB`
      );
    }

    if (props.anosExperiencia !== undefined) {
      if (props.anosExperiencia < LIMITES.EXPERIENCIA_MINIMA) {
        throw new ErrorValidacion('Los años de experiencia no pueden ser negativos');
      }

      if (props.anosExperiencia > LIMITES.EXPERIENCIA_MAXIMA) {
        throw new ErrorValidacion(
          `Los años de experiencia no pueden exceder ${LIMITES.EXPERIENCIA_MAXIMA}`
        );
      }
    }

    if (!props.nombreCandidato || props.nombreCandidato.trim().length < 2) {
      throw new ErrorValidacion('El nombre del candidato debe tener al menos 2 caracteres');
    }

    return new CV(props);
  }

  // Getters
  obtenerIdUsuario(): string {
    return this.idUsuario;
  }

  obtenerNombreArchivo(): string {
    return this.nombreArchivo;
  }

  obtenerRutaArchivo(): string {
    return this.rutaArchivo;
  }

  obtenerTamanoArchivo(): number {
    return this.tamanoArchivo;
  }

  obtenerTipoArchivo(): string {
    return this.tipoArchivo;
  }

  obtenerTextoCV(): string {
    return this.textoCV;
  }

  obtenerNombreCandidato(): string {
    return this.nombreCandidato;
  }

  obtenerEmailCandidato(): string {
    return this.emailCandidato.obtenerValor();
  }

  obtenerTelefonoCandidato(): string | undefined {
    return this.telefonoCandidato?.obtenerValor();
  }

  obtenerUbicacionCandidato(): string | undefined {
    return this.ubicacionCandidato;
  }

  obtenerAnosExperiencia(): number | undefined {
    return this.anosExperiencia;
  }

  obtenerHabilidades(): string[] {
    return [...this.habilidades];
  }

  obtenerEducacion(): string | undefined {
    return this.educacion;
  }

  obtenerExperienciaLaboral(): string | undefined {
    return this.experienciaLaboral;
  }

  obtenerCertificaciones(): string[] {
    return [...this.certificaciones];
  }

  obtenerIdiomas(): string[] {
    return [...this.idiomas];
  }

  obtenerFechaCreacion(): Date {
    return this.fechaCreacion;
  }

  obtenerFechaActualizacion(): Date {
    return this.fechaActualizacion;
  }

  // Métodos de negocio
  tieneExperiencia(): boolean {
    return this.anosExperiencia !== undefined && this.anosExperiencia > 0;
  }

  cumpleExperienciaMinima(anosRequeridos: number): boolean {
    return (this.anosExperiencia || 0) >= anosRequeridos;
  }

  tieneHabilidad(habilidad: string): boolean {
    return this.habilidades.some(
      (h) => h.toLowerCase() === habilidad.toLowerCase()
    );
  }

  tieneHabilidades(habilidadesRequeridas: string[]): {
    encontradas: string[];
    faltantes: string[];
  } {
    const encontradas = habilidadesRequeridas.filter((habilidad) =>
      this.tieneHabilidad(habilidad)
    );

    const faltantes = habilidadesRequeridas.filter(
      (habilidad) => !this.tieneHabilidad(habilidad)
    );

    return { encontradas, faltantes };
  }

  actualizarDatos(datos: {
    nombreCandidato?: string;
    emailCandidato?: string;
    telefonoCandidato?: string;
    ubicacionCandidato?: string;
    anosExperiencia?: number;
    habilidades?: string[];
    educacion?: string;
    experienciaLaboral?: string;
    certificaciones?: string[];
    idiomas?: string[];
  }): void {
    if (datos.nombreCandidato) {
      if (datos.nombreCandidato.trim().length < 2) {
        throw new ErrorValidacion('El nombre debe tener al menos 2 caracteres');
      }
      this.nombreCandidato = datos.nombreCandidato;
    }

    if (datos.emailCandidato) {
      this.emailCandidato = Email.crear(datos.emailCandidato);
    }

    if (datos.telefonoCandidato) {
      this.telefonoCandidato = Telefono.crear(datos.telefonoCandidato);
    }

    if (datos.ubicacionCandidato !== undefined) {
      this.ubicacionCandidato = datos.ubicacionCandidato;
    }

    if (datos.anosExperiencia !== undefined) {
      if (datos.anosExperiencia < 0) {
        throw new ErrorValidacion('Los años de experiencia no pueden ser negativos');
      }
      this.anosExperiencia = datos.anosExperiencia;
    }

    if (datos.habilidades) {
      this.habilidades = datos.habilidades;
    }

    if (datos.educacion !== undefined) {
      this.educacion = datos.educacion;
    }

    if (datos.experienciaLaboral !== undefined) {
      this.experienciaLaboral = datos.experienciaLaboral;
    }

    if (datos.certificaciones) {
      this.certificaciones = datos.certificaciones;
    }

    if (datos.idiomas) {
      this.idiomas = datos.idiomas;
    }

    this.fechaActualizacion = new Date();
  }
}
