import { Controller, Get, Put, Post, Body, UseGuards } from '@nestjs/common';
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
      'Devuelve los datos del cliente y su QR único (ID del cliente).',
  })
  @ApiResponse({
    status: 201,
    description: 'Cliente registrado exitosamente',
    schema: {
      type: 'object',
      properties: {
        cliente: { type: 'object' },
        qr_code: { type: 'string', description: 'ID del cliente para generar QR' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Ya estás registrado en esta tienda' })
  async register(
    @Tenant('id') tenantId: string,
    @Body() registerDto: RegisterClienteDto,
  ): Promise<{ cliente: ClienteResponseDto; qr_code: string }> {
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
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Código inválido o expirado' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado' })
  async verifyCode(
    @Tenant('id') tenantId: string,
    @Body() verifyDto: VerifyCodeClienteDto,
  ): Promise<{ access_token: string; cliente: ClienteResponseDto }> {
    return this.clientesService.verifyLoginCode(tenantId, verifyDto);
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
