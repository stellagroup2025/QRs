import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { FiltrosSegmentacionDto } from './filtros-segmentacion.dto';

/**
 * DTO para crear una nueva campaña de email
 */
export class CreateCampanaDto {
  @ApiProperty({
    description: 'Nombre de la campaña',
    example: 'Campaña Black Friday 2025',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    description: 'Asunto del email',
    example: '¡50% de descuento en toda la tienda!',
  })
  @IsString()
  @IsNotEmpty()
  asunto: string;

  @ApiProperty({
    description: 'Contenido HTML del email',
    example: '<html><body><h1>Hola {{nombre}}</h1><p>Tenemos una oferta especial para ti...</p></body></html>',
  })
  @IsString()
  @IsNotEmpty()
  contenido_html: string;

  @ApiProperty({
    description: 'Contenido en texto plano (opcional, para clientes sin soporte HTML)',
    required: false,
  })
  @IsString()
  @IsOptional()
  contenido_texto?: string;

  @ApiProperty({
    description: 'Filtros de segmentación para seleccionar destinatarios',
    type: FiltrosSegmentacionDto,
    required: false,
  })
  @ValidateNested()
  @Type(() => FiltrosSegmentacionDto)
  @IsOptional()
  filtros_segmentacion?: FiltrosSegmentacionDto;

  @ApiProperty({
    description: 'Estado inicial de la campaña',
    enum: ['borrador', 'programada'],
    default: 'borrador',
    required: false,
  })
  @IsEnum(['borrador', 'programada'])
  @IsOptional()
  estado?: 'borrador' | 'programada';

  @ApiProperty({
    description: 'Fecha y hora programada para el envío (ISO 8601)',
    example: '2025-11-15T10:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fecha_programada?: string;

  @ApiProperty({
    description: 'ID del template a usar (opcional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  id_template?: string;
}
