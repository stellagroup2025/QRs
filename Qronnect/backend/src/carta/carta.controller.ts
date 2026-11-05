import 'multer';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { Tenant } from '../tenant/decorators/tenant.decorator';
import { CartaService } from './carta.service';
import {
  ActualizarCategoriaDto,
  ActualizarPlatoDto,
  ConfigPaginaDto,
  CrearCategoriaDto,
  CrearPlatoDto,
  OrdenarDto,
} from './dto/carta.dto';

@ApiTags('Carta online')
@Controller('carta')
export class CartaController {
  constructor(private readonly cartaService: CartaService) {}

  // ---------- Público ----------

  @Get('publica')
  @ApiOperation({ summary: 'Carta visible del restaurante (público)' })
  cartaPublica(@Tenant('id') idTienda: string) {
    return this.cartaService.cartaPublica(idTienda);
  }

  @Get('pagina')
  @ApiOperation({ summary: 'Datos de la página QR de 3 vías: reseña de Google, fidelización y carta (público)' })
  pagina(@Tenant('id') idTienda: string) {
    return this.cartaService.paginaPublica(idTienda);
  }

  // ---------- Panel ----------

  @Get()
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Carta completa para editar' })
  carta(@Tenant('id') idTienda: string) {
    return this.cartaService.cartaCompleta(idTienda);
  }

  @Get('config')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Configuración de la página QR' })
  config(@Tenant('id') idTienda: string) {
    return this.cartaService.config(idTienda);
  }

  @Put('config')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Guardar configuración de la página QR (portada y enlace de reseñas)' })
  guardarConfig(@Tenant('id') idTienda: string, @Body() dto: ConfigPaginaDto) {
    return this.cartaService.guardarConfig(idTienda, dto);
  }

  @Post('categorias')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Crear categoría' })
  crearCategoria(@Tenant('id') idTienda: string, @Body() dto: CrearCategoriaDto) {
    return this.cartaService.crearCategoria(idTienda, dto);
  }

  // Antes que categorias/:id para que "orden" no se tome como ID
  @Put('categorias/orden')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Reordenar categorías' })
  ordenarCategorias(@Tenant('id') idTienda: string, @Body() dto: OrdenarDto) {
    return this.cartaService.ordenar(idTienda, 'carta_categorias', dto.ids);
  }

  @Put('categorias/:id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Editar categoría' })
  actualizarCategoria(
    @Tenant('id') idTienda: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarCategoriaDto,
  ) {
    return this.cartaService.actualizarCategoria(idTienda, id, dto);
  }

  @Delete('categorias/:id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Borrar categoría y sus platos' })
  borrarCategoria(@Tenant('id') idTienda: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.cartaService.borrarCategoria(idTienda, id);
  }

  @Put('categorias/:id/platos/orden')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Reordenar los platos de una categoría' })
  ordenarPlatos(@Tenant('id') idTienda: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: OrdenarDto) {
    return this.cartaService.ordenar(idTienda, 'carta_platos', dto.ids, id);
  }

  @Post('platos/imagen')
  @UseGuards(AdminAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth('JWT')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir la foto de un plato (JPG, PNG o WebP, máx. 3 MB)' })
  subirImagen(@Tenant('id') idTienda: string, @UploadedFile() file: Express.Multer.File) {
    return this.cartaService.subirImagen(idTienda, file);
  }

  @Post('platos')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Crear plato' })
  crearPlato(@Tenant('id') idTienda: string, @Body() dto: CrearPlatoDto) {
    return this.cartaService.crearPlato(idTienda, dto);
  }

  @Put('platos/:id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Editar plato' })
  actualizarPlato(
    @Tenant('id') idTienda: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarPlatoDto,
  ) {
    return this.cartaService.actualizarPlato(idTienda, id, dto);
  }

  @Delete('platos/:id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Borrar plato' })
  borrarPlato(@Tenant('id') idTienda: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.cartaService.borrarPlato(idTienda, id);
  }
}
