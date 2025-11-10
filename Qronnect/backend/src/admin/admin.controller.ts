import { Controller, Get, Post, Body, UseGuards, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { ComprasService } from '../compras/compras.service';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { Tenant } from '../tenant/decorators/tenant.decorator';
import { CurrentTienda } from '../auth/decorators/current-tienda.decorator';
import { TenantContext } from '../tenant/entities/tenant-context.entity';
import { RegistrarCompraDto } from '../compras/dto/registrar-compra.dto';
import { CompraResponseDto } from '../compras/dto/compra-response.dto';
import { DashboardResumenDto } from './dto/dashboard-resumen.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { ListClientesDto } from './dto/list-clientes.dto';
import { ListComprasDto } from './dto/list-compras.dto';

/**
 * Controlador de endpoints para el panel de administración de tiendas
 * Algunos endpoints requieren autenticación + rol de admin/staff
 */
@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly comprasService: ComprasService,
  ) {}

  /**
   * POST /api/admin/auth/login
   * Login de administrador de tienda con email + PIN
   * Este endpoint NO requiere autenticación previa
   */
  @Post('auth/login')
  @ApiOperation({
    summary: 'Login de administrador de tienda',
    description: 'Autentica al administrador de la tienda usando email y PIN de 4 dígitos',
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso, devuelve token de acceso y datos de la tienda',
  })
  @ApiResponse({ status: 401, description: 'Email o PIN incorrecto' })
  async login(
    @Tenant() tenant: TenantContext,
    @Body() loginDto: LoginAdminDto,
  ) {
    return this.adminService.login(tenant.id, loginDto);
  }

  /**
   * POST /api/admin/compras/registrar
   * Registra una nueva compra escaneando el QR del cliente
   *
   * MULTITENANCY: Usa la configuración del tenant para calcular puntos
   */
  @Post('compras/registrar')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Registrar una compra',
    description:
      'Registra una compra escaneando el código QR del cliente y otorga puntos automáticamente. ' +
      'Los puntos se calculan según la configuración de la tienda actual.',
  })
  @ApiResponse({
    status: 201,
    description: 'Compra registrada exitosamente',
    type: CompraResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Código QR inválido o no pertenece a esta tienda' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos de administrador' })
  async registrarCompra(
    @Tenant() tenant: TenantContext,
    @Body() registrarDto: RegistrarCompraDto,
  ): Promise<CompraResponseDto> {
    return this.comprasService.registrarCompra(tenant, registrarDto);
  }

  /**
   * GET /api/admin/clientes
   * Lista todos los clientes de la tienda con paginación, búsqueda y ordenamiento
   */
  @Get('clientes')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Listar clientes de la tienda',
    description: 'Obtiene la lista de clientes registrados con paginación, búsqueda por nombre/email/teléfono y ordenamiento.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página (empieza en 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20, description: 'Resultados por página' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por nombre, email o teléfono' })
  @ApiQuery({ name: 'orderBy', required: false, enum: ['puntos_totales', 'ultima_visita', 'fecha_registro'], example: 'fecha_registro', description: 'Campo para ordenar' })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], example: 'desc', description: 'Dirección del ordenamiento' })
  @ApiResponse({ status: 200, description: 'Lista de clientes paginada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos de administrador' })
  async getClientes(
    @CurrentTienda() tiendaId: string,
    @Query() queryDto: ListClientesDto,
  ) {
    return this.adminService.getClientes(tiendaId, queryDto);
  }

  /**
   * GET /api/admin/clientes/:id
   * Obtiene el detalle completo de un cliente
   */
  @Get('clientes/:id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Obtener detalle de cliente',
    description: 'Obtiene la información completa de un cliente incluyendo estadísticas y su historial de compras.',
  })
  @ApiResponse({ status: 200, description: 'Detalle del cliente' })
  @ApiResponse({ status: 400, description: 'Cliente no encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos de administrador' })
  async getClienteDetalle(
    @CurrentTienda() tiendaId: string,
    @Param('id') clienteId: string,
  ) {
    return this.adminService.getClienteDetalle(tiendaId, clienteId);
  }

  /**
   * GET /api/admin/compras
   * Lista todas las compras de la tienda con filtros y paginación
   */
  @Get('compras')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Listar compras de la tienda',
    description: 'Obtiene el historial de compras con filtros por cliente, rango de fechas, paginación y ordenamiento.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página (empieza en 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20, description: 'Resultados por página' })
  @ApiQuery({ name: 'clienteId', required: false, type: String, description: 'Filtrar por ID de cliente' })
  @ApiQuery({ name: 'fechaDesde', required: false, type: String, description: 'Fecha desde (ISO 8601)' })
  @ApiQuery({ name: 'fechaHasta', required: false, type: String, description: 'Fecha hasta (ISO 8601)' })
  @ApiQuery({ name: 'orderBy', required: false, enum: ['fecha', 'importe', 'puntos_otorgados'], example: 'fecha', description: 'Campo para ordenar' })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], example: 'desc', description: 'Dirección del ordenamiento' })
  @ApiResponse({ status: 200, description: 'Lista de compras paginada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos de administrador' })
  async getCompras(
    @CurrentTienda() tiendaId: string,
    @Query() queryDto: ListComprasDto,
  ) {
    return this.comprasService.getComprasByTienda(tiendaId, queryDto);
  }

  /**
   * GET /api/admin/dashboard/resumen
   * Obtiene métricas resumidas para el dashboard
   */
  @Get('dashboard/resumen')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Obtener resumen del dashboard',
    description:
      'Devuelve métricas clave de la tienda: total de clientes, compras, ticket medio, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen del dashboard',
    type: DashboardResumenDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos de administrador' })
  async getDashboardResumen(@CurrentTienda() tiendaId: string): Promise<DashboardResumenDto> {
    return this.adminService.getDashboardResumen(tiendaId);
  }

  /**
   * GET /api/admin/dashboard/analytics
   * Obtiene analytics avanzadas con gráficos y métricas
   */
  @Get('dashboard/analytics')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Obtener analytics del dashboard',
    description:
      'Devuelve datos para gráficos: evolución de facturación, nuevos clientes, distribución de puntos, top clientes, etc.',
  })
  @ApiQuery({ name: 'periodo', required: false, enum: ['7d', '30d', '90d'], example: '30d', description: 'Periodo de análisis' })
  @ApiResponse({
    status: 200,
    description: 'Analytics del dashboard',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Sin permisos de administrador' })
  async getAnalytics(
    @CurrentTienda() tiendaId: string,
    @Query() queryDto: any, // Usamos any temporalmente para evitar problemas de validación
  ) {
    return this.adminService.getAnalytics(tiendaId, { periodo: queryDto.periodo || '30d' });
  }

  /**
   * GET /api/admin/clientes/:id/puntos
   * Obtiene el total de puntos de un cliente
   */
  @Get('clientes/:id/puntos')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Obtener puntos de un cliente',
    description: 'Devuelve el total de puntos acumulados del cliente',
  })
  @ApiResponse({ status: 200, description: 'Puntos del cliente' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async getClientePuntos(
    @CurrentTienda() tiendaId: string,
    @Param('id') clienteId: string,
  ) {
    return this.adminService.getClientePuntos(tiendaId, clienteId);
  }

  /**
   * GET /api/admin/clientes/:id/cupones
   * Obtiene los cupones de un cliente con filtro por estado
   */
  @Get('clientes/:id/cupones')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Obtener cupones de un cliente',
    description: 'Devuelve los cupones del cliente filtrados por estado',
  })
  @ApiQuery({ name: 'estado', required: false, enum: ['activo', 'usado', 'expirado'], description: 'Filtrar por estado' })
  @ApiResponse({ status: 200, description: 'Cupones del cliente' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async getClienteCupones(
    @CurrentTienda() tiendaId: string,
    @Param('id') clienteId: string,
    @Query('estado') estado?: string,
  ) {
    return this.adminService.getClienteCupones(tiendaId, clienteId, estado);
  }

  /**
   * GET /api/admin/promociones/disponibles
   * Obtiene todas las promociones disponibles de la tienda
   */
  @Get('promociones/disponibles')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Obtener promociones disponibles',
    description: 'Devuelve todas las promociones activas y disponibles de la tienda',
  })
  @ApiResponse({ status: 200, description: 'Lista de promociones disponibles' })
  async getPromocionesDisponibles(
    @CurrentTienda() tiendaId: string,
  ) {
    return this.adminService.getPromocionesDisponibles(tiendaId);
  }

  /**
   * POST /api/admin/clientes/:id/canjear-promocion
   * Canjea una promoción para un cliente específico
   */
  @Post('clientes/:id/canjear-promocion')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Canjear promoción para un cliente',
    description: 'Canjea una promoción utilizando los puntos del cliente y genera un cupón',
  })
  @ApiResponse({ status: 201, description: 'Promoción canjeada exitosamente' })
  @ApiResponse({ status: 400, description: 'Puntos insuficientes o promoción no disponible' })
  @ApiResponse({ status: 404, description: 'Cliente o promoción no encontrado' })
  async canjearPromocion(
    @CurrentTienda() tiendaId: string,
    @Param('id') clienteId: string,
    @Body() body: { id_promocion: string },
  ) {
    return this.adminService.canjearPromocionParaCliente(tiendaId, clienteId, body.id_promocion);
  }

  /**
   * POST /api/admin/compras
   * Alias de /api/admin/compras/registrar para compatibilidad
   */
  @Post('compras')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Registrar una compra',
    description: 'Registra una nueva compra para un cliente',
  })
  @ApiResponse({ status: 201, description: 'Compra registrada exitosamente', type: CompraResponseDto })
  async registrarCompraAlias(
    @Tenant() tenant: TenantContext,
    @Body() registrarDto: RegistrarCompraDto,
  ): Promise<CompraResponseDto> {
    return this.comprasService.registrarCompra(tenant, registrarDto);
  }
}
