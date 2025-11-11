import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePromocionDto, TipoPromocion } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';
import { PromocionResponseDto, ListPromocionesDto } from './dto/promocion-response.dto';
import { CanjearPromocionDto, CanjeResponseDto } from './dto/canjear-promocion.dto';
import { ValidarCanjeDto, ValidarCanjeResponseDto } from './dto/validar-canje.dto';
import { CreateFromAiSuggestionDto } from './dto/create-from-ai-suggestion.dto';

@Injectable()
export class PromocionesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Crear una nueva promoción (Admin)
   */
  async create(tiendaId: string, createDto: CreatePromocionDto): Promise<PromocionResponseDto> {
    const supabase = this.supabaseService.getAdminClient();

    const promocionData = {
      id_tienda: tiendaId,
      titulo: createDto.titulo,
      descripcion: createDto.descripcion || null,
      tipo: createDto.tipo,
      valor: createDto.valor,
      puntos_requeridos: createDto.puntos_requeridos,
      imagen_url: createDto.imagen_url || null,
      activo: createDto.activo !== undefined ? createDto.activo : true,
      fecha_inicio: createDto.fecha_inicio || new Date().toISOString(),
      fecha_fin: createDto.fecha_fin || null,
      cantidad_disponible: createDto.cantidad_disponible || null,
      cantidad_canjeada: 0,
    };

    const { data, error } = await supabase
      .from('promociones')
      .insert(promocionData)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Error al crear promoción: ${error.message}`);
    }

    return this.mapToResponseDto(data);
  }

  /**
   * Listar todas las promociones de una tienda (Admin)
   */
  async findAll(tiendaId: string, page: number = 1, limit: number = 20): Promise<ListPromocionesDto> {
    const supabase = this.supabaseService.getAdminClient();
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('promociones')
      .select('*', { count: 'exact' })
      .eq('id_tienda', tiendaId)
      .order('creado_en', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new BadRequestException(`Error al listar promociones: ${error.message}`);
    }

    return {
      data: data.map(p => this.mapToResponseDto(p)),
      total: count || 0,
      page,
      limit,
    };
  }

  /**
   * Listar promociones disponibles para clientes
   */
  async findAvailableForClientes(tiendaId: string): Promise<PromocionResponseDto[]> {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('vista_promociones_disponibles')
      .select('*')
      .eq('id_tienda', tiendaId)
      .order('puntos_requeridos', { ascending: true });

    if (error) {
      throw new BadRequestException(`Error al listar promociones disponibles: ${error.message}`);
    }

    return data.map(p => this.mapToResponseDto(p));
  }

  /**
   * Obtener una promoción por ID
   */
  async findOne(tiendaId: string, id: string): Promise<PromocionResponseDto> {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('promociones')
      .select('*')
      .eq('id', id)
      .eq('id_tienda', tiendaId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Promoción no encontrada`);
    }

    return this.mapToResponseDto(data);
  }

  /**
   * Actualizar una promoción (Admin)
   */
  async update(tiendaId: string, id: string, updateDto: UpdatePromocionDto): Promise<PromocionResponseDto> {
    const supabase = this.supabaseService.getAdminClient();

    // Verificar que la promoción existe y pertenece a la tienda
    await this.findOne(tiendaId, id);

    const { data, error } = await supabase
      .from('promociones')
      .update(updateDto)
      .eq('id', id)
      .eq('id_tienda', tiendaId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Error al actualizar promoción: ${error.message}`);
    }

    return this.mapToResponseDto(data);
  }

  /**
   * Eliminar una promoción (Admin)
   */
  async remove(tiendaId: string, id: string): Promise<{ mensaje: string }> {
    const supabase = this.supabaseService.getAdminClient();

    // Verificar que la promoción existe
    await this.findOne(tiendaId, id);

    // Verificar que no tiene canjes pendientes
    const { data: canjesPendientes, error: errorCanjes } = await supabase
      .from('canjes')
      .select('id')
      .eq('id_promocion', id)
      .eq('estado', 'pendiente');

    if (errorCanjes) {
      throw new BadRequestException(`Error al verificar canjes: ${errorCanjes.message}`);
    }

    if (canjesPendientes && canjesPendientes.length > 0) {
      throw new BadRequestException(
        `No se puede eliminar la promoción porque tiene ${canjesPendientes.length} canjes pendientes de usar`
      );
    }

    const { error } = await supabase
      .from('promociones')
      .delete()
      .eq('id', id)
      .eq('id_tienda', tiendaId);

    if (error) {
      throw new BadRequestException(`Error al eliminar promoción: ${error.message}`);
    }

    return { mensaje: 'Promoción eliminada exitosamente' };
  }

  /**
   * Canjear una promoción (Cliente)
   */
  async canjear(
    tiendaId: string,
    clienteId: string,
    canjearDto: CanjearPromocionDto
  ): Promise<CanjeResponseDto> {
    const supabase = this.supabaseService.getAdminClient();

    // 1. Obtener la promoción
    const { data: promocion, error: errorPromo } = await supabase
      .from('promociones')
      .select('*')
      .eq('id', canjearDto.id_promocion)
      .eq('id_tienda', tiendaId)
      .single();

    if (errorPromo || !promocion) {
      throw new NotFoundException('Promoción no encontrada');
    }

    // 2. Validar que la promoción está activa
    if (!promocion.activo) {
      throw new BadRequestException('Esta promoción no está activa');
    }

    // 3. Validar que está dentro del periodo válido
    const now = new Date();
    const fechaInicio = new Date(promocion.fecha_inicio);
    const fechaFin = promocion.fecha_fin ? new Date(promocion.fecha_fin) : null;

    if (now < fechaInicio) {
      throw new BadRequestException('Esta promoción aún no ha comenzado');
    }

    if (fechaFin && now > fechaFin) {
      throw new BadRequestException('Esta promoción ha expirado');
    }

    // 4. Validar que hay cantidad disponible
    if (
      promocion.cantidad_disponible !== null &&
      promocion.cantidad_canjeada >= promocion.cantidad_disponible
    ) {
      throw new BadRequestException('No quedan canjes disponibles para esta promoción');
    }

    // 5. Obtener los puntos del cliente
    const { data: cliente, error: errorCliente } = await supabase
      .from('clientes')
      .select('puntos_totales')
      .eq('id', clienteId)
      .eq('id_tienda', tiendaId)
      .single();

    if (errorCliente || !cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // 6. Validar que el cliente tiene suficientes puntos
    if (cliente.puntos_totales < promocion.puntos_requeridos) {
      throw new BadRequestException(
        `No tienes suficientes puntos. Necesitas ${promocion.puntos_requeridos} pero solo tienes ${cliente.puntos_totales}`
      );
    }

    // 7. Generar código de canje único
    const codigoCanje = await this.generateCodigoCanje();

    // 8. Crear el canje
    const { data: canje, error: errorCanje } = await supabase
      .from('canjes')
      .insert({
        id_cliente: clienteId,
        id_promocion: promocion.id,
        id_tienda: tiendaId,
        puntos_usados: promocion.puntos_requeridos,
        estado: 'pendiente',
        codigo_canje: codigoCanje,
        fecha_canje: new Date().toISOString(),
        // Opcional: establecer fecha de expiración del cupón (ej: 30 días)
        fecha_expiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (errorCanje) {
      throw new BadRequestException(`Error al crear canje: ${errorCanje.message}`);
    }

    // 9. Descontar los puntos del cliente
    const { error: errorUpdate } = await supabase
      .from('clientes')
      .update({
        puntos_totales: cliente.puntos_totales - promocion.puntos_requeridos,
      })
      .eq('id', clienteId);

    if (errorUpdate) {
      // Intentar revertir el canje
      await supabase.from('canjes').delete().eq('id', canje.id);
      throw new BadRequestException(`Error al descontar puntos: ${errorUpdate.message}`);
    }

    // 10. Retornar el canje exitoso
    return {
      id: canje.id,
      id_cliente: canje.id_cliente,
      id_promocion: canje.id_promocion,
      promocion: {
        titulo: promocion.titulo,
        descripcion: promocion.descripcion,
        tipo: promocion.tipo,
        valor: promocion.valor,
      },
      puntos_usados: canje.puntos_usados,
      puntos_restantes: cliente.puntos_totales - promocion.puntos_requeridos,
      estado: canje.estado,
      codigo_canje: canje.codigo_canje,
      fecha_canje: canje.fecha_canje,
      fecha_expiracion: canje.fecha_expiracion,
    };
  }

  /**
   * Validar un canje escaneando el código (Admin)
   */
  async validarCanje(
    tiendaId: string,
    adminId: string,
    validarDto: ValidarCanjeDto
  ): Promise<ValidarCanjeResponseDto> {
    const supabase = this.supabaseService.getAdminClient();

    // 1. Buscar el canje por código
    const { data: canje, error } = await supabase
      .from('canjes')
      .select(`
        *,
        cliente:clientes(id, nombre, email),
        promocion:promociones(id, titulo, descripcion, tipo, valor)
      `)
      .eq('codigo_canje', validarDto.codigo_canje.toUpperCase())
      .eq('id_tienda', tiendaId)
      .single();

    if (error || !canje) {
      throw new NotFoundException('Código de canje no encontrado o inválido');
    }

    // 2. Validar el estado
    if (canje.estado === 'usado') {
      throw new BadRequestException(`Este cupón ya fue usado el ${new Date(canje.fecha_uso).toLocaleString('es-ES')}`);
    }

    if (canje.estado === 'expirado') {
      throw new BadRequestException('Este cupón ha expirado');
    }

    if (canje.estado === 'cancelado') {
      throw new BadRequestException('Este cupón ha sido cancelado');
    }

    // 3. Validar la fecha de expiración
    if (canje.fecha_expiracion) {
      const fechaExp = new Date(canje.fecha_expiracion);
      if (new Date() > fechaExp) {
        // Marcar como expirado
        await supabase
          .from('canjes')
          .update({ estado: 'expirado' })
          .eq('id', canje.id);

        throw new BadRequestException('Este cupón ha expirado');
      }
    }

    // 4. Marcar como usado
    const { error: errorUpdate } = await supabase
      .from('canjes')
      .update({
        estado: 'usado',
        fecha_uso: new Date().toISOString(),
        usado_por: adminId,
      })
      .eq('id', canje.id);

    if (errorUpdate) {
      throw new BadRequestException(`Error al validar canje: ${errorUpdate.message}`);
    }

    // 5. Retornar confirmación
    return {
      id: canje.id,
      cliente: {
        id: canje.cliente.id,
        nombre: canje.cliente.nombre,
        email: canje.cliente.email,
      },
      promocion: {
        id: canje.promocion.id,
        titulo: canje.promocion.titulo,
        descripcion: canje.promocion.descripcion,
        tipo: canje.promocion.tipo,
        valor: canje.promocion.valor,
      },
      puntos_usados: canje.puntos_usados,
      estado_anterior: 'pendiente',
      estado_actual: 'usado',
      fecha_canje: canje.fecha_canje,
      fecha_uso: new Date().toISOString(),
      mensaje: '✅ Cupón validado exitosamente',
    };
  }

  /**
   * Obtener los canjes de un cliente
   */
  async getMisCanjes(tiendaId: string, clienteId: string): Promise<any[]> {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('canjes')
      .select(`
        *,
        promocion:promociones(id, titulo, descripcion, tipo, valor, imagen_url)
      `)
      .eq('id_cliente', clienteId)
      .eq('id_tienda', tiendaId)
      .order('fecha_canje', { ascending: false });

    if (error) {
      throw new BadRequestException(`Error al obtener canjes: ${error.message}`);
    }

    return data;
  }

  /**
   * Generar código de canje único (formato: XXXX-XXXX-XXXX)
   */
  private async generateCodigoCanje(): Promise<string> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin caracteres confusos
    let codigo = '';

    for (let i = 0; i < 12; i++) {
      if (i > 0 && i % 4 === 0) {
        codigo += '-';
      }
      codigo += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Verificar que no exista (muy improbable, pero por seguridad)
    const supabase = this.supabaseService.getAdminClient();
    const { data } = await supabase
      .from('canjes')
      .select('id')
      .eq('codigo_canje', codigo)
      .single();

    if (data) {
      // Si existe, generar uno nuevo (recursivo)
      return this.generateCodigoCanje();
    }

    return codigo;
  }

  /**
   * Mapear datos de base de datos a DTO de respuesta
   */
  private mapToResponseDto(data: any): PromocionResponseDto {
    return {
      id: data.id,
      id_tienda: data.id_tienda,
      titulo: data.titulo,
      descripcion: data.descripcion,
      tipo: data.tipo,
      valor: parseFloat(data.valor),
      puntos_requeridos: data.puntos_requeridos,
      imagen_url: data.imagen_url,
      activo: data.activo,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      cantidad_disponible: data.cantidad_disponible,
      cantidad_canjeada: data.cantidad_canjeada,
      disponible: data.disponible !== undefined
        ? data.disponible
        : data.cantidad_disponible === null || data.cantidad_canjeada < data.cantidad_disponible,
      creado_en: data.creado_en,
      actualizado_en: data.actualizado_en,
    };
  }

  /**
   * Crear promoción desde sugerencia de IA
   * Convierte automáticamente una sugerencia de IA en una promoción borrador
   */
  async createFromAiSuggestion(
    tiendaId: string,
    suggestionDto: CreateFromAiSuggestionDto,
  ): Promise<PromocionResponseDto> {
    // Inferir tipo de promoción si no se especificó
    const tipo = suggestionDto.tipo || this.inferirTipoPromocion(suggestionDto.titulo, suggestionDto.descripcion);

    // Calcular valor por defecto según el tipo
    const valor = suggestionDto.valor !== undefined
      ? suggestionDto.valor
      : this.calcularValorPorDefecto(tipo, suggestionDto.titulo, suggestionDto.descripcion);

    // Calcular puntos requeridos (por defecto, valor * 10 o 100 si no hay valor)
    const puntosRequeridos = suggestionDto.puntos_requeridos !== undefined
      ? suggestionDto.puntos_requeridos
      : Math.max(Math.round(valor * 10), 50);

    // Construir descripción completa combinando datos de la IA
    const descripcionCompleta = this.construirDescripcionCompleta(suggestionDto);

    // Calcular fechas por defecto
    const fechaInicio = suggestionDto.fecha_inicio || new Date().toISOString();
    const fechaFin = suggestionDto.fecha_fin || this.calcularFechaFinPorDefecto();

    // Crear DTO de promoción estándar
    const createDto: CreatePromocionDto = {
      titulo: suggestionDto.titulo,
      descripcion: descripcionCompleta,
      tipo,
      valor,
      puntos_requeridos: puntosRequeridos,
      imagen_url: suggestionDto.imagen_url,
      activo: suggestionDto.activo !== undefined ? suggestionDto.activo : false, // Borrador por defecto
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      cantidad_disponible: suggestionDto.cantidad_disponible,
    };

    // Usar el método create estándar
    return this.create(tiendaId, createDto);
  }

  /**
   * Infiere el tipo de promoción basándose en el título y descripción
   */
  private inferirTipoPromocion(titulo: string, descripcion: string): TipoPromocion {
    const texto = `${titulo} ${descripcion}`.toLowerCase();

    // Buscar patrones comunes
    if (texto.match(/\d+\s*%|porcentaje|descuento del/)) {
      return TipoPromocion.DESCUENTO_PORCENTAJE;
    }
    if (texto.match(/\d+\s*€|euros de descuento|descuento de \d+/)) {
      return TipoPromocion.DESCUENTO_FIJO;
    }
    if (texto.match(/gratis|gratuito|2x1|3x2|regalo/)) {
      return TipoPromocion.PRODUCTO_GRATIS;
    }

    // Por defecto, descuento porcentaje
    return TipoPromocion.DESCUENTO_PORCENTAJE;
  }

  /**
   * Calcula un valor por defecto según el tipo de promoción y el texto
   */
  private calcularValorPorDefecto(tipo: TipoPromocion, titulo: string, descripcion: string): number {
    const texto = `${titulo} ${descripcion}`.toLowerCase();

    // Intentar extraer números del texto
    if (tipo === TipoPromocion.DESCUENTO_PORCENTAJE) {
      const porcentajeMatch = texto.match(/(\d+)\s*%/);
      if (porcentajeMatch) {
        return parseInt(porcentajeMatch[1]);
      }
      return 20; // 20% por defecto
    }

    if (tipo === TipoPromocion.DESCUENTO_FIJO) {
      const eurosMatch = texto.match(/(\d+)\s*€/);
      if (eurosMatch) {
        return parseInt(eurosMatch[1]);
      }
      return 10; // 10€ por defecto
    }

    // Para producto gratis
    return 0;
  }

  /**
   * Construye una descripción completa combinando todos los campos de la sugerencia
   */
  private construirDescripcionCompleta(suggestion: CreateFromAiSuggestionDto): string {
    let partes: string[] = [];

    // Descripción principal
    if (suggestion.descripcion) {
      partes.push(suggestion.descripcion);
    }

    // Condiciones
    if (suggestion.condiciones) {
      partes.push(`\n\n**Condiciones:** ${suggestion.condiciones}`);
    }

    // Mensaje WhatsApp
    if (suggestion.mensajeWhatsApp) {
      partes.push(`\n\n**Mensaje WhatsApp:** ${suggestion.mensajeWhatsApp}`);
    }

    // Texto cartel
    if (suggestion.textoCartel) {
      partes.push(`\n\n**Texto para cartel:** ${suggestion.textoCartel}`);
    }

    // Estimado de impacto
    if (suggestion.estimadoImpacto) {
      partes.push(`\n\n**Impacto esperado:** ${suggestion.estimadoImpacto}`);
    }

    return partes.join('');
  }

  /**
   * Calcula la fecha de fin por defecto (30 días desde ahora)
   */
  private calcularFechaFinPorDefecto(): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 30); // 30 días
    fecha.setHours(23, 59, 59, 999); // Final del día
    return fecha.toISOString();
  }
}
