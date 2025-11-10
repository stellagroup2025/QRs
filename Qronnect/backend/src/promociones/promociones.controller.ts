import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { PromocionesService } from './promociones.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { ClientAuthGuard } from '../auth/guards/client-auth.guard';
import { CurrentTienda } from '../auth/decorators/current-tienda.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';
import { PromocionResponseDto, ListPromocionesDto } from './dto/promocion-response.dto';
import { CanjearPromocionDto, CanjeResponseDto } from './dto/canjear-promocion.dto';
import { ValidarCanjeDto, ValidarCanjeResponseDto } from './dto/validar-canje.dto';

/**
 * Controlador para gestión de promociones
 * Endpoints para Admin y para Clientes
 */
@ApiTags('Promociones')
@Controller()
export class PromocionesController {
  constructor(private readonly promocionesService: PromocionesService) {}

  // ============================================
  // ENDPOINTS PARA ADMIN
  // ============================================

  /**
   * GET /api/admin/promociones
   * Listar todas las promociones de la tienda
   */
  @Get('admin/promociones')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Listar promociones (Admin)',
    description: 'Obtiene todas las promociones de la tienda con paginación',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Lista de promociones', type: ListPromocionesDto })
  async findAll(
    @CurrentTienda() tiendaId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ListPromocionesDto> {
    return this.promocionesService.findAll(tiendaId, page || 1, limit || 20);
  }

  /**
   * GET /api/admin/promociones/:id
   * Obtener una promoción específica
   */
  @Get('admin/promociones/:id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Obtener promoción por ID (Admin)',
    description: 'Obtiene los detalles de una promoción específica',
  })
  @ApiParam({ name: 'id', description: 'ID de la promoción' })
  @ApiResponse({ status: 200, description: 'Promoción encontrada', type: PromocionResponseDto })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  async findOne(
    @CurrentTienda() tiendaId: string,
    @Param('id') id: string,
  ): Promise<PromocionResponseDto> {
    return this.promocionesService.findOne(tiendaId, id);
  }

  /**
   * POST /api/admin/promociones
   * Crear una nueva promoción
   */
  @Post('admin/promociones')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Crear promoción (Admin)',
    description: 'Crea una nueva promoción para la tienda',
  })
  @ApiResponse({ status: 201, description: 'Promoción creada', type: PromocionResponseDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(
    @CurrentTienda() tiendaId: string,
    @Body() createDto: CreatePromocionDto,
  ): Promise<PromocionResponseDto> {
    return this.promocionesService.create(tiendaId, createDto);
  }

  /**
   * PUT /api/admin/promociones/:id
   * Actualizar una promoción existente
   */
  @Put('admin/promociones/:id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Actualizar promoción (Admin)',
    description: 'Actualiza los datos de una promoción existente',
  })
  @ApiParam({ name: 'id', description: 'ID de la promoción' })
  @ApiResponse({ status: 200, description: 'Promoción actualizada', type: PromocionResponseDto })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  async update(
    @CurrentTienda() tiendaId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdatePromocionDto,
  ): Promise<PromocionResponseDto> {
    return this.promocionesService.update(tiendaId, id, updateDto);
  }

  /**
   * DELETE /api/admin/promociones/:id
   * Eliminar una promoción
   */
  @Delete('admin/promociones/:id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Eliminar promoción (Admin)',
    description: 'Elimina una promoción (solo si no tiene canjes pendientes)',
  })
  @ApiParam({ name: 'id', description: 'ID de la promoción' })
  @ApiResponse({ status: 200, description: 'Promoción eliminada' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar (tiene canjes pendientes)' })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  async remove(
    @CurrentTienda() tiendaId: string,
    @Param('id') id: string,
  ): Promise<{ mensaje: string }> {
    return this.promocionesService.remove(tiendaId, id);
  }

  /**
   * POST /api/admin/canjes/validar
   * Validar un canje escaneando el código
   */
  @Post('admin/canjes/validar')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Validar canje (Admin)',
    description: 'Valida un cupón canjeado por un cliente usando el código del canje',
  })
  @ApiResponse({ status: 200, description: 'Canje validado exitosamente', type: ValidarCanjeResponseDto })
  @ApiResponse({ status: 400, description: 'Cupón ya usado, expirado o cancelado' })
  @ApiResponse({ status: 404, description: 'Código de canje no encontrado' })
  async validarCanje(
    @CurrentTienda() tiendaId: string,
    @CurrentUser('id') adminId: string,
    @Body() validarDto: ValidarCanjeDto,
  ): Promise<ValidarCanjeResponseDto> {
    return this.promocionesService.validarCanje(tiendaId, adminId, validarDto);
  }

  // ============================================
  // ENDPOINTS PARA CLIENTES
  // ============================================

  /**
   * GET /api/clientes/promociones
   * Listar promociones disponibles para canjear
   */
  @Get('clientes/promociones')
  @UseGuards(ClientAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Listar promociones disponibles (Cliente)',
    description: 'Obtiene las promociones activas y disponibles para canjear',
  })
  @ApiResponse({ status: 200, description: 'Promociones disponibles', type: [PromocionResponseDto] })
  async getPromocionesDisponibles(
    @CurrentTienda() tiendaId: string,
  ): Promise<PromocionResponseDto[]> {
    return this.promocionesService.findAvailableForClientes(tiendaId);
  }

  /**
   * POST /api/clientes/promociones/canjear
   * Canjear una promoción por puntos
   */
  @Post('clientes/promociones/canjear')
  @UseGuards(ClientAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Canjear promoción (Cliente)',
    description: 'Canjea una promoción usando los puntos acumulados del cliente',
  })
  @ApiResponse({ status: 201, description: 'Promoción canjeada exitosamente', type: CanjeResponseDto })
  @ApiResponse({ status: 400, description: 'Puntos insuficientes o promoción no disponible' })
  @ApiResponse({ status: 404, description: 'Promoción no encontrada' })
  async canjearPromocion(
    @CurrentTienda() tiendaId: string,
    @CurrentUser('id') clienteId: string,
    @Body() canjearDto: CanjearPromocionDto,
  ): Promise<CanjeResponseDto> {
    return this.promocionesService.canjear(tiendaId, clienteId, canjearDto);
  }

  /**
   * GET /api/clientes/mis-canjes
   * Obtener los canjes del cliente
   */
  @Get('clientes/mis-canjes')
  @UseGuards(ClientAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Mis canjes (Cliente)',
    description: 'Obtiene el historial de canjes del cliente',
  })
  @ApiResponse({ status: 200, description: 'Lista de canjes del cliente' })
  async getMisCanjes(
    @CurrentTienda() tiendaId: string,
    @CurrentUser('id') clienteId: string,
  ): Promise<any[]> {
    return this.promocionesService.getMisCanjes(tiendaId, clienteId);
  }
}
