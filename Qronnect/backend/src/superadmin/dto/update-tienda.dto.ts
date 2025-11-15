import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsObject,
  IsBoolean,
  MinLength,
  Matches,
} from 'class-validator';

export class UpdateTiendaDto {
  @ApiPropertyOptional({
    description: 'Nombre del comercio',
    example: 'Cafetería Aroma Premium',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Dominio único para la tienda',
    example: 'cafeteria-aroma',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  dominio?: string;

  @ApiPropertyOptional({
    description: 'Dominio personalizado del cliente',
    example: 'www.cafeteriaaroma.com',
  })
  @IsOptional()
  @IsString()
  dominio_personalizado?: string;

  @ApiPropertyOptional({
    description: 'Dirección física',
  })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiPropertyOptional({
    description: 'Teléfono',
  })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({
    description: 'Email',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'URL del logo',
  })
  @IsOptional()
  @IsString()
  logo_url?: string;

  @ApiPropertyOptional({
    description: 'Color primario de la marca en formato hex',
    example: '#FF5733',
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'El color primario debe estar en formato hex válido (#RRGGBB)',
  })
  color_primario?: string;

  @ApiPropertyOptional({
    description: 'Color secundario de la marca en formato hex',
    example: '#333333',
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'El color secundario debe estar en formato hex válido (#RRGGBB)',
  })
  color_secundario?: string;

  @ApiPropertyOptional({
    description: 'Color de acento de la marca en formato hex',
    example: '#0066CC',
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'El color de acento debe estar en formato hex válido (#RRGGBB)',
  })
  color_acento?: string;

  @ApiPropertyOptional({
    description: 'Nombre comercial visible del negocio',
    example: 'Cafetería Aroma Premium',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  nombre_comercial?: string;

  @ApiPropertyOptional({
    description: 'Plan contratado',
    enum: ['basico', 'profesional', 'enterprise'],
  })
  @IsOptional()
  @IsEnum(['basico', 'profesional', 'enterprise'])
  plan?: string;

  @ApiPropertyOptional({
    description: 'Estado activo/inactivo de la tienda',
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({
    description: 'Configuración personalizada',
  })
  @IsOptional()
  @IsObject()
  configuracion?: Record<string, any>;
}
