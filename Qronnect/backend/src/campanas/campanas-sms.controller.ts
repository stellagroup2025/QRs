import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CampanasSmsService } from './campanas-sms.service';
import { SmsService } from '../sms/sms.service';
import { CreateCampanaSmsDto } from './dto/create-campana-sms.dto';
import { UpdateCampanaSmsDto } from './dto/update-campana-sms.dto';
import { FiltrosSegmentacionDto } from './dto/filtros-segmentacion.dto';
import { GenerarSmsIaDto } from './dto/generar-sms-ia.dto';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentTienda } from '../auth/decorators/current-tienda.decorator';

@ApiTags('Campañas SMS')
@ApiBearerAuth('JWT')
@Controller('campanas-sms')
@UseGuards(AdminAuthGuard)
export class CampanasSmsController {
  constructor(
    private readonly campanasSmsService: CampanasSmsService,
    private readonly smsService: SmsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva campaña SMS' })
  @ApiResponse({ status: 201, description: 'Campaña SMS creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(
    @CurrentTienda() tiendaId: string,
    @CurrentUser() user: any,
    @Body() createDto: CreateCampanaSmsDto,
  ) {
    return this.campanasSmsService.create(tiendaId, user.id, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las campañas SMS de la tienda' })
  @ApiResponse({ status: 200, description: 'Lista de campañas SMS' })
  findAll(@CurrentTienda() tiendaId: string) {
    return this.campanasSmsService.findAll(tiendaId);
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Obtener estadísticas de uso de SMS' })
  @ApiResponse({ status: 200, description: 'Estadísticas de SMS' })
  getEstadisticas(@CurrentTienda() tiendaId: string) {
    return this.smsService.getEstadisticas(tiendaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una campaña SMS por ID' })
  @ApiResponse({ status: 200, description: 'Campaña SMS encontrada' })
  @ApiResponse({ status: 404, description: 'Campaña SMS no encontrada' })
  findOne(@CurrentTienda() tiendaId: string, @Param('id') id: string) {
    return this.campanasSmsService.findOne(tiendaId, id);
  }

  @Get(':id/estadisticas-detalladas')
  @ApiOperation({ summary: 'Obtener estadísticas detalladas de una campaña SMS' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas detalladas (tasa entrega, fallos, desglose operadores, etc.)'
  })
  @ApiResponse({ status: 404, description: 'Campaña SMS no encontrada' })
  getEstadisticasCampana(@CurrentTienda() tiendaId: string, @Param('id') id: string) {
    return this.campanasSmsService.getEstadisticas(tiendaId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una campaña SMS' })
  @ApiResponse({ status: 200, description: 'Campaña SMS actualizada' })
  @ApiResponse({ status: 404, description: 'Campaña SMS no encontrada' })
  update(
    @CurrentTienda() tiendaId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateCampanaSmsDto,
  ) {
    return this.campanasSmsService.update(tiendaId, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una campaña SMS' })
  @ApiResponse({ status: 200, description: 'Campaña SMS eliminada' })
  @ApiResponse({ status: 404, description: 'Campaña SMS no encontrada' })
  remove(@CurrentTienda() tiendaId: string, @Param('id') id: string) {
    return this.campanasSmsService.remove(tiendaId, id);
  }

  @Post('preview-destinatarios')
  @ApiOperation({
    summary: 'Preview de destinatarios según filtros de segmentación',
    description: 'Devuelve cuántos clientes con teléfono recibirán el SMS',
  })
  @ApiResponse({
    status: 200,
    description: 'Preview generado con total y ejemplos',
  })
  previewDestinatarios(
    @CurrentTienda() tiendaId: string,
    @Body() filtros: FiltrosSegmentacionDto,
  ) {
    return this.campanasSmsService.previewDestinatarios(tiendaId, filtros);
  }

  @Post('generar-con-ia')
  @ApiOperation({
    summary: 'Generar mensaje SMS con IA (Gemini)',
    description: 'Usa inteligencia artificial para generar mensajes SMS optimizados para marketing',
  })
  @ApiResponse({
    status: 200,
    description: 'SMS generado con éxito',
    schema: {
      example: {
        mensaje: 'Hola {{nombre}}! 🎉 50% OFF en tu matrícula este mes. ¡Únete a GymFit!',
        caracteres: 74,
        numSMS: 1,
        sugerencias: [
          '{{nombre}}, aprovecha 50% descuento en matrícula GymFit. Válido hasta fin de mes!',
          'Hola! Oferta especial: 50% en matrículas GymFit. ¡No te lo pierdas!'
        ]
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Error al generar SMS' })
  generarSmsConIA(
    @CurrentTienda() tiendaId: string,
    @Body() dto: GenerarSmsIaDto,
  ) {
    return this.campanasSmsService.generarSmsConIA(tiendaId, dto);
  }
}
