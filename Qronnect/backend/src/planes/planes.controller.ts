import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlanesService } from './planes.service';
import { ComercialAuthGuard } from '../comerciales/guards/comercial-auth.guard';

@ApiTags('Planes')
@Controller('planes')
@UseGuards(ComercialAuthGuard)
export class PlanesController {
    constructor(private readonly planesService: PlanesService) { }

    @Get()
    @ApiOperation({ summary: 'Listar todos los planes activos' })
    @ApiResponse({ status: 200, description: 'Lista de planes' })
    async findAll() {
        return this.planesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener detalle de un plan' })
    @ApiResponse({ status: 200, description: 'Detalle del plan' })
    async findOne(@Param('id') id: string) {
        return this.planesService.findOne(id);
    }
}
