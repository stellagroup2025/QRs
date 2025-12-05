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
import { GachaService } from './gacha.service';
import { ConfigurarGachaDto } from './dto/configurar-gacha.dto';
import { CrearPremioGachaDto } from './dto/crear-premio-gacha.dto';
import { ActualizarPremioGachaDto } from './dto/actualizar-premio-gacha.dto';
import { CanjearPremioGachaDto } from './dto/canjear-premio-gacha.dto';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { ClientAuthGuard } from '../auth/guards/client-auth.guard';

@ApiTags('Gacha - Sistema de Premios Aleatorios')
@Controller('gacha')
@ApiBearerAuth()
export class GachaController {
  constructor(private readonly gachaService: GachaService) {}

  // ============================================
  // CONFIGURACIÓN (Admin)
  // ============================================

  @UseGuards(AdminAuthGuard)
  @Get('config')
  @ApiOperation({ summary: 'Obtener configuración del gacha' })
  @ApiResponse({ status: 200, description: 'Configuración obtenida' })
  async obtenerConfiguracion(@Request() req) {
    const idTienda = req.user.tienda_id;
    return this.gachaService.obtenerConfiguracion(idTienda);
  }

  @UseGuards(AdminAuthGuard)
  @Put('config')
  @ApiOperation({ summary: 'Configurar sistema gacha' })
  @ApiResponse({ status: 200, description: 'Configuración actualizada' })
  async configurarGacha(@Request() req, @Body() dto: ConfigurarGachaDto) {
    const idTienda = req.user.tienda_id;
    return this.gachaService.configurarGacha(idTienda, dto);
  }

  // ============================================
  // PREMIOS (Admin)
  // ============================================

  @UseGuards(AdminAuthGuard)
  @Get('premios')
  @ApiOperation({ summary: 'Obtener todos los premios del gacha' })
  @ApiQuery({ name: 'solo_activos', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de premios' })
  async obtenerPremios(@Request() req, @Query('solo_activos') soloActivos?: string) {
    const idTienda = req.user.tienda_id;
    return this.gachaService.obtenerPremios(idTienda, soloActivos === 'true');
  }

  @UseGuards(AdminAuthGuard)
  @Post('premios')
  @ApiOperation({ summary: 'Crear un nuevo premio' })
  @ApiResponse({ status: 201, description: 'Premio creado' })
  async crearPremio(@Request() req, @Body() dto: CrearPremioGachaDto) {
    const idTienda = req.user.tienda_id;
    return this.gachaService.crearPremio(idTienda, dto);
  }

  @UseGuards(AdminAuthGuard)
  @Put('premios/:id')
  @ApiOperation({ summary: 'Actualizar un premio' })
  @ApiResponse({ status: 200, description: 'Premio actualizado' })
  async actualizarPremio(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ActualizarPremioGachaDto,
  ) {
    const idTienda = req.user.tienda_id;
    return this.gachaService.actualizarPremio(id, idTienda, dto);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('premios/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar (desactivar) un premio' })
  @ApiResponse({ status: 204, description: 'Premio eliminado' })
  async eliminarPremio(@Request() req, @Param('id') id: string) {
    const idTienda = req.user.tienda_id;
    await this.gachaService.eliminarPremio(id, idTienda);
  }

  // ============================================
  // JUGAR GACHA (Cliente)
  // ============================================

  @UseGuards(ClientAuthGuard)
  @Post('tirar')
  @ApiOperation({ summary: 'Realizar una tirada del gacha' })
  @ApiResponse({ status: 200, description: 'Premio ganado' })
  @ApiResponse({ status: 400, description: 'Error (puntos insuficientes, límite alcanzado, etc.)' })
  async realizarTirada(@Request() req) {
    const idCliente = req.user.id;
    const idTienda = req.user.tienda_id;
    return this.gachaService.realizarTirada(idTienda, idCliente);
  }

  @UseGuards(ClientAuthGuard)
  @Get('mis-premios')
  @ApiOperation({ summary: 'Obtener mis premios ganados' })
  @ApiResponse({ status: 200, description: 'Lista de premios ganados' })
  async obtenerMisPremios(@Request() req) {
    const idCliente = req.user.id;
    const idTienda = req.user.tienda_id;
    return this.gachaService.obtenerMisPremios(idCliente, idTienda);
  }

  @UseGuards(ClientAuthGuard)
  @Get('verificar-puntos')
  @ApiOperation({ summary: 'Verificar si tengo puntos suficientes para jugar' })
  @ApiResponse({ status: 200, description: 'Información de puntos' })
  async verificarPuntos(@Request() req) {
    const idCliente = req.user.id;
    const idTienda = req.user.tienda_id;
    return this.gachaService.verificarPuntosSuficientes(idCliente, idTienda);
  }

  @UseGuards(ClientAuthGuard)
  @Get('info')
  @ApiOperation({ summary: 'Obtener información del gacha (para clientes)' })
  @ApiResponse({ status: 200, description: 'Información del gacha' })
  async obtenerInfoGacha(@Request() req) {
    const idTienda = req.user.tienda_id;
    return this.gachaService.obtenerConfiguracion(idTienda);
  }

  // ============================================
  // CANJEAR PREMIOS (Staff/Admin)
  // ============================================

  @UseGuards(AdminAuthGuard)
  @Post('canjear')
  @ApiOperation({ summary: 'Canjear un premio ganado por código' })
  @ApiResponse({ status: 200, description: 'Premio canjeado' })
  @ApiResponse({ status: 404, description: 'Código no válido' })
  async canjearPremio(@Request() req, @Body() dto: CanjearPremioGachaDto) {
    const idTienda = req.user.tienda_id;
    const idUsuarioStaff = req.user.superadmin_access ? null : req.user.id;
    return this.gachaService.canjearPremio(idTienda, idUsuarioStaff, dto);
  }

  @UseGuards(AdminAuthGuard)
  @Get('verificar-codigo/:codigo')
  @ApiOperation({ summary: 'Verificar un código de premio sin canjearlo' })
  @ApiResponse({ status: 200, description: 'Información del premio' })
  @ApiResponse({ status: 404, description: 'Código no válido' })
  async verificarCodigo(@Request() req, @Param('codigo') codigo: string) {
    const idTienda = req.user.tienda_id;
    return this.gachaService.verificarCodigo(codigo, idTienda);
  }

  // ============================================
  // ESTADÍSTICAS (Admin)
  // ============================================

  @UseGuards(AdminAuthGuard)
  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas del gacha' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas' })
  async obtenerEstadisticas(@Request() req) {
    const idTienda = req.user.tienda_id;
    return this.gachaService.obtenerEstadisticas(idTienda);
  }
}
