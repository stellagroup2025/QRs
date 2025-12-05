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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SellosService } from './sellos.service';
import { CreateProgramaSellosDto } from './dto/create-programa-sellos.dto';
import { UpdateProgramaSellosDto } from './dto/update-programa-sellos.dto';
import { OtorgarSelloDto } from './dto/otorgar-sello.dto';
import { CanjearCuponSelloDto } from './dto/canjear-cupon-sello.dto';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';

@ApiTags('Sellos')
@Controller('sellos')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
export class SellosController {
  constructor(private readonly sellosService: SellosService) {}

  // ============================================
  // PROGRAMAS DE SELLOS (Admin)
  // ============================================

  @Post('programas')
  @ApiOperation({ summary: 'Crear un nuevo programa de sellos' })
  @ApiResponse({ status: 201, description: 'Programa creado exitosamente' })
  async crearPrograma(
    @Request() req,
    @Body() createDto: CreateProgramaSellosDto,
  ) {
    const idTienda = req.user.id_tienda;
    return this.sellosService.crearPrograma(idTienda, createDto);
  }

  @Get('programas')
  @ApiOperation({ summary: 'Obtener todos los programas de sellos' })
  @ApiQuery({ name: 'solo_activos', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de programas' })
  async obtenerProgramas(
    @Request() req,
    @Query('solo_activos') soloActivos?: string | boolean,
  ) {
    const idTienda = req.user.id_tienda;
    return this.sellosService.obtenerProgramas(
      idTienda,
      soloActivos === true || soloActivos === 'true',
    );
  }

  @Get('programas/:id')
  @ApiOperation({ summary: 'Obtener un programa de sellos por ID' })
  @ApiResponse({ status: 200, description: 'Programa encontrado' })
  @ApiResponse({ status: 404, description: 'Programa no encontrado' })
  async obtenerPrograma(@Request() req, @Param('id') id: string) {
    const idTienda = req.user.id_tienda;
    return this.sellosService.obtenerPrograma(id, idTienda);
  }

  @Put('programas/:id')
  @ApiOperation({ summary: 'Actualizar un programa de sellos' })
  @ApiResponse({ status: 200, description: 'Programa actualizado' })
  @ApiResponse({ status: 404, description: 'Programa no encontrado' })
  async actualizarPrograma(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateProgramaSellosDto,
  ) {
    const idTienda = req.user.id_tienda;
    return this.sellosService.actualizarPrograma(id, idTienda, updateDto);
  }

  @Delete('programas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar (desactivar) un programa de sellos' })
  @ApiResponse({ status: 204, description: 'Programa eliminado' })
  async eliminarPrograma(@Request() req, @Param('id') id: string) {
    const idTienda = req.user.id_tienda;
    await this.sellosService.eliminarPrograma(id, idTienda);
  }

  @Get('programas/:id/estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas de un programa' })
  @ApiResponse({ status: 200, description: 'Estadísticas del programa' })
  async obtenerEstadisticasPrograma(@Request() req, @Param('id') id: string) {
    const idTienda = req.user.id_tienda;
    // Primero verificar que existe
    await this.sellosService.obtenerPrograma(id, idTienda);

    // Luego obtener todas las estadísticas y filtrar
    const estadisticas = await this.sellosService.obtenerEstadisticas(idTienda);
    return estadisticas.find((e) => e.programa_id === id) || null;
  }

  // ============================================
  // OTORGAR SELLOS (Staff/Admin)
  // ============================================

  @Post('otorgar')
  @ApiOperation({ summary: 'Otorgar un sello a un cliente' })
  @ApiResponse({ status: 201, description: 'Sello otorgado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al otorgar sello' })
  async otorgarSello(@Request() req, @Body() otorgarDto: OtorgarSelloDto) {
    const idTienda = req.user.id_tienda;
    const idUsuarioStaff = req.user.id;
    return this.sellosService.otorgarSello(idTienda, idUsuarioStaff, otorgarDto);
  }

  // ============================================
  // CANJEAR CUPONES (Staff/Admin)
  // ============================================

  @Post('canjear')
  @ApiOperation({ summary: 'Canjear un cupón de sello completado' })
  @ApiResponse({ status: 200, description: 'Cupón canjeado exitosamente' })
  @ApiResponse({ status: 400, description: 'Error al canjear cupón' })
  @ApiResponse({ status: 404, description: 'Cupón no encontrado' })
  async canjearCupon(
    @Request() req,
    @Body() canjearDto: CanjearCuponSelloDto,
  ) {
    const idTienda = req.user.id_tienda;
    const idUsuarioStaff = req.user.id;
    return this.sellosService.canjearCupon(idTienda, idUsuarioStaff, canjearDto);
  }

  @Get('verificar-cupon/:codigo')
  @ApiOperation({ summary: 'Verificar un cupón sin canjearlo' })
  @ApiResponse({ status: 200, description: 'Información del cupón' })
  @ApiResponse({ status: 404, description: 'Cupón no encontrado' })
  async verificarCupon(@Request() req, @Param('codigo') codigo: string) {
    const idTienda = req.user.id_tienda;
    return this.sellosService.verificarCupon(codigo, idTienda);
  }

  // ============================================
  // TARJETAS DE CLIENTES
  // ============================================

  @Get('clientes/:idCliente/tarjetas')
  @ApiOperation({ summary: 'Obtener tarjetas de sellos de un cliente' })
  @ApiQuery({ name: 'solo_activas', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de tarjetas del cliente' })
  async obtenerTarjetasCliente(
    @Request() req,
    @Param('idCliente') idCliente: string,
    @Query('solo_activas') soloActivas?: string | boolean,
  ) {
    const idTienda = req.user.id_tienda;
    return this.sellosService.obtenerTarjetasCliente(
      idCliente,
      idTienda,
      soloActivas === true || soloActivas === 'true',
    );
  }

  @Get('tarjetas')
  @ApiOperation({ summary: 'Obtener todas las tarjetas de la tienda (dashboard admin)' })
  @ApiQuery({ name: 'estado', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de tarjetas' })
  async obtenerTarjetasTienda(
    @Request() req,
    @Query('estado') estado?: string,
  ) {
    const idTienda = req.user.id_tienda;
    return this.sellosService.obtenerTarjetasTienda(idTienda, estado);
  }

  @Get('tarjetas/:id')
  @ApiOperation({ summary: 'Obtener detalle de una tarjeta específica' })
  @ApiResponse({ status: 200, description: 'Detalle de la tarjeta' })
  @ApiResponse({ status: 404, description: 'Tarjeta no encontrada' })
  async obtenerDetalleTarjeta(@Request() req, @Param('id') id: string) {
    const idTienda = req.user.id_tienda;
    return this.sellosService.obtenerDetalleTarjeta(id, idTienda);
  }

  @Get('tarjetas/:id/sellos')
  @ApiOperation({ summary: 'Obtener todos los sellos de una tarjeta' })
  @ApiResponse({ status: 200, description: 'Lista de sellos' })
  async obtenerSellosTarjeta(@Request() req, @Param('id') id: string) {
    const idTienda = req.user.id_tienda;
    return this.sellosService.obtenerSellosTarjeta(id, idTienda);
  }

  @Delete('tarjetas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancelar una tarjeta de sellos' })
  @ApiResponse({ status: 204, description: 'Tarjeta cancelada' })
  async cancelarTarjeta(@Request() req, @Param('id') id: string) {
    const idTienda = req.user.id_tienda;
    await this.sellosService.cancelarTarjeta(id, idTienda);
  }

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas de todos los programas de sellos' })
  @ApiResponse({ status: 200, description: 'Estadísticas generales' })
  async obtenerEstadisticas(@Request() req) {
    const idTienda = req.user.id_tienda;
    return this.sellosService.obtenerEstadisticas(idTienda);
  }
}
