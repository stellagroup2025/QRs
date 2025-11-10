import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class BrandingService {
  constructor(private readonly supabase: SupabaseService) {}

  async getBranding(idTienda: string) {
    const client = this.supabase.getClient();

    const { data: tienda, error } = await client
      .from('tiendas')
      .select('logo_url, color_primario, color_secundario, color_acento, nombre_comercial, nombre')
      .eq('id', idTienda)
      .eq('activo', true)
      .single();

    if (error) {
      console.error('[BRANDING ERROR]', error);
      throw new NotFoundException(`Error al obtener branding: ${error.message}`);
    }

    if (!tienda) {
      throw new NotFoundException('Tienda no encontrada o inactiva');
    }

    return {
      logo_url: tienda.logo_url || null,
      color_primario: tienda.color_primario || '#000000',
      color_secundario: tienda.color_secundario || '#666666',
      color_acento: tienda.color_acento || '#0066cc',
      nombre_comercial: tienda.nombre_comercial || tienda.nombre,
    };
  }
}
