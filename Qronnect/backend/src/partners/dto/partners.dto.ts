import { IsString, IsEmail, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PartnerTier {
    BRONZE = 'bronze',
    SILVER = 'silver',
    GOLD = 'gold',
}

export enum PartnerEstado {
    ACTIVO = 'activo',
    SUSPENDIDO = 'suspendido',
    INACTIVO = 'inactivo',
}

export class CreatePartnerDto {
    @ApiProperty({ description: 'Nombre del partner / agencia' })
    @IsString()
    nombre: string;

    @ApiPropertyOptional({ description: 'CIF / NIF del partner' })
    @IsOptional()
    @IsString()
    cif?: string;

    @ApiProperty({ description: 'Email de contacto principal' })
    @IsEmail()
    email_contacto: string;

    @ApiPropertyOptional({ description: 'Teléfono de contacto' })
    @IsOptional()
    @IsString()
    telefono?: string;

    @ApiPropertyOptional({ description: 'Dirección fiscal' })
    @IsOptional()
    @IsString()
    direccion?: string;

    @ApiPropertyOptional({ enum: PartnerTier, default: PartnerTier.BRONZE })
    @IsOptional()
    @IsEnum(PartnerTier)
    tier?: PartnerTier;

    @ApiPropertyOptional({ description: 'Máximo de licencias (tiendas)', default: 5 })
    @IsOptional()
    @IsInt()
    @Min(1)
    max_licencias?: number;

    @ApiPropertyOptional({ description: 'Notas internas' })
    @IsOptional()
    @IsString()
    notas?: string;
}

export class UpdatePartnerDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    nombre?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    cif?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    email_contacto?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    telefono?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    direccion?: string;

    @ApiPropertyOptional({ enum: PartnerTier })
    @IsOptional()
    @IsEnum(PartnerTier)
    tier?: PartnerTier;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(1)
    max_licencias?: number;

    @ApiPropertyOptional({ enum: PartnerEstado })
    @IsOptional()
    @IsEnum(PartnerEstado)
    estado?: PartnerEstado;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notas?: string;
}
