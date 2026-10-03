import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SuperAdminGuard } from '../superadmin/guards/superadmin.guard';
import { ContactoService } from './contacto.service';
import { ActualizarSolicitudDto, CrearSolicitudContactoDto } from './dto/crear-solicitud.dto';

@ApiTags('Contacto')
@Controller()
export class ContactoController {
  constructor(private readonly contactoService: ContactoService) {}

  /** Formulario público de la web (portada y landings de sector) */
  @Post('contacto')
  @Throttle({ default: { limit: 5, ttl: 60 * 60_000 } })
  @ApiOperation({ summary: 'Enviar solicitud de contacto de un negocio (público)' })
  crear(@Body() dto: CrearSolicitudContactoDto) {
    return this.contactoService.crear(dto);
  }

  @Get('superadmin/solicitudes-contacto')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Listar solicitudes de contacto (superadmin)' })
  listar() {
    return this.contactoService.listar();
  }

  @Patch('superadmin/solicitudes-contacto/:id')
  @UseGuards(SuperAdminGuard)
  @ApiOperation({ summary: 'Cambiar el estado de una solicitud (superadmin)' })
  actualizar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ActualizarSolicitudDto) {
    return this.contactoService.actualizar(id, dto);
  }
}
