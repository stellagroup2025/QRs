import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ComercialesService } from './comerciales.service';
import { LoginComercialDto, CreateComercialDto } from './dto/comerciales.dto';
import { SuperAdminGuard } from '../superadmin/guards/superadmin.guard';
import { ComercialAuthGuard } from './guards/comercial-auth.guard';

@ApiTags('Comerciales')
@Controller('comerciales')
export class ComercialesController {
    constructor(private readonly comercialesService: ComercialesService) { }

    @Post('auth/login')
    @ApiOperation({ summary: 'Login para agentes comerciales' })
    @ApiResponse({ status: 200, description: 'Login exitoso' })
    @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
    async login(@Body() loginDto: LoginComercialDto) {
        return this.comercialesService.login(loginDto);
    }

    @Post()
    @UseGuards(SuperAdminGuard)
    @ApiBearerAuth('JWT-SuperAdmin')
    @ApiOperation({ summary: 'Crear nuevo comercial (Solo SuperAdmin)' })
    @ApiResponse({ status: 201, description: 'Comercial creado' })
    async create(@Body() createDto: CreateComercialDto) {
        return this.comercialesService.create(createDto);
    }

    @Get()
    @UseGuards(SuperAdminGuard)
    @ApiBearerAuth('JWT-SuperAdmin')
    @ApiOperation({ summary: 'Listar comerciales y sus métricas (Solo SuperAdmin)' })
    async findAll() {
        return this.comercialesService.findAll();
    }

    @Post('tiendas')
    @UseGuards(ComercialAuthGuard)
    @ApiBearerAuth('JWT-Comercial')
    @ApiOperation({ summary: 'Crear tienda vinculada (Agente)' })
    async createTienda(@Body() tiendaData: any, @Request() req) {
        return this.comercialesService.createTienda(req.user.id, tiendaData);
    }
}
