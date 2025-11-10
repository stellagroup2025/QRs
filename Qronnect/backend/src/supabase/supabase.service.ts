import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Servicio de integración con Supabase
 * Proporciona dos clientes:
 * 1. Cliente con SERVICE_ROLE_KEY: bypasea RLS, para operaciones de admin
 * 2. Cliente con ANON_KEY: respeta RLS, para operaciones de usuarios finales
 */
@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabaseAdmin: SupabaseClient;
  private supabaseClient: SupabaseClient;

  constructor(private configService: ConfigService) {}

  /**
   * Inicializa los clientes de Supabase al arrancar el módulo
   */
  onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      throw new Error(
        'Missing Supabase environment variables. Check SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in .env',
      );
    }

    // Cliente con SERVICE_ROLE_KEY - bypasea Row Level Security
    // Usar SOLO para operaciones de admin que necesiten acceso completo
    this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Cliente con ANON_KEY - respeta Row Level Security
    // Usar para operaciones de usuarios finales
    this.supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('✅ Supabase clients initialized');
  }

  /**
   * Devuelve el cliente con SERVICE_ROLE_KEY
   * ⚠️ IMPORTANTE: Este cliente bypasea RLS, usar solo para operaciones de admin
   * Casos de uso:
   * - Panel de admin: ver todos los clientes, compras, etc.
   * - Registrar compras desde el panel
   * - Operaciones CRUD de tiendas
   */
  getAdminClient(): SupabaseClient {
    return this.supabaseAdmin;
  }

  /**
   * Devuelve el cliente con ANON_KEY
   * Este cliente respeta RLS y es usado típicamente con un JWT de usuario
   * Casos de uso:
   * - Operaciones de clientes finales
   * - Consultas que necesitan respetar permisos RLS
   */
  getClient(): SupabaseClient {
    return this.supabaseClient;
  }

  /**
   * Verifica un JWT de Supabase Auth y devuelve los datos del usuario
   * @param token - JWT token obtenido del frontend (Supabase Auth)
   * @returns Usuario autenticado o null si el token es inválido
   */
  async verifyToken(token: string) {
    try {
      const {
        data: { user },
        error,
      } = await this.supabaseClient.auth.getUser(token);

      if (error || !user) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error verifying token:', error);
      return null;
    }
  }

  /**
   * Obtiene un cliente autenticado con un JWT específico
   * Útil cuando necesitas hacer queries con el contexto de un usuario específico
   * respetando las políticas RLS
   */
  getAuthenticatedClient(accessToken: string): SupabaseClient {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
}
