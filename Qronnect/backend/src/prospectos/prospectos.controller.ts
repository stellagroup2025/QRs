import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ProspectosService } from './prospectos.service';
import { ComercialAuthGuard } from '../comerciales/guards/comercial-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Prospectos (CRM)')
@ApiBearerAuth('JWT-Comercial')
@UseGuards(ComercialAuthGuard)
@Controller('comerciales/prospectos')
export class ProspectosController {
    constructor(private readonly prospectosService: ProspectosService) { }

    @Get()
    @ApiOperation({ summary: 'Listar mis prospectos' })
    async findAll(@Request() req) {
        return this.prospectosService.findAll(req.user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Crear nuevo prospecto' })
    async create(@Request() req, @Body() body: any) {
        return this.prospectosService.create(req.user.id, body);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar prospecto (estado, notas, etc)' })
    async update(@Request() req, @Param('id') id: string, @Body() body: any) {
        return this.prospectosService.update(id, req.user.id, body);
    }
}
