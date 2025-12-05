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
  Request,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SellosService } from './sellos.service';
import { CreateProgramaSellosDto } from './dto/create-programa-sellos.dto';
import { UpdateProgramaSellosDto } from './dto/update-programa-sellos.dto';
import { OtorgarSelloDto } from './dto/otorgar-sello.dto';
import { CanjearCuponSelloDto } from './dto/canjear-cupon-sello.dto';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { ClientAuthGuard } from '../auth/guards/client-auth.guard';

@ApiTags('Sellos')
@Controller('sellos')
@ApiBearerAuth()
export class SellosController {
  constructor(private readonly sellosService: SellosService) {}

  // ============================================
  // PROGRAMAS DE SELLOS (Admin)
  // ============================================

  @UseGuards(AdminAuthGuard)
  @Post('programas')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Crear un nuevo programa de sellos' })
  @ApiResponse({ status: 201, description: 'Programa creado exitosamente' })
  async crearPrograma(
    @Request() req,
    @Body() createDto: CreateProgramaSellosDto,
  ) {
    const idTienda = req.user.tienda_id;
    return this.sellosService.crearPrograma(idTienda, createDto);
  }

  @UseGuards(AdminAuthGuard)
  @Get('programas')
  @ApiOperation({ summary: 'Obtener todos los programas de sellos' })
  @ApiQuery({ name: 'solo_activos', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de programas' })
  async obtenerProgramas(
    @Request() req,
    @Query('solo_activos') soloActivos?: string | boolean,
  ) {
    const idTienda = req.user.tienda_id;
    return this.sellosService.obtenerProgramas(
      idTienda,
      soloActivos === true || soloActivos === 'true',
    );
  }

  @UseGuards(AdminAuthGuard)
  @Get('programas/:id')
  @ApiOperation({ summary: 'Obtener un programa de sellos por ID' })
  @ApiResponse({ status: 200, description: 'Programa encontrado' })
  @ApiResponse({ status: 404, description: 'Programa no encontrado' })
  async obtenerPrograma(@Request() req, @Param('id') id: string) {
    const idTienda = req.user.tienda_id;
    return this.sellosService.obtenerPrograma(id, idTienda);
  }

  @UseGuards(AdminAuthGuard)
  @Put('programas/:id')
  @ApiOperation({ summary: 'Actualizar un programa de sellos' })
  @ApiResponse({ status: 200, description: 'Programa actualizado' })
  @ApiResponse({ status: 404, description: 'Programa no encontrado' })
  async actualizarPrograma(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateProgramaSellosDto,
  ) {
    const idTienda = req.user.tienda_id;
    return this.sellosService.actualizarPrograma(id, idTienda, updateDto);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('programas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar (desactivar) un programa de sellos' })
  @ApiResponse({ status: 204, description: 'Programa eliminado' })
  async eliminarPrograma(@Request() req, @Param('id') id: string) {
    const idTienda = req.user.tienda_id;
    await this.sellosService.eliminarPrograma(id, idTienda);
  }

  @UseGuards(AdminAuthGuard)
  @Get('programas/:id/estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas de un programa' })
  @ApiResponse({ status: 200, description: 'Estadísticas del programa' })
  async obtenerEstadisticasPrograma(@Request() req, @Param('id') id: string) {
    const idTienda = req.user.tienda_id;
    // Primero verificar que existe
    await this.sellosService.obtenerPrograma(id, idTienda);

    // Luego obtener todas las estadísticas y filtrar
    const estadisticas = await this.sellosService.obtenerEstadisticas(idTienda);
    return estadisticas.find((e) => e.programa_id === id) || null;
  }

  // ============================================
  // OTORGAR SELLOS (Staff/Admin)
  // ============================================

  @UseGuards(AdminAuthGuard)
  @Post('otorgar')
  @ApiOperation({ summary: 'Otorgar un sello a un cliente' })
  @ApiResponse({ status: 201, description: 'Sello otorgado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al otorgar sello' })
  async otorgarSello(@Request() req, @Body() otorgarDto: OtorgarSelloDto) {
    const idTienda = req.user.tienda_id;
    // Si es superadmin, no pasar el ID (será NULL)
    // Si es admin normal, pasar el ID del usuario
    const idUsuarioStaff = req.user.superadmin_access ? null : req.user.id;
    return this.sellosService.otorgarSello(idTienda, idUsuarioStaff, otorgarDto);
  }

  // ============================================
  // CANJEAR CUPONES (Staff/Admin)
  // ============================================

  @UseGuards(AdminAuthGuard)
  @Post('canjear')
  @ApiOperation({ summary: 'Canjear un cupón de sello completado' })
  @ApiResponse({ status: 200, description: 'Cupón canjeado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al canjear cupón' })
  @ApiResponse({ status: 404, description: 'Cupón no encontrado' })
  async canjearCupon(
    @Request() req,
    @Body() canjearDto: CanjearCuponSelloDto,
  ) {
    const idTienda = req.user.tienda_id;
    // Si es superadmin, no pasar el ID (será NULL)
    const idUsuarioStaff = req.user.superadmin_access ? null : req.user.id;
    return this.sellosService.canjearCupon(idTienda, idUsuarioStaff, canjearDto);
  }

  @UseGuards(AdminAuthGuard)
  @Get('verificar-cupon/:codigo')
  @ApiOperation({ summary: 'Verificar un cupón sin canjearlo' })
  @ApiResponse({ status: 200, description: 'Información del cupón' })
  @ApiResponse({ status: 404, description: 'Cupón no encontrado' })
  async verificarCupon(@Request() req, @Param('codigo') codigo: string) {
    const idTienda = req.user.tienda_id;
    return this.sellosService.verificarCupon(codigo, idTienda);
  }

  // ============================================
  // TARJETAS DE CLIENTES
  // ============================================

  @UseGuards(AdminAuthGuard)
  @Post('clientes/:idCliente/inicializar')
  @ApiOperation({ summary: 'Inicializar tarjetas de sellos para un cliente' })
  @ApiResponse({ status: 201, description: 'Tarjetas inicializadas' })
  async inicializarTarjetasCliente(
    @Request() req,
    @Param('idCliente') idCliente: string,
  ) {
    const idTienda = req.user.tienda_id;
    return this.sellosService.inicializarTarjetasCliente(idCliente, idTienda);
  }

  @UseGuards(AdminAuthGuard)
  @Get('clientes/:idCliente/tarjetas')
  @ApiOperation({ summary: 'Obtener tarjetas de sellos de un cliente' })
  @ApiQuery({ name: 'solo_activas', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de tarjetas del cliente' })
  async obtenerTarjetasCliente(
    @Request() req,
    @Param('idCliente') idCliente: string,
    @Query('solo_activas') soloActivas?: string | boolean,
  ) {
    const idTienda = req.user.tienda_id;
    return this.sellosService.obtenerTarjetasCliente(
      idCliente,
      idTienda,
      soloActivas === true || soloActivas === 'true',
    );
  }

  @UseGuards(AdminAuthGuard)
  @Get('tarjetas')
  @ApiOperation({ summary: 'Obtener todas las tarjetas de la tienda (dashboard admin)' })
  @ApiQuery({ name: 'estado', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de tarjetas' })
  async obtenerTarjetasTienda(
    @Request() req,
    @Query('estado') estado?: string,
  ) {
    const idTienda = req.user.tienda_id;
    return this.sellosService.obtenerTarjetasTienda(idTienda, estado);
  }

  @UseGuards(AdminAuthGuard)
  @Get('tarjetas/:id')
  @ApiOperation({ summary: 'Obtener detalle de una tarjeta específica' })
  @ApiResponse({ status: 200, description: 'Detalle de la tarjeta' })
  @ApiResponse({ status: 404, description: 'Tarjeta no encontrada' })
  async obtenerDetalleTarjeta(@Request() req, @Param('id') id: string) {
    const idTienda = req.user.tienda_id;
    return this.sellosService.obtenerDetalleTarjeta(id, idTienda);
  }

  @UseGuards(AdminAuthGuard)
  @Get('tarjetas/:id/sellos')
  @ApiOperation({ summary: 'Obtener todos los sellos de una tarjeta' })
  @ApiResponse({ status: 200, description: 'Lista de sellos' })
  async obtenerSellosTarjeta(@Request() req, @Param('id') id: string) {
    const idTienda = req.user.tienda_id;
    return this.sellosService.obtenerSellosTarjeta(id, idTienda);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('tarjetas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancelar una tarjeta de sellos' })
  @ApiResponse({ status: 204, description: 'Tarjeta cancelada' })
  async cancelarTarjeta(@Request() req, @Param('id') id: string) {
    const idTienda = req.user.tienda_id;
    await this.sellosService.cancelarTarjeta(id, idTienda);
  }

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  @UseGuards(AdminAuthGuard)
  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas de todos los programas de sellos' })
  @ApiResponse({ status: 200, description: 'Estadísticas generales' })
  async obtenerEstadisticas(@Request() req) {
    const idTienda = req.user.tienda_id;
    return this.sellosService.obtenerEstadisticas(idTienda);
  }

  // ============================================
  // ENDPOINTS PÚBLICOS PARA CLIENTES
  // ============================================

  @UseGuards(ClientAuthGuard)
  @Get('mis-tarjetas')
  @ApiOperation({ summary: 'Obtener mis tarjetas de sellos (cliente)' })
  @ApiQuery({ name: 'solo_activas', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de tarjetas del cliente' })
  async obtenerMisTarjetas(
    @Request() req,
    @Query('solo_activas') soloActivas?: string | boolean,
  ) {
    const idCliente = req.user.id;
    const idTienda = req.user.tienda_id;
    return this.sellosService.obtenerTarjetasCliente(
      idCliente,
      idTienda,
      soloActivas === true || soloActivas === 'true',
    );
  }

  @UseGuards(ClientAuthGuard)
  @Get('mis-programas')
  @ApiOperation({ summary: 'Obtener programas de sellos disponibles (cliente)' })
  @ApiResponse({ status: 200, description: 'Lista de programas activos' })
  async obtenerProgramasDisponibles(@Request() req) {
    const idTienda = req.user.tienda_id;
    return this.sellosService.obtenerProgramas(idTienda, true);
  }

  @UseGuards(ClientAuthGuard)
  @Get('mi-tarjeta/:id')
  @ApiOperation({ summary: 'Obtener detalle de una de mis tarjetas (cliente)' })
  @ApiResponse({ status: 200, description: 'Detalle de la tarjeta' })
  @ApiResponse({ status: 404, description: 'Tarjeta no encontrada' })
  async obtenerDetalleMiTarjeta(@Request() req, @Param('id') id: string) {
    const idTienda = req.user.tienda_id;
    const idCliente = req.user.id;

    // Obtener la tarjeta y verificar que pertenece al cliente
    const tarjeta = await this.sellosService.obtenerDetalleTarjeta(id, idTienda);

    if (tarjeta.id_cliente !== idCliente) {
      throw new NotFoundException('Tarjeta no encontrada');
    }

    return tarjeta;
  }

  @UseGuards(ClientAuthGuard)
  @Get('mi-tarjeta/:id/sellos')
  @ApiOperation({ summary: 'Obtener sellos de una de mis tarjetas (cliente)' })
  @ApiResponse({ status: 200, description: 'Lista de sellos' })
  async obtenerSellosMiTarjeta(@Request() req, @Param('id') id: string) {
    const idTienda = req.user.tienda_id;
    const idCliente = req.user.id;

    // Verificar que la tarjeta pertenece al cliente
    const tarjeta = await this.sellosService.obtenerDetalleTarjeta(id, idTienda);

    if (tarjeta.id_cliente !== idCliente) {
      throw new NotFoundException('Tarjeta no encontrada');
    }

    return this.sellosService.obtenerSellosTarjeta(id, idTienda);
  }

  @UseGuards(ClientAuthGuard)
  @Post('inicializar-mis-tarjetas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inicializar mis tarjetas de sellos (cliente)' })
  @ApiResponse({ status: 200, description: 'Tarjetas inicializadas' })
  @ApiResponse({ status: 400, description: 'Error al inicializar tarjetas' })
  async inicializarMisTarjetas(@Request() req) {
    try {
      const idCliente = req.user.id;
      const idTienda = req.user.tienda_id;

      console.log('🎯 Inicializando tarjetas para cliente:', { idCliente, idTienda });

      const resultado = await this.sellosService.inicializarTarjetasCliente(idCliente, idTienda);

      console.log('✅ Tarjetas inicializadas:', resultado);

      return resultado;
    } catch (error) {
      console.error('❌ Error al inicializar tarjetas:', error);
      throw error;
    }
  }
}
