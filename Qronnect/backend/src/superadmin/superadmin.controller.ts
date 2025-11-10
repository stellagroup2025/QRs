import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SuperAdminService } from './superadmin.service';
import { SuperAdminGuard } from './guards/superadmin.guard';
import { SendEmailCodeDto } from './dto/send-email-code.dto';
import { VerifyEmailCodeDto } from './dto/verify-email-code.dto';
import { CreateTiendaDto } from './dto/create-tienda.dto';
import { UpdateTiendaDto } from './dto/update-tienda.dto';

@ApiTags('SuperAdmin')
@Controller('superadmin')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  // ========================================
  // AUTENTICACIÓN (100% GRATIS - EMAIL)
  // ========================================

  @Post('auth/send-email')
  @ApiOperation({
    summary: 'Enviar código de verificación por email (GRATIS)',
    description: 'Envía un código de 6 dígitos al email del superadmin para autenticación. No requiere configuración externa.',
  })
  @ApiResponse({ status: 200, description: 'Código enviado correctamente' })
  @ApiResponse({ status: 404, description: 'Email no autorizado' })
  async enviarEmail(@Body() body: SendEmailCodeDto) {
    return this.superAdminService.enviarCodigoEmail(body.email);
  }

  @Post('auth/verify-email')
  @ApiOperation({
    summary: 'Verificar código de email y obtener token de sesión',
    description: 'Verifica el código recibido por email y devuelve tokens de autenticación',
  })
  @ApiResponse({
    status: 200,
    description: 'Código verificado, sesión iniciada',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        superadmin: {
          id: 'uuid',
          nombre: 'Omar',
          email: 'tu@email.com',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Código inválido o expirado' })
  async verificarEmail(@Body() body: VerifyEmailCodeDto) {
    return this.superAdminService.verificarCodigoEmail(body.email, body.codigo);
  }

  // ========================================
  // DASHBOARD Y MÉTRICAS GLOBALES
  // ========================================

  @Get('dashboard')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener dashboard global del sistema',
    description: 'Retorna métricas generales: tiendas, clientes, compras, facturación',
  })
  @ApiResponse({ status: 200, description: 'Dashboard obtenido correctamente' })
  async getDashboard() {
    return this.superAdminService.getDashboard();
  }

  @Get('audit-logs')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener logs de auditoría',
    description: 'Retorna el registro de acciones realizadas por superadmins',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Número máximo de registros' })
  @ApiResponse({ status: 200, description: 'Logs obtenidos correctamente' })
  async getAuditLogs(@Query('limit') limit?: number) {
    return this.superAdminService.getAuditLogs(limit ? Number(limit) : 100);
  }

  // ========================================
  // GESTIÓN DE TIENDAS
  // ========================================

  @Get('tiendas')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar todas las tiendas',
    description: 'Retorna lista de todas las tiendas con sus estadísticas',
  })
  @ApiResponse({ status: 200, description: 'Tiendas obtenidas correctamente' })
  async listarTiendas() {
    return this.superAdminService.listarTiendas();
  }

  @Get('tiendas/:id')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener datos completos de una tienda',
    description: 'Retorna datos de la tienda, clientes, compras y estadísticas',
  })
  @ApiParam({ name: 'id', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Datos de la tienda obtenidos' })
  @ApiResponse({ status: 404, description: 'Tienda no encontrada' })
  async getTienda(@Param('id') id: string) {
    return this.superAdminService.getTienda(id);
  }

  @Post('tiendas')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear nueva tienda',
    description: 'Crea un nuevo comercio en el sistema con su dominio único',
  })
  @ApiResponse({ status: 201, description: 'Tienda creada correctamente' })
  @ApiResponse({ status: 409, description: 'El dominio ya existe' })
  async crearTienda(@Request() req, @Body() createDto: CreateTiendaDto) {
    return this.superAdminService.crearTienda(req.superadmin.id, createDto);
  }

  @Put('tiendas/:id')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar tienda existente',
    description: 'Actualiza la configuración y datos de una tienda',
  })
  @ApiParam({ name: 'id', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Tienda actualizada correctamente' })
  @ApiResponse({ status: 404, description: 'Tienda no encontrada' })
  async actualizarTienda(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateTiendaDto,
  ) {
    return this.superAdminService.actualizarTienda(req.superadmin.id, id, updateDto);
  }

  @Delete('tiendas/:id')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar tienda (desactivar)',
    description: 'Desactiva una tienda del sistema (soft delete)',
  })
  @ApiParam({ name: 'id', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Tienda desactivada correctamente' })
  @ApiResponse({ status: 404, description: 'Tienda no encontrada' })
  async eliminarTienda(@Request() req, @Param('id') id: string) {
    return this.superAdminService.eliminarTienda(req.superadmin.id, id);
  }

  // ========================================
  // ACCESO A DATOS DE TIENDAS
  // ========================================

  @Get('tiendas/:tiendaId/clientes/:clienteId/qr')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener QR de un cliente específico',
    description: 'Retorna el código QR de cualquier cliente de cualquier tienda',
  })
  @ApiParam({ name: 'tiendaId', description: 'ID de la tienda' })
  @ApiParam({ name: 'clienteId', description: 'ID del cliente' })
  @ApiResponse({ status: 200, description: 'QR obtenido correctamente' })
  @ApiResponse({ status: 404, description: 'Cliente o QR no encontrado' })
  async getClienteQR(
    @Param('tiendaId') tiendaId: string,
    @Param('clienteId') clienteId: string,
  ) {
    return this.superAdminService.getClienteQR(tiendaId, clienteId);
  }
}
