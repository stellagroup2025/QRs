import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import 'multer';

@Injectable()
export class BrandingService {
  constructor(private readonly supabase: SupabaseService) { }

  /**
   * Sube un archivo (logo, favicon, etc) a Supabase Storage
   */
  async uploadFile(
    idTienda: string,
    file: Express.Multer.File,
    type: 'logo' | 'favicon' | 'og_image' | 'hero_image' | 'hero_bg' | 'servicios_bg' | 'beneficios_bg' | 'testimonios_bg' | 'cta_final_bg',
  ): Promise<{ url: string }> {
    const client = this.supabase.getAdminClient();

    // Validar tipo de archivo
    const validMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/x-icon'];
    if (!validMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Tipo de archivo no permitido');
    }

    // Validar tamano (max 5MB para fondos, 2MB para resto)
    const isBackground = type.includes('_bg');
    const maxSize = isBackground ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException(`El archivo no puede superar ${isBackground ? '5MB' : '2MB'}`);
    }

    // Generar nombre unico para el archivo
    const timestamp = Date.now();
    const fileExtension = file.originalname.split('.').pop() || 'png';
    const fileName = `${type}_${timestamp}.${fileExtension}`;
    const filePath = `tiendas/${idTienda}/${fileName}`;

    console.log(`[UPLOAD] Subiendo ${type} para tienda ${idTienda}`);
    console.log(`  - Path: ${filePath}`);
    console.log(`  - Size: ${file.size} bytes`);
    console.log(`  - MIME: ${file.mimetype}`);

    // Subir a Supabase Storage
    const { data, error } = await client.storage
      .from('branding')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      console.error('[UPLOAD ERROR]', error);
      throw new BadRequestException(`Error al subir archivo: ${error.message}`);
    }

    // Obtener URL publica
    const { data: publicUrl } = client.storage
      .from('branding')
      .getPublicUrl(filePath);

    const url = publicUrl.publicUrl;
    console.log(`  - URL: ${url}`);

    // Determinar tabla y campo a actualizar
    const isLandingImage = [
      'hero_image', 'hero_bg',
      'servicios_bg', 'beneficios_bg', 'testimonios_bg', 'cta_final_bg'
    ].includes(type);

    let table = 'tiendas';
    let field = '';

    if (isLandingImage) {
      table = 'landing_config';
      // Mapeo directo: type 'hero_image' -> column 'hero_imagen_url', type 'hero_bg' -> 'hero_bg_url'
      if (type === 'hero_image') field = 'hero_imagen_url';
      else field = `${type}_url`;
    } else {
      // Branding types
      if (type === 'logo') field = 'logo_url';
      else if (type === 'favicon') field = 'favicon_url';
      else if (type === 'og_image') field = 'og_image_url';
    }

    if (field) {
      const { error: updateError } = await client
        .from(table)
        .update({ [field]: url })
        .eq('id_tienda', idTienda) // landing_config usa id_tienda
        .eq(table === 'tiendas' ? 'id' : 'id_tienda', idTienda); // tiendas usa id

      // Correction: tiendas table uses 'id', landing_config uses 'id_tienda'
      const matchQuery = table === 'tiendas' ? { id: idTienda } : { id_tienda: idTienda };

      const { error: finalUpdateError } = await client
        .from(table)
        .update({ [field]: url })
        .match(matchQuery);

      if (finalUpdateError) {
        console.error('[UPDATE ERROR]', finalUpdateError);
        // Si falla update en landing_config es posible que no exista el registro.
        // Pero landing_config se autocrea en get/update. Deberia existir.
      }
    }

    console.log(`[UPLOAD] Subida completada: ${url}`);

    return { url };
  }

  async getBranding(idTienda: string) {
    const client = this.supabase.getClient();

    const { data: tienda, error } = await client
      .from('tiendas')
      .select('logo_url, favicon_url, og_image_url, color_primario, color_secundario, color_acento, nombre_comercial, nombre')
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
      logo_url: tienda.logo_url || '/brand/qronnect/logo.svg',
      favicon_url: tienda.favicon_url || '/brand/qronnect/favicon.ico',
      og_image_url: tienda.og_image_url || '/brand/qronnect/og-qronnect.jpg',
      color_primario: tienda.color_primario || '#000000',
      color_secundario: tienda.color_secundario || '#666666',
      color_acento: tienda.color_acento || '#0066cc',
      nombre_comercial: tienda.nombre_comercial || tienda.nombre,
    };
  }
}
