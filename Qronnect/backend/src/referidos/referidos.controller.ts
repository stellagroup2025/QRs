import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ReferidosService } from './referidos.service';
import { CrearProgramaReferidosDto } from './dto/crear-programa-referidos.dto';
import { RegistrarReferidoDto } from './dto/registrar-referido.dto';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { ClientAuthGuard } from '../auth/guards/client-auth.guard';
import { CurrentTienda } from '../auth/decorators/current-tienda.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Referidos')
@ApiBearerAuth('JWT')
@Controller('referidos')
export class ReferidosController {
  constructor(private readonly referidosService: ReferidosService) {}

  // ============================================
  // ENDPOINTS PARA ADMIN
  // ============================================

  @Post('programa')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Crear programa de referidos (Admin)' })
  @ApiResponse({ status: 201, description: 'Programa creado' })
  crearPrograma(
    @CurrentTienda() tiendaId: string,
    @Body() dto: CrearProgramaReferidosDto,
  ) {
    return this.referidosService.crearPrograma(tiendaId, dto);
  }

  @Get('programa')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Obtener programa de referidos activo (Admin)' })
  @ApiResponse({ status: 200, description: 'Programa obtenido' })
  getProgramaActivo(@CurrentTienda() tiendaId: string) {
    return this.referidosService.getProgramaActivo(tiendaId);
  }

  @Put('programa/:id')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Actualizar programa de referidos (Admin)' })
  @ApiResponse({ status: 200, description: 'Programa actualizado' })
  actualizarPrograma(
    @CurrentTienda() tiendaId: string,
    @Param('id') programaId: string,
    @Body() dto: Partial<CrearProgramaReferidosDto>,
  ) {
    return this.referidosService.actualizarPrograma(tiendaId, programaId, dto);
  }

  @Get('estadisticas')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Obtener estadísticas de referidos (Admin)' })
  @ApiResponse({ status: 200, description: 'Estadísticas obtenidas' })
  getEstadisticas(@CurrentTienda() tiendaId: string) {
    return this.referidosService.getEstadisticas(tiendaId);
  }

  @Get('lista')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Listar todos los referidos (Admin)' })
  @ApiResponse({ status: 200, description: 'Lista de referidos' })
  listarReferidos(
    @CurrentTienda() tiendaId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.referidosService.listarReferidos(
      tiendaId,
      limit ? parseInt(limit.toString()) : 50,
      offset ? parseInt(offset.toString()) : 0,
    );
  }

  // ============================================
  // ENDPOINTS PARA CLIENTES
  // ============================================

  @Get('mi-codigo')
  @UseGuards(ClientAuthGuard)
  @ApiOperation({ summary: 'Obtener mi código de referido personal (Cliente)' })
  @ApiResponse({
    status: 200,
    description: 'Código personal obtenido',
    schema: {
      example: {
        codigo: 'JUAN-A3F2',
        url: 'https://app.qronnect.com/registro?ref=JUAN-A3F2',
        nombre: 'Juan Pérez',
        total_referidos: 3,
      },
    },
  })
  getCodigoPersonal(
    @CurrentTienda() tiendaId: string,
    @CurrentUser() user: any,
  ) {
    console.log('🎯 Controller mi-codigo:', { tiendaId, userId: user?.id, user });
    return this.referidosService.getCodigoPersonal(tiendaId, user.id);
  }

  @Get('mis-referidos')
  @UseGuards(ClientAuthGuard)
  @ApiOperation({ summary: 'Obtener lista de mis referidos (Cliente)' })
  @ApiResponse({ status: 200, description: 'Lista de referidos' })
  getMisReferidos(
    @CurrentTienda() tiendaId: string,
    @CurrentUser() user: any,
  ) {
    return this.referidosService.getMisReferidos(tiendaId, user.id);
  }

  @Get('mi-progreso')
  @UseGuards(ClientAuthGuard)
  @ApiOperation({ summary: 'Obtener mi progreso de referidos (Cliente)' })
  @ApiResponse({
    status: 200,
    description: 'Progreso obtenido',
    schema: {
      example: {
        codigo_personal: 'JUAN-A3F2',
        total_referidos: 3,
        programa_nombre: 'Trae un amigo',
        proxima_recompensa: {
          objetivo: 5,
          tipo: 'puntos',
          valor: 500,
          descripcion: '500 puntos bonus',
        },
      },
    },
  })
  getProgreso(
    @CurrentTienda() tiendaId: string,
    @CurrentUser() user: any,
  ) {
    return this.referidosService.getProgreso(tiendaId, user.id);
  }

  @Post('registrar')
  @UseGuards(AdminAuthGuard)
  @ApiOperation({ summary: 'Registrar un nuevo referido (Admin/Sistema)' })
  @ApiResponse({ status: 201, description: 'Referido registrado' })
  registrarReferido(
    @CurrentTienda() tiendaId: string,
    @Body() dto: RegistrarReferidoDto,
  ) {
    return this.referidosService.registrarReferido(tiendaId, dto);
  }
}
