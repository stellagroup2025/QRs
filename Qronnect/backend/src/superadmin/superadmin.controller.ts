import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SuperAdminService } from './superadmin.service';
import { SuperAdminGuard } from './guards/superadmin.guard';
import { SendEmailCodeDto } from './dto/send-email-code.dto';
import { VerifyEmailCodeDto } from './dto/verify-email-code.dto';
import { CreateTiendaDto } from './dto/create-tienda.dto';
import { UpdateTiendaDto } from './dto/update-tienda.dto';
import { ConfigureSmsDto } from './dto/configure-sms.dto';
import { UpdateSenderIdDto } from './dto/update-sender-id.dto';
import { ConfigureIaDto } from './dto/configure-ia.dto';

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
    description:
      'Envía un código de 6 dígitos al email del superadmin para autenticación. No requiere configuración externa.',
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
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número máximo de registros',
  })
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
  async getClienteQR(@Param('tiendaId') tiendaId: string, @Param('clienteId') clienteId: string) {
    return this.superAdminService.getClienteQR(tiendaId, clienteId);
  }

  // ========================================
  // CONFIGURACIÓN DE SMS
  // ========================================

  @Put('tiendas/:id/sms')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Configurar SMS para una tienda',
    description:
      'Configura el modo SMS (global o propio) y las credenciales de Twilio para una tienda específica',
  })
  @ApiParam({ name: 'id', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Configuración SMS actualizada' })
  @ApiResponse({ status: 400, description: 'Configuración inválida' })
  @ApiResponse({ status: 404, description: 'Tienda no encontrada' })
  async configurarSms(@Request() req, @Param('id') id: string, @Body() configDto: ConfigureSmsDto) {
    return this.superAdminService.configurarSms(req.superadmin.id, id, configDto);
  }

  @Get('tiendas/:id/sms')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener configuración SMS de una tienda',
    description: 'Retorna la configuración actual de SMS (sin exponer credenciales completas)',
  })
  @ApiParam({ name: 'id', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Configuración SMS obtenida' })
  @ApiResponse({ status: 404, description: 'Tienda no encontrada' })
  async getConfiguracionSms(@Param('id') id: string) {
    return this.superAdminService.getConfiguracionSms(id);
  }

  @Post('tiendas/:id/sms/test')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Probar configuración SMS de una tienda',
    description: 'Valida las credenciales de Twilio y envía un SMS de prueba',
  })
  @ApiParam({ name: 'id', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Test exitoso' })
  @ApiResponse({ status: 400, description: 'Credenciales inválidas' })
  async probarSms(@Param('id') id: string, @Body() body: { telefono_test: string }) {
    return this.superAdminService.probarSms(id, body.telefono_test);
  }

  @Get('sms/estadisticas-globales')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener estadísticas globales de SMS',
    description: 'Retorna el uso total de SMS por todas las tiendas (solo modo global)',
  })
  @ApiResponse({ status: 200, description: 'Estadísticas globales obtenidas' })
  async getEstadisticasGlobalesSms() {
    return this.superAdminService.getEstadisticasGlobalesSms();
  }

  @Patch('tiendas/:id/sms/sender-id')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar solo el Sender ID de una tienda',
    description:
      'Actualiza únicamente el Sender ID alfanumérico sin modificar el resto de la configuración SMS',
  })
  @ApiParam({ name: 'id', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Sender ID actualizado correctamente' })
  @ApiResponse({
    status: 400,
    description: 'Sender ID inválido (máx 11 caracteres alfanuméricos)',
  })
  @ApiResponse({ status: 404, description: 'Tienda no encontrada' })
  async actualizarSenderId(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateSenderIdDto,
  ) {
    return this.superAdminService.actualizarSenderId(req.superadmin.id, id, updateDto);
  }

  @Delete('tiendas/:id/sms/sender-id')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar el Sender ID de una tienda',
    description: 'Elimina el Sender ID configurado, la tienda volverá a usar número de teléfono',
  })
  @ApiParam({ name: 'id', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Sender ID eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'Tienda no encontrada' })
  async eliminarSenderId(@Request() req, @Param('id') id: string) {
    return this.superAdminService.eliminarSenderId(req.superadmin.id, id);
  }

  // ========================================
  // CONFIGURACIÓN DE IA
  // ========================================

  @Put('tiendas/:id/ia')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Configurar IA para una tienda',
    description:
      'Configura el modo IA (global o propio) y las API keys de Gemini para una tienda específica',
  })
  @ApiParam({ name: 'id', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Configuración IA actualizada' })
  @ApiResponse({ status: 400, description: 'Configuración inválida' })
  @ApiResponse({ status: 404, description: 'Tienda no encontrada' })
  async configurarIa(@Request() req, @Param('id') id: string, @Body() configDto: ConfigureIaDto) {
    return this.superAdminService.configurarIa(req.superadmin.id, id, configDto);
  }

  @Get('tiendas/:id/ia')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener configuración IA de una tienda',
    description: 'Retorna la configuración actual de IA (sin exponer API keys completas)',
  })
  @ApiParam({ name: 'id', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Configuración IA obtenida' })
  @ApiResponse({ status: 404, description: 'Tienda no encontrada' })
  async getConfiguracionIa(@Param('id') id: string) {
    return this.superAdminService.getConfiguracionIa(id);
  }

  @Get('tiendas/:id/ia/estadisticas')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener estadísticas de uso de IA de una tienda',
    description: 'Retorna el uso mensual, límites y consumo de IA',
  })
  @ApiParam({ name: 'id', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas' })
  @ApiResponse({ status: 404, description: 'Tienda no encontrada' })
  async getEstadisticasIa(@Param('id') id: string) {
    return this.superAdminService.getEstadisticasIa(id);
  }

  @Delete('tiendas/:id/ia/api-key')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Eliminar la API key propia de IA de una tienda',
    description: 'Elimina la API key configurada, la tienda volverá a usar modo global',
  })
  @ApiParam({ name: 'id', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'API key eliminada correctamente' })
  @ApiResponse({ status: 404, description: 'Tienda no encontrada' })
  async eliminarApiKeyIa(@Request() req, @Param('id') id: string) {
    return this.superAdminService.eliminarApiKeyIa(req.superadmin.id, id);
  }

  // ========================================
  // ACCESO A TIENDAS COMO ADMIN
  // ========================================

  @Post('tiendas/:id/generar-token-admin')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Generar token de admin para acceder a una tienda',
    description:
      'Genera un token de autenticación que permite al superadmin acceder al panel de admin de la tienda seleccionada',
  })
  @ApiParam({ name: 'id', description: 'ID de la tienda' })
  @ApiResponse({
    status: 200,
    description: 'Token generado correctamente',
    schema: {
      example: {
        access_token: 'eyJzdWIiOiJ1dWlkIiwidGllbmRhX2lkIjoidXVpZCIsInJvbGUiOiJhZG1pbiJ9',
        tienda: {
          id: 'uuid',
          nombre: 'Mi Tienda',
          slug: 'mitienda',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Tienda no encontrada' })
  @ApiResponse({ status: 400, description: 'Tienda inactiva' })
  async generarTokenAdminParaTienda(@Request() req, @Param('id') id: string) {
    return this.superAdminService.generarTokenAdminParaTienda(req.superadmin.id, id);
  }

  // ========================================
  // INFORMES MENSUALES
  // ========================================

  @Get('tiendas/:id/informes')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar informes mensuales de una tienda',
    description: 'Retorna el historial de informes generados para la tienda',
  })
  @ApiParam({ name: 'id', description: 'ID de la tienda' })
  @ApiQuery({ name: 'limite', required: false, type: Number, description: 'Número de informes (default: 12)' })
  @ApiResponse({ status: 200, description: 'Informes obtenidos correctamente' })
  async listarInformesTienda(@Param('id') id: string, @Query('limite') limite?: number) {
    return this.superAdminService.listarInformesTienda(id, limite ? Number(limite) : 12);
  }

  @Post('tiendas/:id/informes/generar')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Generar informe mensual para una tienda',
    description: 'Genera un nuevo informe con análisis de IA para el período especificado',
  })
  @ApiParam({ name: 'id', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Informe generado correctamente' })
  async generarInformeTienda(
    @Param('id') id: string,
    @Body() body: { periodo_mes?: number; periodo_anio?: number },
  ) {
    return this.superAdminService.generarInformeTienda(id, body);
  }

  @Post('tiendas/:id/informes/enviar')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Enviar informe por email a una tienda',
    description: 'Genera (si no existe) y envía el informe del mes por email a la dirección especificada',
  })
  @ApiParam({ name: 'id', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Informe enviado correctamente' })
  async enviarInformeTienda(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { email_destino: string; periodo_mes?: number; periodo_anio?: number },
  ) {
    return this.superAdminService.enviarInformeTienda(req.superadmin.id, id, body);
  }

  @Get('tiendas/:id/informes/configuracion')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener configuración de envío automático de informes',
    description: 'Retorna la configuración de envío automático mensual de una tienda',
  })
  @ApiParam({ name: 'id', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Configuración obtenida correctamente' })
  async obtenerConfiguracionInformes(@Param('id') id: string) {
    return this.superAdminService.obtenerConfiguracionInformes(id);
  }

  @Put('tiendas/:id/informes/configuracion')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Configurar envío automático de informes para una tienda',
    description: 'Configura el envío automático mensual: email destino, día y hora de envío',
  })
  @ApiParam({ name: 'id', description: 'ID de la tienda' })
  @ApiResponse({ status: 200, description: 'Configuración guardada correctamente' })
  async configurarInformesTienda(@Param('id') id: string, @Body() body: any) {
    return this.superAdminService.configurarInformesTienda(id, body);
  }
}
