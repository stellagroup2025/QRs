import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { TenantContext } from '../tenant/entities/tenant-context.entity';
import { RegistrarCompraDto } from './dto/registrar-compra.dto';
import { CompraResponseDto } from './dto/compra-response.dto';
import { ListComprasDto } from '../admin/dto/list-compras.dto';

@Injectable()
export class ComprasService {
  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
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
      throw new BadRequestException(
        'Debes proporcionar codigoQr o clienteId',
      );
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
        throw new BadRequestException(
          'Cliente no encontrado o no pertenece a esta tienda',
        );
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

    // 2. Calcular puntos a otorgar usando la configuración del TENANT
    const puntosPorEuro = tenant.configuracion.puntos_por_euro || 1;
    const puntosOtorgados = Math.floor(registrarDto.importe * puntosPorEuro);

    // 3. Insertar la compra
    const { data: compra, error: compraError } = await supabase
      .from('compras')
      .insert({
        id_cliente: clienteId,
        id_tienda: tiendaId,
        importe: registrarDto.importe,
        puntos_otorgados: puntosOtorgados,
        notas: registrarDto.notas,
      })
      .select()
      .single();

    if (compraError || !compra) {
      console.error('Error al registrar compra:', compraError);
      throw new Error('No se pudo registrar la compra');
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

    // 5. Devolver respuesta
    return {
      compra_id: compra.id,
      cliente: {
        id: clienteId,
        nombre: cliente.nombre,
        email: cliente.email,
      },
      importe: parseFloat(compra.importe),
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
        { count: 'exact' }
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
}
