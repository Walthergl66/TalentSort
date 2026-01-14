/**
 * @fileoverview Entidad Vacante
 * @module core/entidades
 */

import { Entidad } from './EntidadBase';
import { RangoSalarial } from '../objetos-valor';
import { EstadoVacante, TipoEmpleo } from '@/compartido/tipos/enumeraciones';
import { ErrorValidacion } from '@/compartido/errores';
import { LIMITES } from '@/compartido/constantes';

/**
 * Propiedades para crear una Vacante
 */
export interface PropiedadesVacante {
  id: string;
  idEmpresa: string;
  titulo: string;
  descripcion: string;
  requisitos: string;
  habilidadesRequeridas: string[];
  anosExperienciaMinimo: number;
  anosExperienciaMaximo?: number;
  salarioMinimo?: number;
  salarioMaximo?: number;
  ubicacion: string;
  tipoEmpleo: TipoEmpleo;
  estado: EstadoVacante;
  contadorAplicaciones: number;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  fechaCierre?: Date;
}

/**
 * Entidad Vacante del dominio
 */
export class Vacante extends Entidad<PropiedadesVacante> {
  private readonly idEmpresa: string;
  private titulo: string;
  private descripcion: string;
  private requisitos: string;
  private habilidadesRequeridas: string[];
  private anosExperienciaMinimo: number;
  private anosExperienciaMaximo?: number;
  private rangoSalarial?: RangoSalarial;
  private ubicacion: string;
  private tipoEmpleo: TipoEmpleo;
  private estado: EstadoVacante;
  private contadorAplicaciones: number;
  private readonly fechaCreacion: Date;
  private fechaActualizacion: Date;
  private fechaCierre?: Date;

  private constructor(props: PropiedadesVacante) {
    super(props.id);
    this.idEmpresa = props.idEmpresa;
    this.titulo = props.titulo;
    this.descripcion = props.descripcion;
    this.requisitos = props.requisitos;
    this.habilidadesRequeridas = props.habilidadesRequeridas;
    this.anosExperienciaMinimo = props.anosExperienciaMinimo;
    this.anosExperienciaMaximo = props.anosExperienciaMaximo;
    
    if (props.salarioMinimo && props.salarioMaximo) {
      this.rangoSalarial = RangoSalarial.crear(props.salarioMinimo, props.salarioMaximo);
    }
    
    this.ubicacion = props.ubicacion;
    this.tipoEmpleo = props.tipoEmpleo;
    this.estado = props.estado;
    this.contadorAplicaciones = props.contadorAplicaciones;
    this.fechaCreacion = props.fechaCreacion;
    this.fechaActualizacion = props.fechaActualizacion;
    this.fechaCierre = props.fechaCierre;
  }

  static crear(props: PropiedadesVacante): Vacante {
    // Validaciones de negocio
    if (props.titulo.length < LIMITES.TITULO_VACANTE_MINIMO) {
      throw new ErrorValidacion(
        `El título debe tener al menos ${LIMITES.TITULO_VACANTE_MINIMO} caracteres`
      );
    }

    if (props.titulo.length > LIMITES.TITULO_VACANTE_MAXIMO) {
      throw new ErrorValidacion(
        `El título no puede exceder ${LIMITES.TITULO_VACANTE_MAXIMO} caracteres`
      );
    }

    if (props.descripcion.length < LIMITES.DESCRIPCION_MINIMA) {
      throw new ErrorValidacion(
        `La descripción debe tener al menos ${LIMITES.DESCRIPCION_MINIMA} caracteres`
      );
    }

    if (props.habilidadesRequeridas.length < LIMITES.HABILIDADES_MINIMAS) {
      throw new ErrorValidacion(
        `Se requiere al menos ${LIMITES.HABILIDADES_MINIMAS} habilidad`
      );
    }

    if (props.habilidadesRequeridas.length > LIMITES.HABILIDADES_MAXIMAS) {
      throw new ErrorValidacion(
        `No se pueden especificar más de ${LIMITES.HABILIDADES_MAXIMAS} habilidades`
      );
    }

    if (props.anosExperienciaMinimo < 0) {
      throw new ErrorValidacion('Los años de experiencia no pueden ser negativos');
    }

    return new Vacante(props);
  }

  // Getters
  obtenerIdEmpresa(): string {
    return this.idEmpresa;
  }

  obtenerTitulo(): string {
    return this.titulo;
  }

  obtenerDescripcion(): string {
    return this.descripcion;
  }

  obtenerRequisitos(): string {
    return this.requisitos;
  }

  obtenerHabilidadesRequeridas(): string[] {
    return [...this.habilidadesRequeridas];
  }

  obtenerAnosExperienciaMinimo(): number {
    return this.anosExperienciaMinimo;
  }

  obtenerAnosExperienciaMaximo(): number | undefined {
    return this.anosExperienciaMaximo;
  }

  obtenerRangoSalarial(): RangoSalarial | undefined {
    return this.rangoSalarial;
  }

  obtenerUbicacion(): string {
    return this.ubicacion;
  }

  obtenerTipoEmpleo(): TipoEmpleo {
    return this.tipoEmpleo;
  }

  obtenerEstado(): EstadoVacante {
    return this.estado;
  }

  obtenerContadorAplicaciones(): number {
    return this.contadorAplicaciones;
  }

  obtenerFechaCreacion(): Date {
    return this.fechaCreacion;
  }

  obtenerFechaActualizacion(): Date {
    return this.fechaActualizacion;
  }

  obtenerFechaCierre(): Date | undefined {
    return this.fechaCierre;
  }

  // Métodos de negocio
  estaAbierta(): boolean {
    return this.estado === EstadoVacante.ABIERTA;
  }

  estaCerrada(): boolean {
    return this.estado === EstadoVacante.CERRADA;
  }

  esBorrador(): boolean {
    return this.estado === EstadoVacante.BORRADOR;
  }

  publicar(): void {
    if (this.estado === EstadoVacante.ABIERTA) {
      throw new ErrorValidacion('La vacante ya está publicada');
    }

    this.estado = EstadoVacante.ABIERTA;
    this.fechaActualizacion = new Date();
  }

  cerrar(): void {
    if (this.estado === EstadoVacante.CERRADA) {
      throw new ErrorValidacion('La vacante ya está cerrada');
    }

    this.estado = EstadoVacante.CERRADA;
    this.fechaCierre = new Date();
    this.fechaActualizacion = new Date();
  }

  incrementarAplicaciones(): void {
    this.contadorAplicaciones++;
    this.fechaActualizacion = new Date();
  }

  actualizar(datos: {
    titulo?: string;
    descripcion?: string;
    requisitos?: string;
    habilidadesRequeridas?: string[];
    ubicacion?: string;
  }): void {
    if (datos.titulo) {
      if (datos.titulo.length < LIMITES.TITULO_VACANTE_MINIMO) {
        throw new ErrorValidacion(
          `El título debe tener al menos ${LIMITES.TITULO_VACANTE_MINIMO} caracteres`
        );
      }
      this.titulo = datos.titulo;
    }

    if (datos.descripcion) {
      if (datos.descripcion.length < LIMITES.DESCRIPCION_MINIMA) {
        throw new ErrorValidacion(
          `La descripción debe tener al menos ${LIMITES.DESCRIPCION_MINIMA} caracteres`
        );
      }
      this.descripcion = datos.descripcion;
    }

    if (datos.requisitos) {
      this.requisitos = datos.requisitos;
    }

    if (datos.habilidadesRequeridas) {
      if (datos.habilidadesRequeridas.length < LIMITES.HABILIDADES_MINIMAS) {
        throw new ErrorValidacion(
          `Se requiere al menos ${LIMITES.HABILIDADES_MINIMAS} habilidad`
        );
      }
      this.habilidadesRequeridas = datos.habilidadesRequeridas;
    }

    if (datos.ubicacion) {
      this.ubicacion = datos.ubicacion;
    }

    this.fechaActualizacion = new Date();
  }
}
