import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { DashboardResumenDto } from './dto/dashboard-resumen.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { ListClientesDto } from './dto/list-clientes.dto';
import { AnalyticsDto, AnalyticsQueryDto, DataPoint, TopCliente, RangoPuntos } from './dto/analytics.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private supabaseService: SupabaseService) {}

  /**
   * Login de administrador de tienda
   * Valida email + PIN de 4 dígitos
   */
  async login(tenantId: string, loginDto: LoginAdminDto): Promise<{
    access_token: string;
    tienda: any;
    admin: any;
  }> {
    const supabase = this.supabaseService.getAdminClient();

    console.log('🔍 [ADMIN LOGIN DEBUG]');
    console.log('  - Email:', loginDto.email);
    console.log('  - PIN recibido:', loginDto.pin);
    console.log('  - Tenant ID:', tenantId);

    // Buscar admin por email y tienda
    const { data: admin, error: adminError } = await supabase
      .from('admin_users')
      .select(`
        *,
        tienda:tiendas(*)
      `)
      .eq('email', loginDto.email)
      .eq('id_tienda', tenantId)
      .eq('activo', true)
      .single();

    console.log('  - Admin encontrado:', admin ? 'SÍ' : 'NO');
    console.log('  - Error de búsqueda:', adminError);
    if (admin) {
      console.log('  - Tienda:', admin.tienda?.nombre);
      console.log('  - PIN hash en BD:', admin.pin_hash);
    }

    if (adminError || !admin) {
      throw new UnauthorizedException('Email o PIN incorrecto');
    }

    // Verificar PIN
    const pinValido = await bcrypt.compare(loginDto.pin, admin.pin_hash);
    if (!pinValido) {
      throw new UnauthorizedException('Email o PIN incorrecto');
    }

    // Verificar que la tienda esté activa
    if (!admin.tienda || !admin.tienda.activo) {
      throw new UnauthorizedException('Tienda no disponible');
    }

    // Actualizar último acceso
    await supabase
      .from('admin_users')
      .update({ ultimo_acceso: new Date().toISOString() })
      .eq('id', admin.id);

    // Generar token (desarrollo)
    const access_token = Buffer.from(JSON.stringify({
      sub: admin.id,
      tienda_id: admin.id_tienda,
      email: admin.email,
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 8), // 8 horas
    })).toString('base64');

    return {
      access_token,
      tienda: admin.tienda,
      admin: {
        id: admin.id,
        nombre: admin.nombre,
        email: admin.email,
      },
    };
  }

  /**
   * Obtiene la lista de clientes de una tienda con sus estadísticas
   */
  async getClientes(tiendaId: string, queryDto: ListClientesDto) {
    const supabase = this.supabaseService.getAdminClient();

    const page = parseInt(queryDto.page || '1');
    const limit = parseInt(queryDto.limit || '20');
    const offset = (page - 1) * limit;
    const search = queryDto.search?.trim();
    const orderBy = queryDto.orderBy || 'fecha_registro';
    const order = queryDto.order || 'desc';

    // Construir query base - incluir el código QR del cliente y fecha_nacimiento
    let query = supabase
      .from('clientes')
      .select(
        `
        id,
        nombre,
        email,
        telefono,
        fecha_nacimiento,
        genero,
        puntos_totales,
        fecha_registro,
        ultima_visita,
        qr_clientes(codigo, activo)
      `,
        { count: 'exact' }
      )
      .eq('id_tienda', tiendaId)
      .eq('activo', true);

    // Aplicar búsqueda si existe
    if (search) {
      query = query.or(`nombre.ilike.%${search}%,email.ilike.%${search}%,telefono.ilike.%${search}%`);
    }

    // Aplicar ordenamiento
    query = query.order(orderBy, { ascending: order === 'asc' });

    // Aplicar paginación
    query = query.range(offset, offset + limit - 1);

    const { data: clientes, error, count } = await query;

    if (error) {
      console.error('Error al obtener clientes:', error);
      throw new Error('No se pudieron obtener los clientes');
    }

    // Para cada cliente, obtener estadísticas de compras y extraer el código QR
    const clientesConStats = await Promise.all(
      (clientes || []).map(async (cliente: any) => {
        // Obtener compras del cliente para calcular estadísticas
        const { data: compras } = await supabase
          .from('compras')
          .select('importe, fecha')
          .eq('id_cliente', cliente.id)
          .order('fecha', { ascending: false });

        const numCompras = compras?.length || 0;
        const ticketMedio = numCompras > 0
          ? compras.reduce((sum, c) => sum + parseFloat(c.importe), 0) / numCompras
          : 0;

        // Calcular días desde última visita
        let diasDesdeUltimaVisita = null;
        if (cliente.ultima_visita) {
          const ultimaVisita = new Date(cliente.ultima_visita);
          const hoy = new Date();
          const diffMs = hoy.getTime() - ultimaVisita.getTime();
          diasDesdeUltimaVisita = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        }

        // Extraer el código QR activo de la relación (si existe)
        const qrActivo = cliente.qr_clientes?.find((qr: any) => qr.activo === true);
        const codigoQr = qrActivo?.codigo || null;

        return {
          id: cliente.id,
          nombre: cliente.nombre,
          email: cliente.email,
          telefono: cliente.telefono,
          fecha_nacimiento: cliente.fecha_nacimiento,
          genero: cliente.genero,
          puntos_totales: cliente.puntos_totales,
          fecha_registro: cliente.fecha_registro,
          ultima_visita: cliente.ultima_visita,
          total_compras: numCompras,
          ticket_medio: Math.round(ticketMedio * 100) / 100, // Redondear a 2 decimales
          num_compras: numCompras,
          dias_desde_ultima_visita: diasDesdeUltimaVisita,
          codigo_qr: codigoQr,
        };
      }),
    );

    return {
      data: clientesConStats,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  /**
   * Obtiene el detalle completo de un cliente con su historial de compras
   */
  async getClienteDetalle(tiendaId: string, clienteId: string) {
    const supabase = this.supabaseService.getAdminClient();

    // Obtener datos del cliente
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', clienteId)
      .eq('id_tienda', tiendaId)
      .eq('activo', true)
      .single();

    if (clienteError || !cliente) {
      throw new BadRequestException('Cliente no encontrado');
    }

    // Obtener historial de compras con paginación
    const { data: compras, error: comprasError, count: totalCompras } = await supabase
      .from('compras')
      .select('*', { count: 'exact' })
      .eq('id_cliente', clienteId)
      .order('fecha', { ascending: false })
      .limit(50);

    if (comprasError) {
      console.error('Error al obtener compras del cliente:', comprasError);
      throw new Error('No se pudo obtener el historial de compras');
    }

    // Calcular estadísticas
    const totalGastado = compras?.reduce((sum, c) => sum + parseFloat(c.importe), 0) || 0;
    const ticketMedio = (compras?.length || 0) > 0 ? totalGastado / (compras?.length || 1) : 0;

    return {
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        email: cliente.email,
        telefono: cliente.telefono,
        puntos_totales: cliente.puntos_totales,
        fecha_registro: cliente.fecha_registro,
        ultima_visita: cliente.ultima_visita,
      },
      estadisticas: {
        total_compras: totalCompras || 0,
        total_gastado: totalGastado,
        ticket_medio: ticketMedio,
      },
      historial_compras: compras || [],
    };
  }

  /**
   * Obtiene métricas resumidas para el dashboard de la tienda
   */
  async getDashboardResumen(tiendaId: string): Promise<DashboardResumenDto> {
    // Calcular directamente en lugar de usar la vista para asegurar precisión
    return this.calcularDashboardManual(tiendaId);
  }

  /**
   * Calcula el resumen del dashboard manualmente (fallback)
   */
  private async calcularDashboardManual(tiendaId: string): Promise<DashboardResumenDto> {
    const supabase = this.supabaseService.getAdminClient();

    // Total de clientes
    const { count: totalClientes } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .eq('id_tienda', tiendaId)
      .eq('activo', true);

    // Clientes activos últimos 30 días
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 30);

    const { count: clientesActivos } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true })
      .eq('id_tienda', tiendaId)
      .eq('activo', true)
      .gte('ultima_visita', fechaLimite.toISOString());

    // Compras totales
    const { data: compras } = await supabase
      .from('compras')
      .select('importe, puntos_otorgados')
      .eq('id_tienda', tiendaId);

    const totalCompras = compras?.length || 0;
    const ventasTotales =
      compras?.reduce((sum, c) => sum + parseFloat(c.importe), 0) || 0;
    const puntosOtorgados =
      compras?.reduce((sum, c) => sum + c.puntos_otorgados, 0) || 0;
    const ticketMedio = totalCompras > 0 ? ventasTotales / totalCompras : 0;

    return {
      total_clientes: totalClientes || 0,
      clientes_activos_ultimos_30_dias: clientesActivos || 0,
      total_compras: totalCompras,
      ventas_totales: ventasTotales,
      ticket_medio: ticketMedio,
      puntos_otorgados_totales: puntosOtorgados,
    };
  }

  /**
   * Obtiene analytics avanzadas del dashboard
   */
  async getAnalytics(tiendaId: string, queryDto: AnalyticsQueryDto): Promise<AnalyticsDto> {
    const supabase = this.supabaseService.getAdminClient();

    // Calcular días según el periodo
    const dias = queryDto.periodo === '7d' ? 7 : queryDto.periodo === '30d' ? 30 : 90;

    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);

    const fechaInicioPeriodoAnterior = new Date();
    fechaInicioPeriodoAnterior.setDate(fechaInicioPeriodoAnterior.getDate() - (dias * 2));

    // 1. Evolución de clientes nuevos por día
    const { data: clientesData } = await supabase
      .from('clientes')
      .select('fecha_registro')
      .eq('id_tienda', tiendaId)
      .eq('activo', true)
      .gte('fecha_registro', fechaInicio.toISOString())
      .order('fecha_registro', { ascending: true });

    const evolucionClientes = this.agruparPorFecha(clientesData || [], 'fecha_registro', dias);

    // 2. Evolución de facturación por día
    const { data: comprasData } = await supabase
      .from('compras')
      .select('fecha, importe')
      .eq('id_tienda', tiendaId)
      .gte('fecha', fechaInicio.toISOString())
      .order('fecha', { ascending: true });

    const evolucionFacturacion = this.agruparFacturacionPorFecha(comprasData || [], dias);

    // 3. Distribución de clientes por rango de puntos
    const { data: clientes } = await supabase
      .from('clientes')
      .select('puntos_totales')
      .eq('id_tienda', tiendaId)
      .eq('activo', true);

    const distribucionPuntos = this.calcularDistribucionPuntos(clientes || []);

    // 4. Top 10 clientes por facturación
    const topClientes = await this.getTopClientes(tiendaId);

    // 5. Tasa de retención (% de clientes que han comprado más de una vez)
    const { count: clientesConCompras } = await supabase
      .from('clientes')
      .select('id', { count: 'exact', head: true })
      .eq('id_tienda', tiendaId)
      .eq('activo', true)
      .gt('puntos_totales', 0);

    const { count: clientesConMasDeUnaCompra } = await supabase
      .from('clientes')
      .select('id, compras!inner(id)', { count: 'exact', head: true })
      .eq('id_tienda', tiendaId)
      .eq('activo', true);

    const tasaRetencion = clientesConCompras > 0
      ? ((clientesConMasDeUnaCompra || 0) / clientesConCompras) * 100
      : 0;

    // 6. Frecuencia de visita promedio
    const frecuenciaVisita = await this.calcularFrecuenciaVisita(tiendaId);

    // 7. Calcular cambios porcentuales vs periodo anterior
    const { data: clientesPeriodoActual } = await supabase
      .from('clientes')
      .select('id', { count: 'exact', head: true })
      .eq('id_tienda', tiendaId)
      .eq('activo', true)
      .gte('fecha_registro', fechaInicio.toISOString());

    const { data: clientesPeriodoAnterior } = await supabase
      .from('clientes')
      .select('id', { count: 'exact', head: true })
      .eq('id_tienda', tiendaId)
      .eq('activo', true)
      .gte('fecha_registro', fechaInicioPeriodoAnterior.toISOString())
      .lt('fecha_registro', fechaInicio.toISOString());

    const cambioClientesPct = this.calcularCambioPorcentual(
      clientesPeriodoActual?.length || 0,
      clientesPeriodoAnterior?.length || 0
    );

    const { data: comprasPeriodoActual } = await supabase
      .from('compras')
      .select('importe')
      .eq('id_tienda', tiendaId)
      .gte('fecha', fechaInicio.toISOString());

    const { data: comprasPeriodoAnterior } = await supabase
      .from('compras')
      .select('importe')
      .eq('id_tienda', tiendaId)
      .gte('fecha', fechaInicioPeriodoAnterior.toISOString())
      .lt('fecha', fechaInicio.toISOString());

    const facturacionActual = comprasPeriodoActual?.reduce((sum, c) => sum + parseFloat(c.importe), 0) || 0;
    const facturacionAnterior = comprasPeriodoAnterior?.reduce((sum, c) => sum + parseFloat(c.importe), 0) || 0;

    const cambioFacturacionPct = this.calcularCambioPorcentual(facturacionActual, facturacionAnterior);

    const ticketMedioActual = comprasPeriodoActual?.length > 0 ? facturacionActual / comprasPeriodoActual.length : 0;
    const ticketMedioAnterior = comprasPeriodoAnterior?.length > 0 ? facturacionAnterior / comprasPeriodoAnterior.length : 0;

    const cambioTicketMedioPct = this.calcularCambioPorcentual(ticketMedioActual, ticketMedioAnterior);

    return {
      evolucion_clientes: evolucionClientes,
      evolucion_facturacion: evolucionFacturacion,
      distribucion_puntos: distribucionPuntos,
      top_clientes: topClientes,
      tasa_retencion: Math.round(tasaRetencion * 10) / 10,
      frecuencia_visita_promedio: Math.round(frecuenciaVisita * 10) / 10,
      cambio_clientes_pct: Math.round(cambioClientesPct * 10) / 10,
      cambio_facturacion_pct: Math.round(cambioFacturacionPct * 10) / 10,
      cambio_ticket_medio_pct: Math.round(cambioTicketMedioPct * 10) / 10,
    };
  }

  /**
   * Agrupa registros por fecha
   */
  private agruparPorFecha(data: any[], campoFecha: string, dias: number): DataPoint[] {
    const resultado: { [fecha: string]: number } = {};

    // Inicializar todos los días con 0
    for (let i = 0; i < dias; i++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - (dias - i - 1));
      const fechaStr = fecha.toISOString().split('T')[0];
      resultado[fechaStr] = 0;
    }

    // Contar registros por día
    data.forEach(item => {
      const fecha = new Date(item[campoFecha]).toISOString().split('T')[0];
      if (resultado.hasOwnProperty(fecha)) {
        resultado[fecha]++;
      }
    });

    return Object.entries(resultado).map(([fecha, valor]) => ({
      fecha,
      valor,
    }));
  }

  /**
   * Agrupa facturación por fecha
   */
  private agruparFacturacionPorFecha(compras: any[], dias: number): DataPoint[] {
    const resultado: { [fecha: string]: number } = {};

    // Inicializar todos los días con 0
    for (let i = 0; i < dias; i++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - (dias - i - 1));
      const fechaStr = fecha.toISOString().split('T')[0];
      resultado[fechaStr] = 0;
    }

    // Sumar facturación por día
    compras.forEach(compra => {
      const fecha = new Date(compra.fecha).toISOString().split('T')[0];
      if (resultado.hasOwnProperty(fecha)) {
        resultado[fecha] += parseFloat(compra.importe);
      }
    });

    return Object.entries(resultado).map(([fecha, valor]) => ({
      fecha,
      valor: Math.round(valor * 100) / 100,
    }));
  }

  /**
   * Calcula la distribución de clientes por rangos de puntos
   */
  private calcularDistribucionPuntos(clientes: any[]): RangoPuntos[] {
    const rangos = [
      { min: 0, max: 50, label: '0-50 puntos', color: '#94a3b8' },
      { min: 51, max: 100, label: '51-100 puntos', color: '#60a5fa' },
      { min: 101, max: 200, label: '101-200 puntos', color: '#34d399' },
      { min: 201, max: 500, label: '201-500 puntos', color: '#fbbf24' },
      { min: 501, max: 999999, label: '500+ puntos', color: '#f87171' },
    ];

    return rangos.map(rango => ({
      rango: rango.label,
      clientes: clientes.filter(c =>
        c.puntos_totales >= rango.min && c.puntos_totales <= rango.max
      ).length,
      color: rango.color,
    }));
  }

  /**
   * Obtiene el top 10 de clientes por facturación
   */
  private async getTopClientes(tiendaId: string): Promise<TopCliente[]> {
    const supabase = this.supabaseService.getAdminClient();

    const { data: clientes } = await supabase
      .from('clientes')
      .select('id, nombre, email, puntos_totales')
      .eq('id_tienda', tiendaId)
      .eq('activo', true);

    if (!clientes || clientes.length === 0) {
      return [];
    }

    // Para cada cliente, calcular su facturación total
    const clientesConGasto = await Promise.all(
      clientes.map(async (cliente) => {
        const { data: compras } = await supabase
          .from('compras')
          .select('importe')
          .eq('id_cliente', cliente.id);

        const totalGastado = compras?.reduce((sum, c) => sum + parseFloat(c.importe), 0) || 0;
        const numCompras = compras?.length || 0;

        return {
          id: cliente.id,
          nombre: cliente.nombre,
          email: cliente.email,
          total_gastado: totalGastado,
          num_compras: numCompras,
          puntos_totales: cliente.puntos_totales,
        };
      })
    );

    // Ordenar por total gastado y tomar los primeros 10
    return clientesConGasto
      .sort((a, b) => b.total_gastado - a.total_gastado)
      .slice(0, 10);
  }

  /**
   * Calcula la frecuencia promedio de visita en días
   */
  private async calcularFrecuenciaVisita(tiendaId: string): Promise<number> {
    const supabase = this.supabaseService.getAdminClient();

    // Obtener todos los clientes con más de una compra
    const { data: clientes } = await supabase
      .from('clientes')
      .select('id')
      .eq('id_tienda', tiendaId)
      .eq('activo', true);

    if (!clientes || clientes.length === 0) {
      return 0;
    }

    let totalDiasAcumulados = 0;
    let clientesConMasDeUnaCompra = 0;

    for (const cliente of clientes) {
      const { data: compras } = await supabase
        .from('compras')
        .select('fecha')
        .eq('id_cliente', cliente.id)
        .order('fecha', { ascending: true });

      if (compras && compras.length > 1) {
        // Calcular días entre compras consecutivas
        for (let i = 1; i < compras.length; i++) {
          const fecha1 = new Date(compras[i - 1].fecha);
          const fecha2 = new Date(compras[i].fecha);
          const diasEntre = Math.abs(fecha2.getTime() - fecha1.getTime()) / (1000 * 60 * 60 * 24);
          totalDiasAcumulados += diasEntre;
        }
        clientesConMasDeUnaCompra++;
      }
    }

    return clientesConMasDeUnaCompra > 0
      ? totalDiasAcumulados / clientesConMasDeUnaCompra
      : 0;
  }

  /**
   * Calcula el cambio porcentual entre dos valores
   */
  private calcularCambioPorcentual(actual: number, anterior: number): number {
    if (anterior === 0) {
      return actual > 0 ? 100 : 0;
    }
    return ((actual - anterior) / anterior) * 100;
  }

  /**
   * Obtiene los puntos totales de un cliente
   */
  async getClientePuntos(tiendaId: string, clienteId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data: cliente, error } = await supabase
      .from('clientes')
      .select('puntos_totales')
      .eq('id', clienteId)
      .eq('id_tienda', tiendaId)
      .single();

    if (error || !cliente) {
      throw new BadRequestException('Cliente no encontrado');
    }

    return { puntos_totales: cliente.puntos_totales || 0 };
  }

  /**
   * Obtiene los cupones de un cliente con filtro opcional por estado
   */
  async getClienteCupones(tiendaId: string, clienteId: string, estado?: string) {
    const supabase = this.supabaseService.getAdminClient();

    let query = supabase
      .from('cupones')
      .select(`
        id,
        codigo,
        estado,
        fecha_canje,
        fecha_uso,
        fecha_expiracion,
        promocion:promociones(
          id,
          titulo,
          descripcion,
          tipo,
          valor
        )
      `)
      .eq('id_cliente', clienteId)
      .eq('id_tienda', tiendaId);

    if (estado) {
      query = query.eq('estado', estado);
    }

    const { data: cupones, error } = await query.order('fecha_canje', { ascending: false });

    if (error) {
      throw new BadRequestException('Error al obtener cupones');
    }

    return cupones || [];
  }

  /**
   * Obtiene todas las promociones disponibles de la tienda
   */
  async getPromocionesDisponibles(tiendaId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data: promociones, error } = await supabase
      .from('promociones')
      .select('*')
      .eq('id_tienda', tiendaId)
      .eq('disponible', true)
      .order('puntos_requeridos', { ascending: true });

    if (error) {
      throw new BadRequestException('Error al obtener promociones');
    }

    return promociones || [];
  }

  /**
   * Canjea una promoción para un cliente específico
   */
  async canjearPromocionParaCliente(tiendaId: string, clienteId: string, promocionId: string) {
    const supabase = this.supabaseService.getAdminClient();

    // Verificar que el cliente existe y obtener sus puntos
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('id, puntos_totales')
      .eq('id', clienteId)
      .eq('id_tienda', tiendaId)
      .single();

    if (clienteError || !cliente) {
      throw new BadRequestException('Cliente no encontrado');
    }

    // Verificar que la promoción existe y está disponible
    const { data: promocion, error: promocionError } = await supabase
      .from('promociones')
      .select('*')
      .eq('id', promocionId)
      .eq('id_tienda', tiendaId)
      .single();

    if (promocionError || !promocion) {
      throw new BadRequestException('Promoción no encontrada');
    }

    if (!promocion.disponible) {
      throw new BadRequestException('Promoción no disponible');
    }

    // Verificar que el cliente tiene suficientes puntos
    if (cliente.puntos_totales < promocion.puntos_requeridos) {
      throw new BadRequestException(
        `Puntos insuficientes. Necesita ${promocion.puntos_requeridos} puntos, tiene ${cliente.puntos_totales}`
      );
    }

    // Verificar cantidad disponible si aplica
    if (promocion.cantidad_disponible !== null) {
      if (promocion.cantidad_canjeada >= promocion.cantidad_disponible) {
        throw new BadRequestException('Promoción agotada');
      }
    }

    // Generar código único para el cupón
    const codigo = `${promocion.titulo.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

    // Crear el cupón
    const { data: cupon, error: cuponError } = await supabase
      .from('cupones')
      .insert({
        id_cliente: clienteId,
        id_promocion: promocionId,
        id_tienda: tiendaId,
        codigo,
        estado: 'activo',
        fecha_canje: new Date().toISOString(),
        fecha_expiracion: promocion.fecha_fin || null,
      })
      .select()
      .single();

    if (cuponError || !cupon) {
      throw new BadRequestException('Error al crear cupón');
    }

    // Descontar puntos del cliente
    const nuevosPuntos = cliente.puntos_totales - promocion.puntos_requeridos;
    const { error: updateClienteError } = await supabase
      .from('clientes')
      .update({ puntos_totales: nuevosPuntos })
      .eq('id', clienteId);

    if (updateClienteError) {
      // Revertir creación del cupón si falla la actualización
      await supabase.from('cupones').delete().eq('id', cupon.id);
      throw new BadRequestException('Error al descontar puntos');
    }

    // Incrementar cantidad canjeada de la promoción
    const { error: updatePromoError } = await supabase
      .from('promociones')
      .update({ cantidad_canjeada: promocion.cantidad_canjeada + 1 })
      .eq('id', promocionId);

    if (updatePromoError) {
      console.error('Error actualizando cantidad canjeada:', updatePromoError);
      // No revertimos porque el cupón ya se creó y los puntos se descontaron
    }

    return {
      ...cupon,
      promocion: {
        titulo: promocion.titulo,
        tipo: promocion.tipo,
        valor: promocion.valor,
      },
    };
  }
}
