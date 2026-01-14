/**
 * @fileoverview Cliente de Supabase refactorizado
 * @module infraestructura/base-datos
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CONFIG_SUPABASE } from '@/compartido/constantes';
import { ErrorConfiguracion, ErrorInfraestructura } from '@/compartido/errores';

/**
 * Opciones de configuración del cliente Supabase
 */
interface OpcionesClienteSupabase {
  autoRefreshToken?: boolean;
  persistSession?: boolean;
  detectSessionInUrl?: boolean;
}

/**
 * Cliente de Supabase con configuración mejorada
 */
export class ClienteSupabase {
  private cliente: SupabaseClient;
  private static instancia: ClienteSupabase;

  private constructor() {
    this.validarConfiguracion();
    this.cliente = this.crearCliente();
    this.inicializarLogging();
  }

  /**
   * Obtiene la instancia singleton del cliente
   */
  static obtenerInstancia(): ClienteSupabase {
    if (!ClienteSupabase.instancia) {
      ClienteSupabase.instancia = new ClienteSupabase();
    }
    return ClienteSupabase.instancia;
  }

  /**
   * Obtiene el cliente de Supabase
   */
  obtenerCliente(): SupabaseClient {
    return this.cliente;
  }

  /**
   * Valida que las variables de entorno estén configuradas
   */
  private validarConfiguracion(): void {
    if (!CONFIG_SUPABASE.URL || !CONFIG_SUPABASE.ANON_KEY) {
      const mensajeError = [
        '[Supabase] Error: Faltan variables de entorno',
        `NEXT_PUBLIC_SUPABASE_URL: ${CONFIG_SUPABASE.URL ? 'OK' : 'FALTANTE'}`,
        `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${CONFIG_SUPABASE.ANON_KEY ? 'OK' : 'FALTANTE'}`,
      ].join('\n');

      console.error(mensajeError);
      
      throw new ErrorConfiguracion(
        'Variables de entorno de Supabase no configuradas',
        {
          urlConfigurada: !!CONFIG_SUPABASE.URL,
          keyConfigurada: !!CONFIG_SUPABASE.ANON_KEY,
        }
      );
    }
  }

  /**
   * Crea el cliente de Supabase con configuración
   */
  private crearCliente(opciones?: OpcionesClienteSupabase): SupabaseClient {
    const opcionesPorDefecto: OpcionesClienteSupabase = {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    };

    return createClient(CONFIG_SUPABASE.URL, CONFIG_SUPABASE.ANON_KEY, {
      auth: {
        ...opcionesPorDefecto,
        ...opciones,
        flowType: 'pkce',
      },
    });
  }

  /**
   * Inicializa logging de debug en desarrollo
   */
  private inicializarLogging(): void {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('[Supabase] Cliente inicializado:', {
        url: CONFIG_SUPABASE.URL,
        tieneKey: !!CONFIG_SUPABASE.ANON_KEY,
        longitudKey: CONFIG_SUPABASE.ANON_KEY?.length,
        estaConfigurado: !!(CONFIG_SUPABASE.URL && CONFIG_SUPABASE.ANON_KEY),
      });
    }
  }

  /**
   * Verifica la conexión con Supabase
   */
  async verificarConexion(): Promise<boolean> {
    try {
      const { error } = await this.cliente.from('user_profiles').select('count', { count: 'exact', head: true });
      return !error;
    } catch (error) {
      console.error('Error al verificar conexión con Supabase:', error);
      return false;
    }
  }

  /**
   * Obtiene el usuario actual autenticado
   */
  async obtenerUsuarioActual() {
    try {
      const { data: { user }, error } = await this.cliente.auth.getUser();
      
      if (error) {
        throw new ErrorInfraestructura('Error al obtener usuario actual', { error });
      }

      return user;
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      throw error;
    }
  }

  /**
   * Obtiene la sesión actual
   */
  async obtenerSesionActual() {
    try {
      const { data: { session }, error } = await this.cliente.auth.getSession();
      
      if (error) {
        throw new ErrorInfraestructura('Error al obtener sesión actual', { error });
      }

      return session;
    } catch (error) {
      console.error('Error al obtener sesión actual:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const clienteSupabase = ClienteSupabase.obtenerInstancia();

// Exportar cliente para compatibilidad con código existente
export const supabase = clienteSupabase.obtenerCliente();
