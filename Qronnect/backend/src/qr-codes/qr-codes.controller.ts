import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { QrCodesService } from './qr-codes.service';
import { SuperAdminGuard } from '../superadmin/guards/superadmin.guard';
import { GenerarQrCodesDto } from './dto/generar-qr-codes.dto';
import { AsignarQrDto } from './dto/asignar-qr.dto';

@ApiTags('QR Codes - Gestión de QR Codes Genéricos')
@Controller('qr-codes')
@ApiBearerAuth()
export class QrCodesController {
  constructor(private readonly qrCodesService: QrCodesService) { }

  // ============================================
  // SUPERADMIN - Gestión de Pool
  // ============================================

  @UseGuards(SuperAdminGuard)
  @Post('generar')
  @ApiOperation({
    summary: 'Generar un lote de QR codes para imprimir',
    description: `
      Genera N QR codes únicos en la base de datos.

      Ejemplo de uso:
      1. Generar 1000 QR codes con lote "LOTE-2024-001"
      2. Sistema crea 1000 hashes únicos
      3. Exportar CSV con URLs para imprimir pegatinas
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'QR codes generados exitosamente',
  })
  async generarQrCodes(@Request() req, @Body() dto: GenerarQrCodesDto) {
    const adminId = req.user.id;
    return this.qrCodesService.generarLote(dto.cantidad, dto.lote, adminId);
  }

  @Patch(':hash/mark-downloaded')
  @ApiOperation({ summary: 'Marcar QR como descargado' })
  @ApiResponse({ status: 200, description: 'Estado actualizado correctamente' })
  async markAsDownloaded(@Param('hash') hash: string) {
    return this.qrCodesService.markAsDownloaded(hash);
  }

  @UseGuards(SuperAdminGuard)
  @Get()
  @ApiOperation({
    summary: 'Listar todos los QR codes del pool',
  })
  @ApiQuery({ name: 'estado', required: false, enum: ['disponible', 'asignado', 'desactivado'] })
  @ApiQuery({ name: 'lote', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Lista de QR codes',
  })
  async listarQrCodes(
    @Query('estado') estado?: string,
    @Query('lote') lote?: string,
  ) {
    return this.qrCodesService.listarQrCodes(estado, lote);
  }

  @UseGuards(SuperAdminGuard)
  @Get('estadisticas')
  @ApiOperation({
    summary: 'Obtener estadísticas del pool de QR codes',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas generales',
  })
  async obtenerEstadisticas() {
    return this.qrCodesService.obtenerEstadisticas();
  }

  @UseGuards(SuperAdminGuard)
  @Get('tiendas-sin-qr')
  @ApiOperation({
    summary: 'Listar tiendas que NO tienen QR asignado',
    description: 'Útil para asignación rápida de QR codes',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tiendas sin QR',
  })
  async listarTiendasSinQr() {
    return this.qrCodesService.listarTiendasSinQr();
  }

  @UseGuards(SuperAdminGuard)
  @Get(':hash')
  @ApiOperation({
    summary: 'Obtener detalles de un QR code específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalles del QR code',
  })
  async obtenerQrCode(@Param('hash') hash: string) {
    return this.qrCodesService.obtenerPorHash(hash);
  }

  @UseGuards(SuperAdminGuard)
  @Post('asignar')
  @ApiOperation({
    summary: 'Asignar un QR code a una tienda',
    description: `
      Asigna un QR code disponible a una tienda específica.

      Flujo típico:
      1. Admin escanea pegatina al crear tienda
      2. Sistema captura el hash del QR
      3. Se asigna automáticamente a la nueva tienda
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'QR code asignado exitosamente',
  })
  async asignarQr(@Body() dto: AsignarQrDto) {
    return this.qrCodesService.asignarQrATienda(dto.hash, dto.id_tienda);
  }

  @UseGuards(SuperAdminGuard)
  @Post(':hash/desasignar')
  @ApiOperation({
    summary: 'Desasignar un QR code de su tienda actual',
    description: 'Libera el QR code para que pueda ser reasignado',
  })
  @ApiResponse({
    status: 200,
    description: 'QR code desasignado exitosamente',
  })
  async desasignarQr(@Param('hash') hash: string) {
    return this.qrCodesService.desasignarQr(hash);
  }

  @UseGuards(SuperAdminGuard)
  @Get(':hash/analytics')
  @ApiOperation({
    summary: 'Obtener analytics de un QR code',
    description: 'Estadísticas detalladas de escaneos del QR',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics del QR code',
  })
  async obtenerAnalytics(@Param('hash') hash: string) {
    return this.qrCodesService.obtenerAnalytics(hash);
  }

  @UseGuards(SuperAdminGuard)
  @Post('exportar-csv')
  @ApiOperation({
    summary: 'Exportar QR codes a CSV para imprimir',
    description: 'Genera archivo CSV con URLs de QR codes de un lote',
  })
  @ApiQuery({ name: 'lote', required: true, type: String })
  @ApiResponse({
    status: 200,
    description: 'Archivo CSV generado',
  })
  async exportarCsv(@Query('lote') lote: string) {
    return this.qrCodesService.exportarACsv(lote);
  }
}
