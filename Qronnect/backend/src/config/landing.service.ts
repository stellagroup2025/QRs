import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class LandingService {
  private readonly logger = new Logger(LandingService.name);

  constructor(private readonly supabase: SupabaseService) {}

  /**
   * Obtiene la configuración de landing de una tienda
   * Auto-crea la configuración si no existe (backward compatibility)
   */
  async getLandingConfig(idTienda: string) {
    const client = this.supabase.getClient();

    const { data, error } = await client
      .from('landing_config')
      .select('*')
      .eq('id_tienda', idTienda)
      .eq('activo', true)
      .single();

    // Si no existe, auto-crear con valores por defecto
    if (error && error.code === 'PGRST116') {
      this.logger.warn(
        `⚠️ No existe landing_config para tienda ${idTienda}, auto-creando...`,
      );

      const { data: newConfig, error: createError } = await client
        .from('landing_config')
        .insert({ id_tienda: idTienda })
        .select()
        .single();

      if (createError) {
        this.logger.error(
          `❌ Error al crear landing_config: ${createError.message}`,
        );
        throw new NotFoundException(
          'No se pudo crear la configuración de landing',
        );
      }

      this.logger.log(`✅ Landing_config creado para tienda ${idTienda}`);

      // Remover campos internos
      const { id, id_tienda, created_at, updated_at, activo, ...config } =
        newConfig;
      return config;
    }

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
   * Auto-crea la configuración si no existe
   */
  async updateLandingConfig(idTienda: string, updates: Partial<any>) {
    const client = this.supabase.getClient();

    // Verificar si existe la configuración
    const { data: existing } = await client
      .from('landing_config')
      .select('id')
      .eq('id_tienda', idTienda)
      .single();

    // Si no existe, crear primero
    if (!existing) {
      this.logger.warn(
        `⚠️ No existe landing_config para tienda ${idTienda}, creando antes de actualizar...`,
      );

      const { error: createError } = await client
        .from('landing_config')
        .insert({ id_tienda: idTienda, ...updates });

      if (createError) {
        this.logger.error(
          `❌ Error al crear landing_config: ${createError.message}`,
        );
        throw new NotFoundException(
          'No se pudo crear la configuración de landing',
        );
      }

      this.logger.log(
        `✅ Landing_config creado y actualizado para tienda ${idTienda}`,
      );

      // Retornar la configuración recién creada
      return this.getLandingConfig(idTienda);
    }

    // Si existe, actualizar normalmente
    const { data, error } = await client
      .from('landing_config')
      .update(updates)
      .eq('id_tienda', idTienda)
      .select()
      .single();

    if (error) {
      this.logger.error(
        `❌ Error al actualizar landing_config: ${error.message}`,
      );
      throw new NotFoundException(
        'No se pudo actualizar la configuración de landing',
      );
    }

    this.logger.log(`✅ Landing_config actualizado para tienda ${idTienda}`);

    return data;
  }
}
