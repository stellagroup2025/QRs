import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class LandingService {
  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Obtiene la configuración de landing de una tienda
   */
  async getLandingConfig(idTienda: string) {
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('landing_config')
      .select('*')
      .eq('id_tienda', idTienda)
      .eq('activo', true)
      .single();

    if (error || !data) {
      throw new NotFoundException(
        'Configuración de landing no encontrada para esta tienda',
      );
    }

    // Remover campos internos
    const { id, id_tienda, created_at, updated_at, activo, ...config } = data;

    return config;
  }

  /**
   * Actualiza la configuración de landing de una tienda
   */
  async updateLandingConfig(idTienda: string, updates: Partial<any>) {
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('landing_config')
      .update(updates)
      .eq('id_tienda', idTienda)
      .select()
      .single();

    if (error) {
      throw new NotFoundException(
        'No se pudo actualizar la configuración de landing',
      );
    }

    return data;
  }
}
