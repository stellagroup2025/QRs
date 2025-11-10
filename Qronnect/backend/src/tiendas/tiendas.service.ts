import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

/**
 * Servicio para gestionar tiendas
 */
@Injectable()
export class TiendasService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Obtiene una tienda por su ID
   */
  async getTiendaById(tiendaId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('tiendas')
      .select('*')
      .eq('id', tiendaId)
      .single();

    if (error) {
      console.error('Error al obtener tienda:', error);
      return null;
    }

    return data;
  }
}
