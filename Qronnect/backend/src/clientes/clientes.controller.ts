import { Controller, Get, Put, Post, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ClientesService } from './clientes.service';
import { TiendasService } from '../tiendas/tiendas.service';
import { ClientAuthGuard } from '../auth/guards/client-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Tenant } from '../tenant/decorators/tenant.decorator';
import { AuthUser } from '../auth/entities/auth-user.entity';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { ClienteResponseDto } from './dto/cliente-response.dto';
import { PuntosResponseDto } from './dto/puntos-response.dto';
import { RegisterClienteDto } from './dto/register-cliente.dto';
import { SendCodeClienteDto } from './dto/send-code-cliente.dto';
import { VerifyCodeClienteDto } from './dto/verify-code-cliente.dto';
import { SendValidationCodeDto } from './dto/send-validation-code.dto';
import { VerifyValidationCodeDto } from './dto/verify-validation-code.dto';

/**
 * Controlador de endpoints para clientes finales
 * Los endpoints de autenticación (/auth/*) son públicos
 * Los demás requieren autenticación mediante JWT
 */
@ApiTags('Clientes')
@Controller('clientes')
export class ClientesController {
  constructor(
    private readonly clientesService: ClientesService,
    private readonly tiendasService: TiendasService,
  ) {}

  /**
   * POST /api/clientes/auth/register
   * Registra un nuevo cliente en la tienda actual (pública)
   */
  @Post('auth/register')
  @ApiOperation({
    summary: 'Registrar nuevo cliente',
    description:
      'Registra un nuevo cliente en la tienda del dominio actual. ' +
      'Devuelve los datos del cliente y su QR único (ID del cliente). ' +
      'El cliente debe validar su email antes de poder hacer login.',
  })
  @ApiResponse({
    status: 201,
    description: 'Cliente registrado exitosamente. Debe validar su email antes de poder hacer login.',
    schema: {
      type: 'object',
      properties: {
        cliente: { type: 'object' },
        qr_code: { type: 'string', description: 'ID del cliente para generar QR' },
        requiere_validacion: { type: 'boolean', description: 'Indica que debe validar el email' },
        mensaje: { type: 'string', description: 'Mensaje informativo sobre la validación' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Ya estás registrado en esta tienda' })
  async register(
    @Tenant('id') tenantId: string,
    @Body() registerDto: RegisterClienteDto,
  ): Promise<{ cliente: ClienteResponseDto; qr_code: string; requiere_validacion: boolean; mensaje: string }> {
    return this.clientesService.registerCliente(tenantId, registerDto);
  }

  /**
   * POST /api/clientes/auth/send-code
   * Envía código OTP al email del cliente (pública)
   */
  @Post('auth/send-code')
  @ApiOperation({
    summary: 'Enviar código de login por email',
    description:
      'Genera un código OTP de 6 dígitos y lo envía al email del cliente registrado en esta tienda. ' +
      'El código expira en 10 minutos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Código enviado',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        codigo_enviado: { type: 'string', description: 'Solo para desarrollo' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado en esta tienda' })
  async sendCode(
    @Tenant('id') tenantId: string,
    @Body() sendCodeDto: SendCodeClienteDto,
  ): Promise<{ message: string; codigo_enviado: string }> {
    return this.clientesService.sendLoginCode(tenantId, sendCodeDto);
  }

  /**
   * POST /api/clientes/auth/verify-code
   * Verifica el código OTP y devuelve token de acceso (pública)
   */
  @Post('auth/verify-code')
  @ApiOperation({
    summary: 'Verificar código y obtener token',
    description:
      'Valida el código OTP enviado por email y devuelve un token de acceso válido por 30 días.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        cliente: { type: 'object' },
        email_validado: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Código inválido, expirado, o email no validado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async verifyCode(
    @Tenant('id') tenantId: string,
    @Body() verifyDto: VerifyCodeClienteDto,
  ): Promise<{ access_token: string; cliente: ClienteResponseDto; email_validado: boolean }> {
    return this.clientesService.verifyLoginCode(tenantId, verifyDto);
  }

  /**
   * POST /api/clientes/auth/send-validation-code
   * Envía código de validación de email al cliente (pública)
   */
  @Post('auth/send-validation-code')
  @ApiOperation({
    summary: 'Enviar código de validación de email',
    description:
      'Genera un código OTP de 6 dígitos y lo envía al email del cliente para validar su cuenta. ' +
      'El código expira en 10 minutos. Este endpoint debe usarse después del registro.',
  })
  @ApiResponse({
    status: 200,
    description: 'Código de validación enviado',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        codigo_enviado: { type: 'string', description: 'Solo para desarrollo' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado en esta tienda' })
  async sendValidationCode(
    @Tenant('id') tenantId: string,
    @Body() sendValidationDto: SendValidationCodeDto,
  ): Promise<{ message: string; codigo_enviado?: string }> {
    return this.clientesService.sendValidationCode(tenantId, sendValidationDto);
  }

  /**
   * POST /api/clientes/auth/verify-validation-code
   * Verifica el código de validación y marca el email como validado (pública)
   */
  @Post('auth/verify-validation-code')
  @ApiOperation({
    summary: 'Verificar código de validación de email',
    description:
      'Valida el código OTP enviado por email y marca el email del cliente como validado. ' +
      'Una vez validado, el cliente puede acceder a todos los endpoints protegidos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email validado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        email_validado: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Código inválido o expirado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async verifyValidationCode(
    @Tenant('id') tenantId: string,
    @Body() verifyValidationDto: VerifyValidationCodeDto,
  ): Promise<{ message: string; email_validado: boolean }> {
    return this.clientesService.verifyValidationCode(tenantId, verifyValidationDto);
  }

  /**
   * GET /api/clientes/auth/validate-email/:token
   * Valida el email del cliente mediante enlace con token (pública)
   */
  @Get('auth/validate-email/:token')
  @ApiOperation({
    summary: 'Validar email mediante enlace',
    description:
      'Valida el email del cliente usando el token único del enlace enviado por email. ' +
      'El token expira en 24 horas.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email validado exitosamente',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        email_validado: { type: 'boolean' },
        cliente: { type: 'object' },
        access_token: { type: 'string', description: 'JWT token para auto-login' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async validateEmailLink(
    @Tenant('id') tenantId: string,
    @Param('token') token: string,
  ): Promise<{ message: string; email_validado: boolean; cliente?: ClienteResponseDto; token_expirado?: boolean; nuevo_enlace_enviado?: boolean; access_token?: string }> {
    return this.clientesService.validateEmailLink(tenantId, token);
  }

  /**
   * POST /api/clientes/auth/resend-validation-link
   * Reenvía el enlace de validación de email (pública)
   */
  @Post('auth/resend-validation-link')
  @ApiOperation({
    summary: 'Reenviar enlace de validación de email',
    description:
      'Genera un nuevo token de validación y lo envía al email del cliente. ' +
      'Útil cuando el enlace anterior expiró o el email no llegó.',
  })
  @ApiResponse({
    status: 200,
    description: 'Nuevo enlace enviado',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        enlace_enviado: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  @ApiResponse({ status: 400, description: 'Email ya validado' })
  async resendValidationLink(
    @Tenant('id') tenantId: string,
    @Body() sendValidationDto: SendValidationCodeDto,
  ): Promise<{ message: string; enlace_enviado: boolean }> {
    return this.clientesService.resendValidationLink(tenantId, sendValidationDto);
  }

  /**
   * GET /api/clientes/me
   * Obtiene los datos del cliente autenticado
   */
  @Get('me')
  @UseGuards(ClientAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Obtener datos del cliente actual',
    description: 'Devuelve los datos del cliente autenticado en la tienda actual.',
  })
  @ApiResponse({ status: 200, description: 'Datos del cliente', type: ClienteResponseDto })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async getMe(
    @CurrentUser() user: AuthUser,
    @Tenant('id') tenantId: string,
  ): Promise<ClienteResponseDto> {
    return this.clientesService.getClienteById(user.id, tenantId);
  }

  /**
   * PUT /api/clientes/me
   * Actualiza los datos del cliente autenticado
   */
  @Put('me')
  @UseGuards(ClientAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Actualizar datos del cliente actual',
    description:
      'Permite actualizar teléfono, email y nombre del cliente autenticado en la tienda actual.',
  })
  @ApiResponse({ status: 200, description: 'Cliente actualizado', type: ClienteResponseDto })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado en esta tienda' })
  async updateMe(
    @CurrentUser() user: AuthUser,
    @Tenant('id') tenantId: string,
    @Body() updateDto: UpdateClienteDto,
  ): Promise<ClienteResponseDto> {
    return this.clientesService.updateClienteById(user.id, tenantId, updateDto);
  }

  /**
   * GET /api/clientes/me/puntos
   * Obtiene el detalle de puntos y últimas compras del cliente
   */
  @Get('me/puntos')
  @UseGuards(ClientAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Obtener puntos y compras del cliente',
    description:
      'Devuelve los puntos totales y las últimas compras realizadas por el cliente en la tienda actual.',
  })
  @ApiResponse({ status: 200, description: 'Puntos y compras', type: PuntosResponseDto })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getPuntos(
    @CurrentUser() user: AuthUser,
    @Tenant('id') tenantId: string,
  ): Promise<PuntosResponseDto> {
    return this.clientesService.getPuntosYComprasByClienteId(user.id, tenantId);
  }

  /**
   * GET /api/clientes/tienda-info
   * Obtiene información de la tienda (horarios, contacto, redes)
   * Este endpoint es PÚBLICO - no requiere autenticación
   */
  @Get('tienda-info')
  @ApiOperation({
    summary: 'Obtener información de la tienda',
    description:
      'Devuelve información de la tienda incluyendo horarios, contacto, redes sociales y estado (abierto/cerrado). ' +
      'Este endpoint es público y puede ser accedido sin autenticación.',
  })
  @ApiResponse({
    status: 200,
    description: 'Información de la tienda',
    schema: {
      type: 'object',
      properties: {
        nombre: { type: 'string' },
        descripcion: { type: 'string' },
        direccion: { type: 'string' },
        telefono: { type: 'string' },
        email: { type: 'string' },
        sitio_web: { type: 'string' },
        whatsapp: { type: 'string' },
        ubicacion_maps: { type: 'string' },
        horarios: { type: 'object' },
        redes_sociales: { type: 'object' },
        esta_abierta: { type: 'boolean', nullable: true },
      },
    },
  })
  async getTiendaInfo(@Tenant('id') tenantId: string) {
    return this.tiendasService.getInfoTienda(tenantId);
  }
}
