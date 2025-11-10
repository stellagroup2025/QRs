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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CampanasService } from './campanas.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { CurrentTienda } from '../auth/decorators/current-tienda.decorator';
import { CreateCampanaDto } from './dto/create-campana.dto';
import { UpdateCampanaDto } from './dto/update-campana.dto';
import { FiltrosSegmentacionDto } from './dto/filtros-segmentacion.dto';
import { PreviewDestinatariosDto } from './dto/preview-destinatarios.dto';

/**
 * Controlador para gestión de campañas de email marketing
 * Todos los endpoints requieren autenticación de administrador
 */
@ApiTags('Campañas')
@Controller('admin/campanas')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('JWT')
export class CampanasController {
  constructor(private readonly campanasService: CampanasService) {}

  /**
   * POST /api/admin/campanas
   * Crea una nueva campaña de email
   */
  @Post()
  @ApiOperation({
    summary: 'Crear nueva campaña',
    description: 'Crea una nueva campaña de email con filtros de segmentación opcionales',
  })
  @ApiResponse({ status: 201, description: 'Campaña creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async create(
    @CurrentTienda() tiendaId: string,
    @Request() req: any,
    @Body() createDto: CreateCampanaDto,
  ) {
    const adminUserId = req.user?.sub; // ID del admin que crea la campaña
    return this.campanasService.create(tiendaId, adminUserId, createDto);
  }

  /**
   * GET /api/admin/campanas
   * Lista todas las campañas de la tienda
   */
  @Get()
  @ApiOperation({
    summary: 'Listar campañas',
    description: 'Obtiene todas las campañas de email de la tienda',
  })
  @ApiResponse({ status: 200, description: 'Lista de campañas' })
  async findAll(@CurrentTienda() tiendaId: string) {
    return this.campanasService.findAll(tiendaId);
  }

  /**
   * GET /api/admin/campanas/:id
   * Obtiene una campaña específica
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener campaña por ID',
    description: 'Obtiene los detalles completos de una campaña',
  })
  @ApiResponse({ status: 200, description: 'Campaña encontrada' })
  @ApiResponse({ status: 404, description: 'Campaña no encontrada' })
  async findOne(@CurrentTienda() tiendaId: string, @Param('id') id: string) {
    return this.campanasService.findOne(tiendaId, id);
  }

  /**
   * PUT /api/admin/campanas/:id
   * Actualiza una campaña existente
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Actualizar campaña',
    description: 'Actualiza los datos de una campaña existente',
  })
  @ApiResponse({ status: 200, description: 'Campaña actualizada' })
  @ApiResponse({ status: 404, description: 'Campaña no encontrada' })
  async update(
    @CurrentTienda() tiendaId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateCampanaDto,
  ) {
    return this.campanasService.update(tiendaId, id, updateDto);
  }

  /**
   * DELETE /api/admin/campanas/:id
   * Elimina una campaña
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar campaña',
    description: 'Elimina una campaña de la base de datos',
  })
  @ApiResponse({ status: 200, description: 'Campaña eliminada' })
  @ApiResponse({ status: 404, description: 'Campaña no encontrada' })
  async remove(@CurrentTienda() tiendaId: string, @Param('id') id: string) {
    return this.campanasService.remove(tiendaId, id);
  }

  /**
   * POST /api/admin/campanas/preview-destinatarios
   * Preview de destinatarios según filtros de segmentación
   */
  @Post('preview-destinatarios')
  @ApiOperation({
    summary: 'Preview de destinatarios',
    description:
      'Muestra cuántos clientes recibirán la campaña según los filtros de segmentación y ejemplos de los primeros 10',
  })
  @ApiResponse({
    status: 200,
    description: 'Preview generado exitosamente',
    type: PreviewDestinatariosDto,
  })
  async previewDestinatarios(
    @CurrentTienda() tiendaId: string,
    @Body() filtros: FiltrosSegmentacionDto,
  ): Promise<PreviewDestinatariosDto> {
    return this.campanasService.previewDestinatarios(tiendaId, filtros);
  }

  /**
   * GET /api/admin/campanas/templates
   * Lista templates de email disponibles
   */
  @Get('templates/list')
  @ApiOperation({
    summary: 'Listar templates de email',
    description: 'Obtiene todos los templates disponibles (sistema + personalizados de la tienda)',
  })
  @ApiResponse({ status: 200, description: 'Lista de templates' })
  async getTemplates(@CurrentTienda() tiendaId: string) {
    return this.campanasService.getTemplates(tiendaId);
  }

  /**
   * GET /api/admin/campanas/templates/:id
   * Obtiene un template específico
   */
  @Get('templates/:id')
  @ApiOperation({
    summary: 'Obtener template por ID',
    description: 'Obtiene el contenido completo de un template',
  })
  @ApiResponse({ status: 200, description: 'Template encontrado' })
  @ApiResponse({ status: 404, description: 'Template no encontrado' })
  async getTemplate(@CurrentTienda() tiendaId: string, @Param('id') id: string) {
    return this.campanasService.getTemplate(tiendaId, id);
  }
}
