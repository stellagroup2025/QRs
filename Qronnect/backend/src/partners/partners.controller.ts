import { Controller, Post, Body, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PartnersService } from './partners.service';
import { CreatePartnerDto, UpdatePartnerDto } from './dto/partners.dto';
import { SuperAdminGuard } from '../superadmin/guards/superadmin.guard';

@ApiTags('Partners')
@Controller('partners')
@UseGuards(SuperAdminGuard)
@ApiBearerAuth('JWT-SuperAdmin')
export class PartnersController {
    constructor(private readonly partnersService: PartnersService) { }

    @Post()
    @ApiOperation({ summary: 'Crear nuevo partner (Solo SuperAdmin)' })
    @ApiResponse({ status: 201, description: 'Partner creado' })
    async create(@Body() createDto: CreatePartnerDto) {
        return this.partnersService.create(createDto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todos los partners con métricas de licencias (Solo SuperAdmin)' })
    async findAll() {
        return this.partnersService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Detalle de partner con tiendas y comerciales (Solo SuperAdmin)' })
    async findOne(@Param('id') id: string) {
        return this.partnersService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar partner (tier, max_licencias, estado...) (Solo SuperAdmin)' })
    async update(@Param('id') id: string, @Body() updateDto: UpdatePartnerDto) {
        return this.partnersService.update(id, updateDto);
    }

    @Post(':id/suspend')
    @ApiOperation({ summary: 'Suspender partner y desactivar tiendas en cascada (Solo SuperAdmin)' })
    async suspend(@Param('id') id: string) {
        return this.partnersService.suspend(id);
    }
}
