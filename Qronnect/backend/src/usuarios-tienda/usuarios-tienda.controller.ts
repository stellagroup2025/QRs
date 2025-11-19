import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsuariosTiendaService } from './usuarios-tienda.service';
import { CreateUsuarioTiendaDto } from './dto/create-usuario-tienda.dto';
import { UpdateUsuarioTiendaDto } from './dto/update-usuario-tienda.dto';
import { SuperAdminGuard } from '../superadmin/guards/superadmin.guard';

@Controller('superadmin/tiendas/:tiendaId/usuarios')
@UseGuards(SuperAdminGuard)
export class UsuariosTiendaController {
  constructor(private readonly usuariosTiendaService: UsuariosTiendaService) {}

  @Get()
  async findAll(@Param('tiendaId') tiendaId: string) {
    try {
      return await this.usuariosTiendaService.findAll(tiendaId);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener usuarios',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(
    @Param('tiendaId') tiendaId: string,
    @Param('id') id: string,
  ) {
    try {
      return await this.usuariosTiendaService.findOne(tiendaId, id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al obtener usuario',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post()
  async create(
    @Param('tiendaId') tiendaId: string,
    @Body() createDto: CreateUsuarioTiendaDto,
  ) {
    try {
      return await this.usuariosTiendaService.create(tiendaId, createDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al crear usuario',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('tiendaId') tiendaId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateUsuarioTiendaDto,
  ) {
    try {
      return await this.usuariosTiendaService.update(tiendaId, id, updateDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al actualizar usuario',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(
    @Param('tiendaId') tiendaId: string,
    @Param('id') id: string,
  ) {
    try {
      await this.usuariosTiendaService.remove(tiendaId, id);
      return { message: 'Usuario eliminado correctamente' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Error al eliminar usuario',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
