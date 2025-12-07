import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class QrCodesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // Generar lote de QR codes
  async generarLote(cantidad: number, lote?: string, adminId?: string) {
    const supabase = this.supabaseService.getAdminClient();

    // Generar lote automático si no se proporciona
    if (!lote) {
      const fecha = new Date().toISOString().split('T')[0];
      lote = `LOTE-${fecha}`;
    }

    const { data, error } = await supabase.rpc('generar_qr_codes_batch', {
      p_cantidad: cantidad,
      p_lote: lote,
      p_admin_id: adminId || null,
    });

    if (error) {
      console.error('Error generando QR codes:', error);
      throw new BadRequestException('Error al generar QR codes');
    }

    return {
      cantidad_generada: data.length,
      lote,
      qr_codes: data,
    };
  }

  // Listar QR codes con filtros
  async listarQrCodes(estado?: string, lote?: string) {
    console.log('📋 [QR CODES SERVICE] Listando QR codes. Filtros:', { estado, lote });
    const supabase = this.supabaseService.getAdminClient();

    let query = supabase.from('qr_codes_pool').select(`
      *,
      tienda:tiendas(id, nombre)
    `);

    if (estado) {
      query = query.eq('estado', estado);
    }

    if (lote) {
      query = query.eq('lote', lote);
    }

    const { data, error } = await query.order('creado_en', { ascending: false });

    if (error) {
      console.log('❌ [QR CODES SERVICE] Error al listar QR codes:', error);
      throw new BadRequestException('Error al obtener QR codes');
    }

    console.log('✅ [QR CODES SERVICE] QR codes obtenidos:', data?.length || 0);
    return data;
  }

  // Listar tiendas sin QR asignado
  async listarTiendasSinQr() {
    const supabase = this.supabaseService.getAdminClient();

    // Primero obtenemos todos los IDs de tiendas que tienen QR asignado
    const { data: tiendasConQr, error: errorQr } = await supabase
      .from('qr_codes_pool')
      .select('id_tienda')
      .eq('estado', 'asignado')
      .not('id_tienda', 'is', null);

    if (errorQr) {
      console.error('Error al obtener tiendas con QR:', errorQr);
      throw new BadRequestException('Error al obtener tiendas sin QR');
    }

    // Extraer los IDs de tiendas que ya tienen QR
    const idsConQr = (tiendasConQr || []).map(item => item.id_tienda);

    // Obtener todas las tiendas activas
    let query = supabase
      .from('tiendas')
      .select('id, nombre, dominio, email, activo, creado_en')
      .eq('activo', true);

    // Si hay tiendas con QR, excluirlas
    if (idsConQr.length > 0) {
      query = query.not('id', 'in', `(${idsConQr.join(',')})`);
    }

    const { data, error } = await query.order('creado_en', { ascending: false });

    if (error) {
      console.error('Error al obtener tiendas sin QR:', error);
      throw new BadRequestException('Error al obtener tiendas sin QR');
    }

    return data;
  }

  // Obtener estadísticas generales
  async obtenerEstadisticas() {
    console.log('📊 [QR CODES SERVICE] Obteniendo estadísticas...');
    const supabase = this.supabaseService.getAdminClient();

    const { count: total } = await supabase
      .from('qr_codes_pool')
      .select('*', { count: 'exact', head: true });

    const { count: disponibles } = await supabase
      .from('qr_codes_pool')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'disponible');

    const { count: asignados } = await supabase
      .from('qr_codes_pool')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'asignado');

    const { count: desactivados } = await supabase
      .from('qr_codes_pool')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'desactivado');

    // Escaneos totales
    const { count: totalEscaneos } = await supabase
      .from('qr_redirects_log')
      .select('*', { count: 'exact', head: true });

    // Lotes distintos
    const { data: lotes } = await supabase
      .from('qr_codes_pool')
      .select('lote')
      .not('lote', 'is', null);

    const lotesUnicos = [...new Set((lotes || []).map((l) => l.lote))];

    return {
      total: total || 0,
      disponibles: disponibles || 0,
      asignados: asignados || 0,
      desactivados: desactivados || 0,
      total_escaneos: totalEscaneos || 0,
      lotes: lotesUnicos,
    };
  }

  // Obtener un QR por hash
  async obtenerPorHash(hash: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('qr_codes_pool')
      .select(`
        *,
        tienda:tiendas(id, nombre, slug, sector)
      `)
      .eq('hash', hash)
      .single();

    if (error || !data) {
      throw new NotFoundException('QR code no encontrado');
    }

    return data;
  }

  // Asignar QR a tienda
  async asignarQrATienda(hash: string, idTienda: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase.rpc('asignar_qr_a_tienda', {
      p_hash: hash,
      p_id_tienda: idTienda,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      success: true,
      message: 'QR code asignado exitosamente',
    };
  }

  // Desasignar QR de tienda
  async desasignarQr(hash: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { error } = await supabase
      .from('qr_codes_pool')
      .update({
        estado: 'disponible',
        id_tienda: null,
        fecha_asignacion: null,
        actualizado_en: new Date().toISOString(),
      })
      .eq('hash', hash);

    if (error) {
      throw new BadRequestException('Error al desasignar QR code');
    }

    return {
      success: true,
      message: 'QR code desasignado exitosamente',
    };
  }

  // Obtener analytics de un QR
  async obtenerAnalytics(hash: string) {
    const supabase = this.supabaseService.getAdminClient();

    // Obtener QR
    const qr = await this.obtenerPorHash(hash);

    // Obtener escaneos
    const { data: escaneos, count } = await supabase
      .from('qr_redirects_log')
      .select('*', { count: 'exact' })
      .eq('id_qr', qr.id)
      .order('fecha_escaneo', { ascending: false });

    // Agrupar por dispositivo
    const porDispositivo = (escaneos || []).reduce(
      (acc, item) => {
        acc[item.dispositivo] = (acc[item.dispositivo] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Agrupar por fecha (últimos 30 días)
    const porFecha = (escaneos || [])
      .filter((e) => {
        const fecha = new Date(e.fecha_escaneo);
        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);
        return fecha >= hace30Dias;
      })
      .reduce(
        (acc, item) => {
          const fecha = new Date(item.fecha_escaneo).toISOString().split('T')[0];
          acc[fecha] = (acc[fecha] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

    return {
      qr,
      total_escaneos: count || 0,
      por_dispositivo: porDispositivo,
      por_fecha: porFecha,
      ultimos_escaneos: (escaneos || []).slice(0, 20),
    };
  }

  // Exportar a CSV
  async exportarACsv(lote: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('qr_codes_pool')
      .select('hash, qr_url, estado, fecha_asignacion')
      .eq('lote', lote)
      .order('creado_en', { ascending: true });

    if (error || !data || data.length === 0) {
      throw new NotFoundException('Lote no encontrado o vacío');
    }

    // Generar CSV
    const headers = ['Hash', 'URL', 'Estado', 'Fecha Asignación'];
    const rows = data.map((qr) => [
      qr.hash,
      qr.qr_url,
      qr.estado,
      qr.fecha_asignacion || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

    return {
      lote,
      cantidad: data.length,
      csv,
      filename: `qr-codes-${lote}.csv`,
    };
  }
}
