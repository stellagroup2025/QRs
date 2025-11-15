import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class RecompensaReferidoDto {
  @ApiProperty({ description: 'Objetivo de referidos para obtener esta recompensa', example: 5 })
  @IsNumber()
  @IsNotEmpty()
  objetivo: number;

  @ApiProperty({ description: 'Tipo de recompensa', enum: ['puntos', 'cupon', 'promocion'], example: 'puntos' })
  @IsString()
  @IsNotEmpty()
  tipo: 'puntos' | 'cupon' | 'promocion';

  @ApiProperty({ description: 'Valor de la recompensa (puntos, % descuento, etc.)', example: 500 })
  @IsNumber()
  @IsNotEmpty()
  valor: number;

  @ApiProperty({ description: 'Descripción de la recompensa', example: '500 puntos bonus', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;
}

export class CrearProgramaReferidosDto {
  @ApiProperty({ description: 'Nombre del programa', example: 'Trae un amigo' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'Descripción del programa', required: false })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ description: 'Si el programa está activo', default: true })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @ApiProperty({ description: 'Puntos otorgados por cada referido', example: 100 })
  @IsNumber()
  @IsNotEmpty()
  puntos_por_referido: number;

  @ApiProperty({
    description: 'Array de recompensas por objetivos',
    type: [RecompensaReferidoDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecompensaReferidoDto)
  @IsOptional()
  recompensas?: RecompensaReferidoDto[];

  @ApiProperty({ description: 'Fecha de inicio de vigencia', required: false })
  @IsDateString()
  @IsOptional()
  vigencia_desde?: string;

  @ApiProperty({ description: 'Fecha de fin de vigencia', required: false })
  @IsDateString()
  @IsOptional()
  vigencia_hasta?: string;
}
