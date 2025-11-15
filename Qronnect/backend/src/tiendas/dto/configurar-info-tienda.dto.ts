import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsObject,
  ValidateNested,
  IsBoolean,
  Matches,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para los horarios de un día específico
 */
export class HorarioDiaDto {
  @ApiProperty({ description: 'Si la tienda abre este día', example: true })
  @IsBoolean()
  abierto: boolean;

  @ApiPropertyOptional({
    description: 'Hora de apertura (formato HH:MM)',
    example: '09:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'La hora debe estar en formato HH:MM',
  })
  apertura?: string | null;

  @ApiPropertyOptional({
    description: 'Hora de cierre (formato HH:MM)',
    example: '20:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'La hora debe estar en formato HH:MM',
  })
  cierre?: string | null;
}

/**
 * DTO para los horarios de toda la semana
 */
export class HorariosDto {
  @ApiProperty({ type: HorarioDiaDto })
  @ValidateNested()
  @Type(() => HorarioDiaDto)
  lunes: HorarioDiaDto;

  @ApiProperty({ type: HorarioDiaDto })
  @ValidateNested()
  @Type(() => HorarioDiaDto)
  martes: HorarioDiaDto;

  @ApiProperty({ type: HorarioDiaDto })
  @ValidateNested()
  @Type(() => HorarioDiaDto)
  miercoles: HorarioDiaDto;

  @ApiProperty({ type: HorarioDiaDto })
  @ValidateNested()
  @Type(() => HorarioDiaDto)
  jueves: HorarioDiaDto;

  @ApiProperty({ type: HorarioDiaDto })
  @ValidateNested()
  @Type(() => HorarioDiaDto)
  viernes: HorarioDiaDto;

  @ApiProperty({ type: HorarioDiaDto })
  @ValidateNested()
  @Type(() => HorarioDiaDto)
  sabado: HorarioDiaDto;

  @ApiProperty({ type: HorarioDiaDto })
  @ValidateNested()
  @Type(() => HorarioDiaDto)
  domingo: HorarioDiaDto;
}

/**
 * DTO para las redes sociales
 */
export class RedesSocialesDto {
  @ApiPropertyOptional({
    description: 'URL del perfil de Facebook',
    example: 'https://facebook.com/mitienda',
  })
  @IsOptional()
  @IsUrl()
  facebook?: string | null;

  @ApiPropertyOptional({
    description: 'URL del perfil de Instagram',
    example: 'https://instagram.com/mitienda',
  })
  @IsOptional()
  @IsUrl()
  instagram?: string | null;

  @ApiPropertyOptional({
    description: 'URL del perfil de Twitter/X',
    example: 'https://twitter.com/mitienda',
  })
  @IsOptional()
  @IsUrl()
  twitter?: string | null;

  @ApiPropertyOptional({
    description: 'URL del perfil de LinkedIn',
    example: 'https://linkedin.com/company/mitienda',
  })
  @IsOptional()
  @IsUrl()
  linkedin?: string | null;

  @ApiPropertyOptional({
    description: 'URL del perfil de TikTok',
    example: 'https://tiktok.com/@mitienda',
  })
  @IsOptional()
  @IsUrl()
  tiktok?: string | null;
}

/**
 * DTO para configurar la información de la tienda
 */
export class ConfigurarInfoTiendaDto {
  @ApiPropertyOptional({
    description: 'Descripción de la tienda',
    example: 'Tu tienda de confianza desde 1990',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'URL del sitio web de la tienda',
    example: 'https://www.mitienda.com',
  })
  @IsOptional()
  @IsUrl()
  sitio_web?: string;

  @ApiPropertyOptional({
    description: 'Número de WhatsApp (incluye código de país)',
    example: '+34600000000',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+\d{10,15}$/, {
    message:
      'El número de WhatsApp debe incluir el código de país (ej: +34600000000)',
  })
  whatsapp?: string;

  @ApiPropertyOptional({
    description: 'URL de Google Maps o coordenadas',
    example: 'https://maps.google.com/?q=40.416775,-3.703790',
  })
  @IsOptional()
  @IsString()
  ubicacion_maps?: string;

  @ApiPropertyOptional({
    description: 'Horarios de apertura y cierre por día de la semana',
    type: HorariosDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => HorariosDto)
  @IsObject()
  horarios?: HorariosDto;

  @ApiPropertyOptional({
    description: 'URLs de perfiles en redes sociales',
    type: RedesSocialesDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RedesSocialesDto)
  @IsObject()
  redes_sociales?: RedesSocialesDto;
}
