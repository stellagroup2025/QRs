import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BrandingService } from './branding.service';
import { LandingService } from './landing.service';
import { Tenant } from '../tenant/decorators/tenant.decorator';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';

@ApiTags('Config')
@Controller('config')
export class BrandingController {
  constructor(
    private readonly brandingService: BrandingService,
    private readonly landingService: LandingService,
  ) {}

  @Get('branding')
  @ApiOperation({
    summary: 'Obtener configuración de marca de la tienda',
    description:
      'Endpoint público que retorna la configuración visual de la marca (colores, logo, nombre comercial) basado en el tenant del request',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración de branding retornada exitosamente',
    schema: {
      example: {
        logo_url: 'https://ejemplo.com/logo.png',
        color_primario: '#FF5733',
        color_secundario: '#333333',
        color_acento: '#0066CC',
        nombre_comercial: 'Cafetería Aroma Premium',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Tienda no encontrada o inactiva',
  })
  async getBranding(@Tenant('id') idTienda: string) {
    return this.brandingService.getBranding(idTienda);
  }

  @Get('landing')
  @ApiOperation({
    summary: 'Obtener configuración de textos de landing page',
    description:
      'Endpoint público que retorna todos los textos configurables de la landing page (hero, servicios, beneficios, testimonios, CTA) basado en el tenant del request',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración de landing retornada exitosamente',
    schema: {
      example: {
        hero_titulo_principal: 'Impulsa tu negocio',
        hero_titulo_destacado: 'al siguiente nivel',
        hero_subtitulo: 'Sistema integral de fidelización y gestión de clientes para negocios modernos.',
        hero_cta_principal: 'Solicitar Información',
        hero_cta_secundario: 'Acceder',
        servicios_titulo: 'Soluciones completas',
        servicio_1_titulo: 'Gestión de Clientes',
        servicio_1_descripcion: 'Sistema completo para gestionar tu base de clientes...',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de landing no encontrada',
  })
  async getLanding(@Tenant('id') idTienda: string) {
    return this.landingService.getLandingConfig(idTienda);
  }

  @Put('landing')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Actualizar configuración de landing page',
    description:
      'Endpoint protegido para administradores. Permite actualizar cualquier campo de la configuración de la landing page.',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración actualizada exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado o no autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración de landing no encontrada',
  })
  async updateLanding(
    @Tenant('id') idTienda: string,
    @Body() updates: Record<string, any>,
  ) {
    return this.landingService.updateLandingConfig(idTienda, updates);
  }
}
