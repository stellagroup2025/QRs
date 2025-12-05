import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min, MaxLength, Matches } from 'class-validator';

export class ConfigurarGachaDto {
  @ApiProperty({ description: 'Si el sistema gacha está activo', example: true })
  @IsBoolean()
  activo: boolean;

  @ApiProperty({ description: 'Costo en puntos por tirada', example: 50, minimum: 1 })
  @IsInt()
  @Min(1)
  costo_puntos: number;

  @ApiPropertyOptional({ description: 'Nombre del gacha', example: 'Máquina de Premios' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({ description: 'Descripción del gacha' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'Máximo de tiradas por día (null = sin límite)', example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  max_tiradas_por_dia?: number | null;

  @ApiPropertyOptional({ description: 'Minutos de espera entre tiradas (null = sin cooldown)', example: 60 })
  @IsOptional()
  @IsInt()
  @Min(1)
  cooldown_minutos?: number | null;

  @ApiPropertyOptional({ description: 'Color primario en formato hex', example: '#FF6B9D' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, { message: 'Debe ser un color hex válido (ej: #FF6B9D)' })
  color_primario?: string;

  @ApiPropertyOptional({ description: 'Icono del gacha', example: '🎰' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icono?: string;
}
