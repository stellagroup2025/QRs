import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BrandingService } from './branding.service';
import { Tenant } from '../tenant/decorators/tenant.decorator';

@ApiTags('Config')
@Controller('config')
export class BrandingController {
  constructor(private readonly brandingService: BrandingService) {}

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
}
