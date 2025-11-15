import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para generar campañas SMS con IA
 */
export class GenerarSmsIaDto {
  @ApiProperty({
    description: 'Descripción del negocio y contexto',
    example: 'Gimnasio boutique especializado en CrossFit y entrenamiento funcional en Madrid',
  })
  @IsString()
  @IsNotEmpty()
  contextoNegocio: string;

  @ApiProperty({
    description: 'Objetivo de la campaña SMS',
    enum: ['promocion', 'bienvenida', 'cumpleanos', 'reactivacion', 'abandono', 'fidelizacion', 'informativa'],
    example: 'promocion',
  })
  @IsEnum(['promocion', 'bienvenida', 'cumpleanos', 'reactivacion', 'abandono', 'fidelizacion', 'informativa'])
  @IsNotEmpty()
  objetivo: 'promocion' | 'bienvenida' | 'cumpleanos' | 'reactivacion' | 'abandono' | 'fidelizacion' | 'informativa';

  @ApiProperty({
    description: 'Mensaje clave que se quiere transmitir',
    example: '50% de descuento en matrícula durante noviembre',
  })
  @IsString()
  @IsNotEmpty()
  mensajeClave: string;

  @ApiProperty({
    description: 'Tono del mensaje',
    enum: ['formal', 'amigable', 'urgente', 'cercano'],
    default: 'amigable',
    required: false,
  })
  @IsEnum(['formal', 'amigable', 'urgente', 'cercano'])
  @IsOptional()
  tono?: 'formal' | 'amigable' | 'urgente' | 'cercano';

  @ApiProperty({
    description: 'Nivel de urgencia del mensaje',
    enum: ['baja', 'media', 'alta'],
    default: 'media',
    required: false,
  })
  @IsEnum(['baja', 'media', 'alta'])
  @IsOptional()
  urgencia?: 'baja' | 'media' | 'alta';

  @ApiProperty({
    description: 'Si debe incluir llamada a la acción (CTA)',
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  incluirCTA?: boolean;

  @ApiProperty({
    description: 'Variables disponibles para personalización (ej: {{nombre}}, {{puntos}})',
    example: ['{{nombre}}', '{{puntos}}'],
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  variables?: string[];
}
