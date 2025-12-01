import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RegalosService } from './regalos.service';
import { ClientAuthGuard } from '../auth/guards/client-auth.guard';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';

/**
 * Controlador de regalos y cupones
 */
@ApiTags('Regalos y Cupones')
@Controller('regalos')
export class RegalosController {
  constructor(private readonly regalosService: RegalosService) {}

  // ============================================
  // ENDPOINTS PÚBLICOS (Sin autenticación)
  // ============================================

  /**
   * Obtiene el catálogo de regalos de una tienda (público)
   * Útil para mostrar los regalos en landing page
   */
  @Get('catalogo/tienda/:tiendaId')
  @ApiOperation({ summary: 'Obtener catálogo de regalos de una tienda (público)' })
  async getCatalogoPublico(
    @Param('tiendaId') tiendaId: string,
    @Query('soloActivos') soloActivos?: string,
  ) {
    const activos = soloActivos === 'false' ? false : true;
    return this.regalosService.getCatalogo(tiendaId, activos);
  }

  /**
   * Obtiene los milestones de referidos de una tienda (público)
   * Para mostrar progreso en /mis-referidos sin login
   */
  @Get('milestones/:tiendaId')
  @ApiOperation({ summary: 'Obtener milestones de referidos de una tienda' })
  async getMilestones(@Param('tiendaId') tiendaId: string) {
    return this.regalosService.getMilestones(tiendaId);
  }

  // ============================================
  // ENDPOINTS DE CLIENTES (Requieren auth de cliente)
  // ============================================

  /**
   * Obtiene los cupones del cliente autenticado
   */
  @Get('mis-cupones')
  @UseGuards(ClientAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener cupones del cliente' })
  async getMisCupones(@Req() req: any, @Query('soloDisponibles') soloDisponibles?: string) {
    const clienteId = req.user?.id;
    if (!clienteId) {
      throw new BadRequestException('Cliente no identificado');
    }

    const disponibles = soloDisponibles === 'true' ? true : false;
    return this.regalosService.getCuponesCliente(clienteId, disponibles);
  }

  /**
   * Marca un cupón como visto por el cliente
   */
  @Put('cupones/:cuponId/marcar-visto')
  @UseGuards(ClientAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar cupón como visto' })
  async marcarCuponVisto(@Param('cuponId') cuponId: string, @Req() req: any) {
    // Verificar que el cupón pertenece al cliente
    const cupones = await this.regalosService.getCuponesCliente(req.user.id, false);
    const cupon = cupones.find((c) => c.id === cuponId);

    if (!cupon) {
      throw new BadRequestException('Cupón no encontrado');
    }

    await this.regalosService.marcarCuponVisto(cuponId);
    return { mensaje: 'Cupón marcado como visto' };
  }

  /**
   * Obtiene milestones alcanzados por el cliente
   */
  @Get('mis-milestones')
  @UseGuards(ClientAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener milestones alcanzados del cliente' })
  async getMisMilestonesAlcanzados(@Req() req: any) {
    const clienteId = req.user?.id;
    if (!clienteId) {
      throw new BadRequestException('Cliente no identificado');
    }

    return this.regalosService.getMilestonesAlcanzados(clienteId);
  }

  /**
   * Verifica manualmente los milestones del cliente
   * (Normalmente se hace automáticamente vía trigger)
   */
  @Post('verificar-milestones')
  @UseGuards(ClientAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar milestones del cliente' })
  async verificarMilestones(@Req() req: any) {
    const clienteId = req.user?.id;
    if (!clienteId) {
      throw new BadRequestException('Cliente no identificado');
    }

    return this.regalosService.verificarMilestonesCliente(clienteId);
  }

  // ============================================
  // ENDPOINTS DE ADMINISTRACIÓN (Requieren auth de admin)
  // ============================================

  /**
   * Obtiene el catálogo de regalos de la tienda del admin autenticado
   */
  @Get('catalogo')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener catálogo de regalos (Admin)' })
  async getCatalogoAdmin(@Req() req: any, @Query('soloActivos') soloActivos?: string) {
    const tiendaId = req.user?.id_tienda;
    if (!tiendaId) {
      throw new BadRequestException('Admin sin tienda asignada');
    }

    const activos = soloActivos === 'false' ? false : true;
    return this.regalosService.getCatalogo(tiendaId, activos);
  }

  /**
   * Crea un nuevo regalo en el catálogo
   */
  @Post('catalogo')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear regalo en catálogo (Admin)' })
  async crearRegalo(@Req() req: any, @Body() regaloData: any) {
    const tiendaId = req.user?.id_tienda;
    if (!tiendaId) {
      throw new BadRequestException('Admin sin tienda asignada');
    }

    return this.regalosService.crearRegalo(tiendaId, regaloData);
  }

  /**
   * Crea un nuevo milestone de referidos
   */
  @Post('milestones')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear milestone de referidos (Admin)' })
  async crearMilestone(@Req() req: any, @Body() milestoneData: any) {
    const tiendaId = req.user?.id_tienda;
    if (!tiendaId) {
      throw new BadRequestException('Admin sin tienda asignada');
    }

    return this.regalosService.crearMilestone(tiendaId, milestoneData);
  }

  /**
   * Otorga un regalo manualmente a un cliente (por admin)
   */
  @Post('otorgar')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Otorgar regalo manualmente (Admin)' })
  async otorgarRegalo(
    @Body()
    body: {
      clienteId: string;
      regaloId: string;
      origen: 'bienvenida' | 'referido' | 'milestone' | 'promocion' | 'manual';
      origenDetalles?: any;
    },
  ) {
    return this.regalosService.otorgarRegalo(body);
  }

  /**
   * Marca un cupón como usado (validación en tienda por staff)
   */
  @Put('cupones/:cuponId/marcar-usado')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar cupón como usado (Admin/Staff)' })
  async marcarCuponUsado(@Param('cuponId') cuponId: string, @Req() req: any) {
    const usuarioStaffId = req.user?.id;
    if (!usuarioStaffId) {
      throw new BadRequestException('Usuario no identificado');
    }

    return this.regalosService.marcarCuponUsado(cuponId, usuarioStaffId);
  }

  /**
   * Reenvía email con cupón a un cliente
   */
  @Post('cupones/:cuponId/reenviar-email')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reenviar email de cupón (Admin)' })
  async reenviarEmailCupon(@Param('cuponId') cuponId: string) {
    await this.regalosService.enviarEmailCupon(cuponId);
    return { mensaje: 'Email enviado' };
  }
}
