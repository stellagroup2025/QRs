import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { EmailService } from '../email/email.service';
import { TenantContext } from '../tenant/entities/tenant-context.entity';
import { RegistrarCompraDto } from './dto/registrar-compra.dto';
import { CompraResponseDto } from './dto/compra-response.dto';
import { ListComprasDto } from '../admin/dto/list-compras.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';

@Injectable()
export class ComprasService {
  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  /**
   * Registra una nueva compra y actualiza los puntos del cliente
   * Esta es la función principal del sistema de fidelización
   *
   * MULTITENANCY: Usa la configuración del tenant para calcular puntos
   *
   * Flujo:
   * 1. Buscar cliente por código QR o por ID directo
   * 2. Calcular puntos a otorgar (importe * factor del tenant)
   * 3. Insertar compra en BD
   * 4. Actualizar puntos totales del cliente
   * 5. Actualizar última visita
   */
  async registrarCompra(
    tenant: TenantContext,
    registrarDto: RegistrarCompraDto,
  ): Promise<CompraResponseDto> {
    const supabase = this.supabaseService.getAdminClient();
    const tiendaId = tenant.id;

    // Validar que se proporcione al menos uno de los dos métodos de identificación
    if (!registrarDto.codigoQr && !registrarDto.clienteId) {
      throw new BadRequestException('Debes proporcionar codigoQr o clienteId');
    }

    let cliente: any;
    let clienteId: string;

    // 1. Buscar el cliente por código QR o por ID
    if (registrarDto.clienteId) {
      // Búsqueda directa por ID del cliente
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .select('id, nombre, email, puntos_totales, id_tienda')
        .eq('id', registrarDto.clienteId)
        .eq('id_tienda', tiendaId)
        .eq('activo', true)
        .single();

      if (clienteError || !clienteData) {
        throw new BadRequestException('Cliente no encontrado o no pertenece a esta tienda');
      }

      cliente = clienteData;
      clienteId = cliente.id;
    } else {
      // Búsqueda por código QR
      const { data: qr, error: qrError } = await supabase
        .from('qr_clientes')
        .select(
          `
          id,
          id_cliente,
          clientes!inner (
            id,
            nombre,
            email,
            puntos_totales,
            id_tienda
          )
        `,
        )
        .eq('codigo', registrarDto.codigoQr)
        .eq('activo', true)
        .eq('clientes.id_tienda', tiendaId) // ← Importante: verificar que el cliente pertenece a esta tienda
        .single();

      if (qrError || !qr || !qr.clientes) {
        throw new BadRequestException(
          'Código QR no válido, inactivo, o no pertenece a esta tienda',
        );
      }

      cliente = qr.clientes as any;
      clienteId = cliente.id;
    }

    // 2. Validar y procesar cupón si se proporciona
    let descuentoAplicado = 0;
    let cuponUsado: any = null;
    let importeFinal = registrarDto.importe;

    if (registrarDto.cuponId) {
      // Buscar el cupón
      const { data: cupon, error: cuponError } = await supabase
        .from('canjes')
        .select(
          `
          id,
          id_cliente,
          id_promocion,
          puntos_usados,
          estado,
          fecha_expiracion,
          promociones (
            id,
            titulo,
            tipo,
            valor,
            id_tienda
          )
        `,
        )
        .eq('id', registrarDto.cuponId)
        .single();

      if (cuponError || !cupon) {
        throw new BadRequestException('Cupón no encontrado');
      }

      // Validar que el cupón pertenece al cliente
      if (cupon.id_cliente !== clienteId) {
        throw new BadRequestException('Este cupón no pertenece al cliente');
      }

      // Extraer promoción (Supabase lo devuelve como objeto, no array)
      const promo = cupon.promociones as any;

      // Validar que el cupón pertenece a la tienda
      if (promo?.id_tienda !== tiendaId) {
        throw new BadRequestException('Este cupón no pertenece a esta tienda');
      }

      // Validar que el cupón está pendiente
      if (cupon.estado !== 'pendiente') {
        throw new BadRequestException(
          `Este cupón ya fue ${cupon.estado === 'usado' ? 'utilizado' : cupon.estado}`,
        );
      }

      // Validar que no ha expirado
      if (cupon.fecha_expiracion && new Date(cupon.fecha_expiracion) < new Date()) {
        throw new BadRequestException('Este cupón ha expirado');
      }

      // Calcular descuento según el tipo de promoción
      if (promo.tipo === 'descuento_fijo') {
        descuentoAplicado = Math.min(promo.valor, registrarDto.importe);
      } else if (promo.tipo === 'descuento_porcentaje') {
        descuentoAplicado = (registrarDto.importe * promo.valor) / 100;
      }

      importeFinal = Math.max(0, registrarDto.importe - descuentoAplicado);
      cuponUsado = cupon;
    }

    // 3. Calcular puntos a otorgar usando la configuración del TENANT
    // Los puntos se calculan sobre el importe final (después del descuento)
    const puntosPorEuro = tenant.configuracion.puntos_por_euro || 1;
    const puntosOtorgados = Math.floor(importeFinal * puntosPorEuro);

    // 4. Insertar la compra
    const notasConDescuento = registrarDto.notas || '';
    const promoUsada = cuponUsado ? (cuponUsado.promociones as any) : null;
    const notasFinales = cuponUsado
      ? `${notasConDescuento}${notasConDescuento ? ' | ' : ''}Cupón aplicado: ${promoUsada.titulo} (-${descuentoAplicado.toFixed(2)}€)`
      : notasConDescuento;

    const { data: compra, error: compraError } = await supabase
      .from('compras')
      .insert({
        id_cliente: clienteId,
        id_tienda: tiendaId,
        importe: importeFinal, // Guardamos el importe final después del descuento
        puntos_otorgados: puntosOtorgados,
        notas: notasFinales,
      })
      .select()
      .single();

    if (compraError || !compra) {
      console.error('Error al registrar compra:', compraError);
      throw new Error('No se pudo registrar la compra');
    }

    // 5. Si se usó un cupón, marcarlo como usado
    if (cuponUsado) {
      const { error: cuponUpdateError } = await supabase
        .from('canjes')
        .update({
          estado: 'usado',
          fecha_uso: new Date().toISOString(),
        })
        .eq('id', cuponUsado.id);

      if (cuponUpdateError) {
        console.error('Error al marcar cupón como usado:', cuponUpdateError);
        // No lanzamos error aquí porque la compra ya se registró
      }
    }

    // 4. Actualizar puntos totales y última visita del cliente
    const nuevosPuntosTotales = cliente.puntos_totales + puntosOtorgados;

    const { error: updateError } = await supabase
      .from('clientes')
      .update({
        puntos_totales: nuevosPuntosTotales,
        ultima_visita: new Date().toISOString(),
      })
      .eq('id', clienteId);

    if (updateError) {
      console.error('Error al actualizar puntos del cliente:', updateError);
      // Nota: La compra ya se registró, pero no se actualizaron los puntos
      // En producción, considera usar transacciones o mecanismos de retry
    }

    // 6. Consultar si se otorgó algún sello en esta compra (para el email)
    let selloInfo: {
      sellosGanados: number;
      programaNombre: string;
      sellosActuales: number;
      sellosObjetivo: number;
      tarjetaCompletada: boolean;
    } | null = null;

    try {
      // Buscar sellos otorgados en esta compra
      const { data: sellosOtorgados } = await supabase
        .from('sellos_otorgados')
        .select(`
          id,
          id_tarjeta,
          tarjetas_sellos_clientes!inner (
            id,
            sellos_actuales,
            sellos_objetivo,
            estado,
            programas_sellos!inner (
              nombre
            )
          )
        `)
        .eq('id_compra', compra.id)
        .order('fecha_otorgado', { ascending: false })
        .limit(1);

      if (sellosOtorgados && sellosOtorgados.length > 0) {
        const sello = sellosOtorgados[0];
        const tarjeta = sello.tarjetas_sellos_clientes as any;
        const programa = tarjeta.programas_sellos;

        selloInfo = {
          sellosGanados: 1, // Por ahora otorgamos 1 sello por compra
          programaNombre: programa.nombre,
          sellosActuales: tarjeta.sellos_actuales,
          sellosObjetivo: tarjeta.sellos_objetivo,
          tarjetaCompletada: tarjeta.estado === 'completada',
        };
      }
    } catch (error) {
      console.error('Error al consultar información de sellos para el email:', error);
      // No fallar si hay error consultando sellos
    }

    // 7. Obtener URL de Google Reviews de la tienda (si está configurada)
    let googleReviewsUrl: string | null = null;
    try {
      const { data: tiendaData } = await supabase
        .from('tiendas')
        .select('google_reviews_url')
        .eq('id', tiendaId)
        .single();

      googleReviewsUrl = tiendaData?.google_reviews_url || null;
    } catch (error) {
      console.error('Error al obtener google_reviews_url:', error);
    }

    // 8. Enviar email de agradecimiento
    // Esto se hace de forma asíncrona sin bloquear la respuesta
    this.emailService.sendPurchaseThankYouEmail({
      clienteEmail: cliente.email,
      clienteNombre: cliente.nombre,
      tiendaNombre: tenant.nombre,
      importeCompra: parseFloat(compra.importe),
      puntosGanados: puntosOtorgados,
      ...(selloInfo && {
        sellosGanados: selloInfo.sellosGanados,
        programaSelloNombre: selloInfo.programaNombre,
        sellosActuales: selloInfo.sellosActuales,
        sellosObjetivo: selloInfo.sellosObjetivo,
        tarjetaCompletada: selloInfo.tarjetaCompletada,
      }),
      googleReviewsUrl: googleReviewsUrl || undefined,
    }).catch(error => {
      console.error('Error al enviar email de agradecimiento:', error);
      // No fallar la compra si el email falla
    });

    // 9. Devolver respuesta
    return {
      compra_id: compra.id,
      cliente: {
        id: clienteId,
        nombre: cliente.nombre,
        email: cliente.email,
      },
      importe: parseFloat(compra.importe),
      descuento_aplicado: cuponUsado ? descuentoAplicado : undefined,
      cupon_usado: cuponUsado
        ? {
            id: cuponUsado.id,
            titulo: promoUsada.titulo,
          }
        : undefined,
      puntos_otorgados: puntosOtorgados,
      puntos_totales_cliente: nuevosPuntosTotales,
      fecha: compra.fecha,
    };
  }

  /**
   * Obtiene el historial de compras de una tienda con filtros y paginación
   */
  async getComprasByTienda(tiendaId: string, queryDto: ListComprasDto) {
    const supabase = this.supabaseService.getAdminClient();

    const page = parseInt(queryDto.page || '1');
    const limit = parseInt(queryDto.limit || '20');
    const offset = (page - 1) * limit;
    const orderBy = queryDto.orderBy || 'fecha';
    const order = queryDto.order || 'desc';

    // Construir query base
    let query = supabase
      .from('compras')
      .select(
        `
        id,
        fecha,
        importe,
        puntos_otorgados,
        notas,
        clientes (
          id,
          nombre,
          email,
          telefono
        )
      `,
        { count: 'exact' },
      )
      .eq('id_tienda', tiendaId);

    // Filtro por cliente
    if (queryDto.clienteId) {
      query = query.eq('id_cliente', queryDto.clienteId);
    }

    // Filtro por rango de fechas
    if (queryDto.fechaDesde) {
      query = query.gte('fecha', queryDto.fechaDesde);
    }
    if (queryDto.fechaHasta) {
      query = query.lte('fecha', queryDto.fechaHasta);
    }

    // Aplicar ordenamiento
    query = query.order(orderBy, { ascending: order === 'asc' });

    // Aplicar paginación
    query = query.range(offset, offset + limit - 1);

    const { data: compras, error, count } = await query;

    if (error) {
      console.error('Error al obtener compras:', error);
      throw new Error('No se pudieron obtener las compras');
    }

    return {
      data: (compras || []).map((c) => ({
        id: c.id,
        fecha: c.fecha,
        importe: parseFloat(c.importe),
        puntos_otorgados: c.puntos_otorgados,
        notas: c.notas,
        cliente: c.clientes,
      })),
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  /**
   * Actualiza una compra existente (solo importe y notas)
   * Si se modifica el importe, recalcula los puntos automáticamente
   */
  async updateCompra(
    tiendaId: string,
    compraId: string,
    updateDto: UpdateCompraDto,
    puntosPorEuro: number,
  ) {
    const supabase = this.supabaseService.getAdminClient();

    // 1. Verificar que la compra existe y pertenece a la tienda
    const { data: compraExistente, error: compraError } = await supabase
      .from('compras')
      .select(
        `
        id,
        id_cliente,
        id_tienda,
        importe,
        puntos_otorgados,
        notas,
        clientes (
          id,
          puntos_totales
        )
      `,
      )
      .eq('id', compraId)
      .eq('id_tienda', tiendaId)
      .single();

    if (compraError || !compraExistente) {
      throw new NotFoundException('Compra no encontrada o no pertenece a esta tienda');
    }

    // 2. Preparar datos de actualización
    const updateData: any = {};
    let diferenciaPuntos = 0;

    // Si se actualiza el importe, recalcular puntos
    if (
      updateDto.importe !== undefined &&
      updateDto.importe !== parseFloat(compraExistente.importe)
    ) {
      const nuevosPuntosOtorgados = Math.floor(updateDto.importe * puntosPorEuro);
      const puntosAnteriores = compraExistente.puntos_otorgados;

      diferenciaPuntos = nuevosPuntosOtorgados - puntosAnteriores;

      updateData.importe = updateDto.importe;
      updateData.puntos_otorgados = nuevosPuntosOtorgados;
    }

    // Si se actualizan las notas
    if (updateDto.notas !== undefined) {
      updateData.notas = updateDto.notas;
    }

    // Si no hay nada que actualizar
    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No se proporcionaron cambios para actualizar');
    }

    // 3. Actualizar la compra
    const { data: compraActualizada, error: updateError } = await supabase
      .from('compras')
      .update(updateData)
      .eq('id', compraId)
      .select()
      .single();

    if (updateError) {
      console.error('Error al actualizar compra:', updateError);
      throw new Error('No se pudo actualizar la compra');
    }

    // 4. Si cambió el importe, actualizar puntos totales del cliente
    if (diferenciaPuntos !== 0) {
      const clienteData = compraExistente.clientes as any;
      const nuevosPuntosTotales = clienteData.puntos_totales + diferenciaPuntos;

      const { error: clienteUpdateError } = await supabase
        .from('clientes')
        .update({ puntos_totales: nuevosPuntosTotales })
        .eq('id', compraExistente.id_cliente);

      if (clienteUpdateError) {
        console.error('Error al actualizar puntos del cliente:', clienteUpdateError);
      }
    }

    return {
      success: true,
      message: 'Compra actualizada exitosamente',
      compra: {
        id: compraActualizada.id,
        importe: parseFloat(compraActualizada.importe),
        puntos_otorgados: compraActualizada.puntos_otorgados,
        notas: compraActualizada.notas,
        diferencia_puntos: diferenciaPuntos,
      },
    };
  }

  /**
   * Elimina una compra (soft delete)
   * - Resta los puntos otorgados del cliente
   * - Si había un cupón usado, NO lo revalida (el cupón ya fue consumido)
   */
  async deleteCompra(tiendaId: string, compraId: string) {
    const supabase = this.supabaseService.getAdminClient();

    // 1. Verificar que la compra existe y pertenece a la tienda
    const { data: compra, error: compraError } = await supabase
      .from('compras')
      .select(
        `
        id,
        id_cliente,
        id_tienda,
        importe,
        puntos_otorgados,
        notas,
        fecha,
        clientes (
          id,
          nombre,
          puntos_totales
        )
      `,
      )
      .eq('id', compraId)
      .eq('id_tienda', tiendaId)
      .single();

    if (compraError || !compra) {
      throw new NotFoundException('Compra no encontrada o no pertenece a esta tienda');
    }

    const clienteData = compra.clientes as any;
    const puntosARestar = compra.puntos_otorgados;

    // 2. Eliminar la compra (hard delete - puedes cambiarlo a soft delete si prefieres)
    const { error: deleteError } = await supabase.from('compras').delete().eq('id', compraId);

    if (deleteError) {
      console.error('Error al eliminar compra:', deleteError);
      throw new Error('No se pudo eliminar la compra');
    }

    // 3. Restar puntos del cliente
    const nuevosPuntosTotales = Math.max(0, clienteData.puntos_totales - puntosARestar);

    const { error: clienteUpdateError } = await supabase
      .from('clientes')
      .update({ puntos_totales: nuevosPuntosTotales })
      .eq('id', compra.id_cliente);

    if (clienteUpdateError) {
      console.error('Error al actualizar puntos del cliente:', clienteUpdateError);
    }

    // 4. Si había un cupón usado en esta compra, marcarlo como cancelado
    // (Buscamos en las notas si menciona "Cupón aplicado:")
    if (compra.notas && compra.notas.includes('Cupón aplicado:')) {
      // Buscar cupones usados en esta fecha para este cliente
      const { data: canjes } = await supabase
        .from('canjes')
        .select('id, estado, fecha_uso')
        .eq('id_cliente', compra.id_cliente)
        .eq('estado', 'usado')
        .gte('fecha_uso', new Date(new Date(compra.fecha).getTime() - 60000).toISOString()) // 1 min antes
        .lte('fecha_uso', new Date(new Date(compra.fecha).getTime() + 60000).toISOString()); // 1 min después

      if (canjes && canjes.length > 0) {
        // Marcar el primer cupón encontrado como cancelado
        await supabase.from('canjes').update({ estado: 'cancelado' }).eq('id', canjes[0].id);
      }
    }

    return {
      success: true,
      message: 'Compra eliminada exitosamente',
      puntos_restados: puntosARestar,
      cliente: {
        id: clienteData.id,
        nombre: clienteData.nombre,
        puntos_totales_nuevos: nuevosPuntosTotales,
      },
    };
  }
}
