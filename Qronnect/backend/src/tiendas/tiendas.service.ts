import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ConfigurarRegaloBienvenidaDto } from './dto/configurar-regalo-bienvenida.dto';
import { ConfigurarIADto } from './dto/configurar-ia.dto';
import { ConfigurarInfoTiendaDto } from './dto/configurar-info-tienda.dto';
import { ConfigurarPuntosDto } from './dto/configurar-puntos.dto';

/**
 * Servicio para gestionar tiendas
 */
@Injectable()
export class TiendasService {
  constructor(private supabaseService: SupabaseService) { }

  /**
   * Obtiene una tienda por su ID
   */
  async getTiendaById(tiendaId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase.from('tiendas').select('*').eq('id', tiendaId).single();

    if (error) {
      console.error('Error al obtener tienda:', error);
      return null;
    }

    return data;
  }

  /**
   * Obtiene la configuración de branding de una tienda
   */
  async getBranding(tiendaId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('tiendas')
      .select('nombre_comercial, nombre, logo_url, color_primario, color_secundario, color_acento')
      .eq('id', tiendaId)
      .single();

    if (error) {
      console.error('Error obteniendo branding:', error);
      throw new BadRequestException('Error al obtener branding');
    }

    return {
      nombre_comercial: data.nombre_comercial || data.nombre || '',
      logo_url: data.logo_url || null,
      color_primario: data.color_primario || '#0ea5e9',
      color_secundario: data.color_secundario || '#6366f1',
      color_acento: data.color_acento || '#22c55e',
    };
  }

  /**
   * Actualiza la configuración de branding de una tienda
   */
  async updateBranding(
    tiendaId: string,
    dto: { nombre_comercial?: string; color_primario?: string; color_secundario?: string; color_acento?: string; logo_url?: string },
  ) {
    const supabase = this.supabaseService.getAdminClient();

    const updateData: Record<string, any> = {};

    if (dto.nombre_comercial !== undefined) {
      updateData.nombre_comercial = dto.nombre_comercial;
    }
    if (dto.color_primario !== undefined) {
      updateData.color_primario = dto.color_primario;
    }
    if (dto.color_secundario !== undefined) {
      updateData.color_secundario = dto.color_secundario;
    }
    if (dto.color_acento !== undefined) {
      updateData.color_acento = dto.color_acento;
    }
    if (dto.logo_url !== undefined) {
      updateData.logo_url = dto.logo_url;
    }

    const { data, error } = await supabase
      .from('tiendas')
      .update(updateData)
      .eq('id', tiendaId)
      .select('nombre_comercial, nombre, logo_url, color_primario, color_secundario, color_acento')
      .single();

    if (error) {
      console.error('Error actualizando branding:', error);
      throw new BadRequestException('Error al actualizar branding');
    }

    return {
      success: true,
      message: 'Branding actualizado correctamente',
      branding: {
        nombre_comercial: data.nombre_comercial || data.nombre || '',
        logo_url: data.logo_url || null,
        color_primario: data.color_primario || '#0ea5e9',
        color_secundario: data.color_secundario || '#6366f1',
        color_acento: data.color_acento || '#22c55e',
      },
    };
  }

  /**
   * Configura el sistema de regalos de bienvenida para una tienda
   */
  async configurarRegaloBienvenida(tiendaId: string, dto: ConfigurarRegaloBienvenidaDto) {
    const supabase = this.supabaseService.getAdminClient();

    // Validar según tipo
    if (dto.tipo === 'puntos' && !dto.valor.puntos) {
      throw new BadRequestException('Debes especificar la cantidad de puntos');
    }

    if (dto.tipo === 'cupon' && !dto.valor.descuento_porcentaje) {
      throw new BadRequestException('Debes especificar el porcentaje de descuento');
    }

    if (dto.tipo === 'promocion' && !dto.valor.promocion_id) {
      throw new BadRequestException('Debes especificar el ID de la promoción');
    }

    const { data, error } = await supabase
      .from('tiendas')
      .update({
        regalo_bienvenida_activo: dto.activo,
        regalo_bienvenida_tipo: dto.tipo,
        regalo_bienvenida_valor: dto.valor,
      })
      .eq('id', tiendaId)
      .select()
      .single();

    if (error) {
      console.error('Error configurando regalo de bienvenida:', error);
      throw new BadRequestException('Error al configurar regalo de bienvenida');
    }

    return {
      success: true,
      message: 'Regalo de bienvenida configurado correctamente',
      config: {
        activo: data.regalo_bienvenida_activo,
        tipo: data.regalo_bienvenida_tipo,
        valor: data.regalo_bienvenida_valor,
      },
    };
  }

  /**
   * Obtiene la configuración de regalos de bienvenida de una tienda
   */
  async getConfiguracionRegaloBienvenida(tiendaId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('tiendas')
      .select('regalo_bienvenida_activo, regalo_bienvenida_tipo, regalo_bienvenida_valor')
      .eq('id', tiendaId)
      .single();

    if (error) {
      console.error('Error obteniendo configuración:', error);
      throw new BadRequestException('Error al obtener configuración');
    }

    return {
      activo: data.regalo_bienvenida_activo || false,
      tipo: data.regalo_bienvenida_tipo || null,
      valor: data.regalo_bienvenida_valor || {},
    };
  }

  /**
   * Obtiene estadísticas de regalos otorgados
   */
  async getEstadisticasRegalos(tiendaId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase.rpc('estadisticas_regalos_bienvenida', {
      p_tienda_id: tiendaId,
    });

    if (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw new BadRequestException('Error al obtener estadísticas');
    }

    return data;
  }

  /**
   * Lista los regalos otorgados a clientes de una tienda
   */
  async listarRegalosOtorgados(tiendaId: string, limit: number = 50, offset: number = 0) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error, count } = await supabase
      .from('vista_regalos_bienvenida')
      .select('*', { count: 'exact' })
      .eq('id_tienda', tiendaId)
      .order('creado_en', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error listando regalos:', error);
      throw new BadRequestException('Error al listar regalos');
    }

    return {
      regalos: data || [],
      total: count || 0,
      limit,
      offset,
    };
  }

  /**
   * Configura el contexto de IA para una tienda
   */
  async configurarIA(tiendaId: string, dto: ConfigurarIADto) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('tiendas')
      .update({
        config_ia: dto,
      })
      .eq('id', tiendaId)
      .select()
      .single();

    if (error) {
      console.error('Error configurando IA:', error);
      throw new BadRequestException('Error al configurar IA');
    }

    return {
      success: true,
      message: 'Configuración de IA actualizada correctamente',
      config: data.config_ia,
    };
  }

  /**
   * Obtiene la configuración de IA de una tienda
   */
  async getConfiguracionIA(tiendaId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('tiendas')
      .select('config_ia')
      .eq('id', tiendaId)
      .single();

    if (error) {
      console.error('Error obteniendo configuración IA:', error);
      throw new BadRequestException('Error al obtener configuración IA');
    }

    return data.config_ia || {};
  }

  /**
   * Configura la información de contacto y horarios de la tienda
   */
  async configurarInfoTienda(tiendaId: string, dto: ConfigurarInfoTiendaDto) {
    const supabase = this.supabaseService.getAdminClient();

    const updateData: any = {};

    if (dto.descripcion !== undefined) {
      updateData.descripcion = dto.descripcion;
    }

    if (dto.sitio_web !== undefined) {
      updateData.sitio_web = dto.sitio_web;
    }

    if (dto.whatsapp !== undefined) {
      updateData.whatsapp = dto.whatsapp;
    }

    if (dto.ubicacion_maps !== undefined) {
      updateData.ubicacion_maps = dto.ubicacion_maps;
    }

    if (dto.google_reviews_url !== undefined) {
      updateData.google_reviews_url = dto.google_reviews_url;
    }

    if (dto.horarios !== undefined) {
      updateData.horarios = dto.horarios;
    }

    if (dto.redes_sociales !== undefined) {
      updateData.redes_sociales = dto.redes_sociales;
    }

    const { data, error } = await supabase
      .from('tiendas')
      .update(updateData)
      .eq('id', tiendaId)
      .select()
      .single();

    if (error) {
      console.error('Error configurando información de tienda:', error);
      throw new BadRequestException('Error al configurar información de tienda');
    }

    return {
      success: true,
      message: 'Información de tienda actualizada correctamente',
      tienda: {
        descripcion: data.descripcion,
        sitio_web: data.sitio_web,
        whatsapp: data.whatsapp,
        ubicacion_maps: data.ubicacion_maps,
        horarios: data.horarios,
        redes_sociales: data.redes_sociales,
      },
    };
  }

  /**
   * Obtiene la información completa de una tienda (para clientes)
   */
  async getInfoTienda(tiendaId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('tiendas')
      .select(
        'nombre, descripcion, direccion, telefono, email, sitio_web, whatsapp, ubicacion_maps, google_reviews_url, horarios, redes_sociales, logo_url, color_primario, color_secundario, color_acento',
      )
      .eq('id', tiendaId)
      .single();

    if (error) {
      console.error('Error obteniendo información de tienda:', error);
      throw new BadRequestException('Error al obtener información de tienda');
    }

    // Verificar si está abierta ahora
    const estaAbierta = this.verificarHorario(data.horarios);

    return {
      ...data,
      esta_abierta: estaAbierta,
    };
  }

  /**
   * Verifica si la tienda está abierta en el momento actual según sus horarios
   */
  private verificarHorario(horarios: any): boolean | null {
    if (!horarios || typeof horarios !== 'object') {
      return null; // Sin información de horarios
    }

    const now = new Date();
    const diasSemana = [
      'domingo',
      'lunes',
      'martes',
      'miercoles',
      'jueves',
      'viernes',
      'sabado',
    ];
    const diaActual = diasSemana[now.getDay()];

    const horarioDia = horarios[diaActual];

    if (!horarioDia || !horarioDia.abierto) {
      return false; // Cerrado hoy
    }

    if (!horarioDia.apertura || !horarioDia.cierre) {
      return null; // Sin información de horarios
    }

    // Convertir hora actual a minutos desde medianoche
    const horaActualMinutos = now.getHours() * 60 + now.getMinutes();

    // Convertir horarios de apertura y cierre a minutos
    const [horaApertura, minApertura] = horarioDia.apertura.split(':').map(Number);
    const [horaCierre, minCierre] = horarioDia.cierre.split(':').map(Number);

    const aperturaMinutos = horaApertura * 60 + minApertura;
    const cierreMinutos = horaCierre * 60 + minCierre;

    return horaActualMinutos >= aperturaMinutos && horaActualMinutos <= cierreMinutos;
  }

  /**
   * Configura el sistema de puntos de la tienda
   */
  async updatePuntosConfig(tiendaId: string, dto: ConfigurarPuntosDto) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('tiendas')
      .update({
        puntos_por_euro: dto.puntos_por_euro,
        puntos_bienvenida: dto.puntos_bienvenida,
      })
      .eq('id', tiendaId)
      .select()
      .single();

    if (error) {
      console.error('Error configurando puntos:', error);
      throw new BadRequestException('Error al configurar puntos');
    }

    return {
      success: true,
      message: 'Configuración de puntos actualizada correctamente',
      config: {
        puntos_por_euro: data.puntos_por_euro,
        puntos_bienvenida: data.puntos_bienvenida,
      },
    };
  }

  /**
   * Obtiene la configuración de puntos de la tienda
   */
  async getPuntosConfig(tiendaId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('tiendas')
      .select('puntos_por_euro, puntos_bienvenida')
      .eq('id', tiendaId)
      .single();

    if (error) {
      console.error('Error obteniendo configuración de puntos:', error);
      throw new BadRequestException('Error al obtener configuración de puntos');
    }

    return {
      puntos_por_euro: data.puntos_por_euro || 10,
      puntos_bienvenida: data.puntos_bienvenida || 0,
    };
  }
}
