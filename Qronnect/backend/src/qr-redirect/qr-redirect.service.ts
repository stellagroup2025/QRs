import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface RedirectInfo {
  url_destino: string;
  id_qr: string;
  id_tienda: string | null;
  nombre_tienda: string | null;
}

export interface RegistrarEscaneoDto {
  idQr: string;
  idTienda: string | null;
  userAgent: string;
  referer: string;
  ip: string;
  urlDestino: string;
}

@Injectable()
export class QrRedirectService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async obtenerRedireccion(hash: string): Promise<RedirectInfo> {
    const supabase = this.supabaseService.getAdminClient();

    // Llamar a la función PostgreSQL
    const { data, error } = await supabase.rpc('obtener_redireccion_qr', {
      p_hash: hash,
    });

    if (error || !data || data.length === 0) {
      throw new NotFoundException('QR code no encontrado');
    }

    return data[0];
  }

  async registrarEscaneo(dto: RegistrarEscaneoDto): Promise<void> {
    const supabase = this.supabaseService.getAdminClient();

    // Detectar dispositivo
    const dispositivo = this.detectarDispositivo(dto.userAgent);

    // Registrar en log
    await supabase.from('qr_redirects_log').insert({
      id_qr: dto.idQr,
      id_tienda: dto.idTienda,
      user_agent: dto.userAgent,
      ip_address: dto.ip,
      referer: dto.referer,
      url_destino: dto.urlDestino,
      dispositivo,
    });
  }

  private detectarDispositivo(userAgent: string): string {
    if (!userAgent) return 'unknown';

    const ua = userAgent.toLowerCase();

    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    }

    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    }

    return 'desktop';
  }

  // Método para obtener estadísticas de un QR
  async obtenerEstadisticasQr(hash: string) {
    const supabase = this.supabaseService.getAdminClient();

    // Obtener info del QR
    const { data: qr } = await supabase
      .from('qr_codes_pool')
      .select('*')
      .eq('hash', hash)
      .single();

    if (!qr) {
      throw new NotFoundException('QR code no encontrado');
    }

    // Obtener estadísticas de escaneos
    const { data: escaneos, count } = await supabase
      .from('qr_redirects_log')
      .select('*', { count: 'exact' })
      .eq('id_qr', qr.id);

    // Agrupar por dispositivo
    const porDispositivo = await supabase
      .from('qr_redirects_log')
      .select('dispositivo')
      .eq('id_qr', qr.id);

    const conteoDispositivos = (porDispositivo.data || []).reduce(
      (acc, item) => {
        acc[item.dispositivo] = (acc[item.dispositivo] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      qr,
      total_escaneos: count || 0,
      por_dispositivo: conteoDispositivos,
      ultimos_escaneos: escaneos?.slice(0, 10) || [],
    };
  }
}
