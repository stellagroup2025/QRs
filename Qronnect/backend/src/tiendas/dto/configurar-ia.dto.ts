import { IsString, IsOptional, IsArray, IsEnum, IsNumber, IsBoolean, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class PublicoObjetivoDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  edad_min?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  edad_max?: number;

  @ApiProperty({ required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  generos?: string[];

  @ApiProperty({ required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  intereses?: string[];
}

class UbicacionDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  barrio?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  ciudad?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  referencias_locales?: boolean;
}

export class ConfigurarIADto {
  @ApiProperty({ description: 'Tipo de negocio', example: 'gimnasio' })
  @IsString()
  tipo_negocio: string;

  @ApiProperty({ type: PublicoObjetivoDto, required: false })
  @ValidateNested()
  @Type(() => PublicoObjetivoDto)
  @IsOptional()
  publico_objetivo?: PublicoObjetivoDto;

  @ApiProperty({ example: ['motivacion', 'comunidad', 'resultados'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  valores_marca?: string[];

  @ApiProperty({ enum: ['formal', 'casual', 'juvenil', 'motivador', 'elegante'], required: false })
  @IsEnum(['formal', 'casual', 'juvenil', 'motivador', 'elegante'])
  @IsOptional()
  tono_comunicacion?: 'formal' | 'casual' | 'juvenil' | 'motivador' | 'elegante';

  @ApiProperty({ example: ['Clases de CrossFit', 'Entrenamiento personal'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  productos_principales?: string[];

  @ApiProperty({ enum: ['economico', 'medio', 'premium', 'lujo'], required: false })
  @IsEnum(['economico', 'medio', 'premium', 'lujo'])
  @IsOptional()
  rango_precios?: 'economico' | 'medio' | 'premium' | 'lujo';

  @ApiProperty({ type: UbicacionDto, required: false })
  @ValidateNested()
  @Type(() => UbicacionDto)
  @IsOptional()
  ubicacion?: UbicacionDto;

  @ApiProperty({ example: ['Black Friday - Noviembre'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  promociones_recurrentes?: string[];

  @ApiProperty({ example: 'Tu mejor versión comienza aquí', required: false })
  @IsString()
  @IsOptional()
  slogan?: string;

  @ApiProperty({ example: ['#GymFitMadrid'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  hashtags?: string[];
}
