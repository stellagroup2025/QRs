import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreateProgramaSellosDto } from './dto/create-programa-sellos.dto';
import { UpdateProgramaSellosDto } from './dto/update-programa-sellos.dto';
import { OtorgarSelloDto } from './dto/otorgar-sello.dto';
import { CanjearCuponSelloDto } from './dto/canjear-cupon-sello.dto';
import {
  ProgramaSellos,
  TarjetaSelloCliente,
  TarjetaSelloConProgreso,
  SelloOtorgado,
  EstadisticasProgramaSellos,
  RespuestaOtorgarSello,
  RespuestaCanjearCupon,
} from './interfaces/programa-sellos.interface';

@Injectable()
export class SellosService {
  private readonly logger = new Logger(SellosService.name);

  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Crear un nuevo programa de sellos
   */
  async crearPrograma(
    idTienda: string,
    createDto: CreateProgramaSellosDto,
  ): Promise<ProgramaSellos> {
    this.logger.log(`Creando programa de sellos para tienda ${idTienda}`);

    const { data, error } = await this.supabase
      .from('programas_sellos')
      .insert({
        id_tienda: idTienda,
        ...createDto,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error al crear programa de sellos', error);
      throw new BadRequestException(
        `Error al crear programa de sellos: ${error.message}`,
      );
    }

    return data;
  }

  /**
   * Obtener todos los programas de sellos de una tienda
   */
  async obtenerProgramas(
    idTienda: string,
    soloActivos = false,
  ): Promise<ProgramaSellos[]> {
    let query = this.supabase
      .from('programas_sellos')
      .select('*')
      .eq('id_tienda', idTienda)
      .order('creado_en', { ascending: false });

    if (soloActivos) {
      query = query.eq('activo', true).eq('visible_cliente', true);
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error('Error al obtener programas de sellos', error);
      throw new BadRequestException(
        `Error al obtener programas: ${error.message}`,
      );
    }

    return data || [];
  }

  /**
   * Obtener un programa de sellos por ID
   */
  async obtenerPrograma(
    idPrograma: string,
    idTienda: string,
  ): Promise<ProgramaSellos> {
    const { data, error } = await this.supabase
      .from('programas_sellos')
      .select('*')
      .eq('id', idPrograma)
      .eq('id_tienda', idTienda)
      .single();

    if (error || !data) {
      throw new NotFoundException('Programa de sellos no encontrado');
    }

    return data;
  }

  /**
   * Actualizar un programa de sellos
   */
  async actualizarPrograma(
    idPrograma: string,
    idTienda: string,
    updateDto: UpdateProgramaSellosDto,
  ): Promise<ProgramaSellos> {
    const { data, error } = await this.supabase
      .from('programas_sellos')
      .update(updateDto)
      .eq('id', idPrograma)
      .eq('id_tienda', idTienda)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Programa de sellos no encontrado');
    }

    return data;
  }

  /**
   * Eliminar (desactivar) un programa de sellos
   */
  async eliminarPrograma(idPrograma: string, idTienda: string): Promise<void> {
    const { error } = await this.supabase
      .from('programas_sellos')
      .update({ activo: false })
      .eq('id', idPrograma)
      .eq('id_tienda', idTienda);

    if (error) {
      throw new BadRequestException(
        `Error al eliminar programa: ${error.message}`,
      );
    }
  }

  /**
   * Otorgar un sello a un cliente
   */
  async otorgarSello(
    idTienda: string,
    idUsuarioStaff: string,
    otorgarDto: OtorgarSelloDto,
  ): Promise<RespuestaOtorgarSello> {
    this.logger.log(
      `Otorgando sello a cliente ${otorgarDto.id_cliente} en programa ${otorgarDto.id_programa}`,
    );

    // Llamar a la función de PostgreSQL
    const { data, error } = await this.supabase.rpc('otorgar_sello', {
      p_cliente_id: otorgarDto.id_cliente,
      p_programa_id: otorgarDto.id_programa,
      p_tienda_id: idTienda,
      p_otorgado_por: idUsuarioStaff,
      p_compra_id: otorgarDto.id_compra || null,
      p_monto_compra: otorgarDto.monto_compra || null,
      p_notas: otorgarDto.notas || null,
    });

    if (error) {
      this.logger.error('Error al otorgar sello', error);
      throw new BadRequestException(`Error al otorgar sello: ${error.message}`);
    }

    if (!data.success) {
      throw new BadRequestException(data.error || 'Error al otorgar sello');
    }

    return data;
  }

  /**
   * Canjear un cupón de sello
   */
  async canjearCupon(
    idTienda: string,
    idUsuarioStaff: string,
    canjearDto: CanjearCuponSelloDto,
  ): Promise<RespuestaCanjearCupon> {
    this.logger.log(`Canjeando cupón ${canjearDto.codigo_cupon}`);

    // Llamar a la función de PostgreSQL
    const { data, error } = await this.supabase.rpc('canjear_cupon_sello', {
      p_codigo_cupon: canjearDto.codigo_cupon,
      p_tienda_id: idTienda,
      p_canjeado_por: idUsuarioStaff,
    });

    if (error) {
      this.logger.error('Error al canjear cupón', error);
      throw new BadRequestException(`Error al canjear cupón: ${error.message}`);
    }

    if (!data.success) {
      throw new BadRequestException(data.error || 'Error al canjear cupón');
    }

    return data;
  }

  /**
   * Obtener tarjetas de sellos de un cliente
   */
  async obtenerTarjetasCliente(
    idCliente: string,
    idTienda: string,
    soloActivas = false,
  ): Promise<TarjetaSelloConProgreso[]> {
    let query = this.supabase
      .from('vista_tarjetas_sellos_progreso')
      .select('*')
      .eq('id_cliente', idCliente)
      .eq('id_tienda', idTienda)
      .order('actualizado_en', { ascending: false });

    if (soloActivas) {
      query = query.eq('estado', 'activa');
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error('Error al obtener tarjetas del cliente', error);
      throw new BadRequestException(
        `Error al obtener tarjetas: ${error.message}`,
      );
    }

    return data || [];
  }

  /**
   * Obtener todas las tarjetas de una tienda (dashboard admin)
   */
  async obtenerTarjetasTienda(
    idTienda: string,
    estado?: string,
  ): Promise<TarjetaSelloConProgreso[]> {
    let query = this.supabase
      .from('vista_tarjetas_sellos_progreso')
      .select('*')
      .eq('id_tienda', idTienda)
      .order('actualizado_en', { ascending: false });

    if (estado) {
      query = query.eq('estado', estado);
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error('Error al obtener tarjetas de la tienda', error);
      throw new BadRequestException(
        `Error al obtener tarjetas: ${error.message}`,
      );
    }

    return data || [];
  }

  /**
   * Obtener detalle de una tarjeta específica
   */
  async obtenerDetalleTarjeta(
    idTarjeta: string,
    idTienda: string,
  ): Promise<TarjetaSelloConProgreso> {
    const { data, error } = await this.supabase
      .from('vista_tarjetas_sellos_progreso')
      .select('*')
      .eq('id', idTarjeta)
      .eq('id_tienda', idTienda)
      .single();

    if (error || !data) {
      throw new NotFoundException('Tarjeta no encontrada');
    }

    return data;
  }

  /**
   * Obtener sellos de una tarjeta
   */
  async obtenerSellosTarjeta(
    idTarjeta: string,
    idTienda: string,
  ): Promise<SelloOtorgado[]> {
    const { data, error } = await this.supabase
      .from('sellos_otorgados')
      .select('*')
      .eq('id_tarjeta', idTarjeta)
      .eq('id_tienda', idTienda)
      .order('fecha_otorgado', { ascending: false });

    if (error) {
      this.logger.error('Error al obtener sellos de la tarjeta', error);
      throw new BadRequestException(
        `Error al obtener sellos: ${error.message}`,
      );
    }

    return data || [];
  }

  /**
   * Obtener estadísticas de programas de sellos
   */
  async obtenerEstadisticas(
    idTienda: string,
  ): Promise<EstadisticasProgramaSellos[]> {
    const { data, error } = await this.supabase
      .from('vista_estadisticas_programas_sellos')
      .select('*')
      .eq('id_tienda', idTienda)
      .order('total_clientes_participantes', { ascending: false });

    if (error) {
      this.logger.error('Error al obtener estadísticas', error);
      throw new BadRequestException(
        `Error al obtener estadísticas: ${error.message}`,
      );
    }

    return data || [];
  }

  /**
   * Verificar cupón (sin canjear, solo validar)
   */
  async verificarCupon(
    codigoCupon: string,
    idTienda: string,
  ): Promise<TarjetaSelloConProgreso> {
    const { data, error } = await this.supabase
      .from('vista_tarjetas_sellos_progreso')
      .select('*')
      .eq('codigo_cupon', codigoCupon)
      .eq('id_tienda', idTienda)
      .single();

    if (error || !data) {
      throw new NotFoundException('Cupón no encontrado');
    }

    return data;
  }

  /**
   * Cancelar una tarjeta de sellos
   */
  async cancelarTarjeta(idTarjeta: string, idTienda: string): Promise<void> {
    const { error } = await this.supabase
      .from('tarjetas_sellos_clientes')
      .update({ estado: 'cancelada' })
      .eq('id', idTarjeta)
      .eq('id_tienda', idTienda);

    if (error) {
      throw new BadRequestException(
        `Error al cancelar tarjeta: ${error.message}`,
      );
    }
  }
}
