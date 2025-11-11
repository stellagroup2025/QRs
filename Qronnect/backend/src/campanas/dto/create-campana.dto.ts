import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, ValidateNested, IsUUID, IsArray, IsBoolean } from 'class-validator';
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
    description: 'Estado de la campaña',
    enum: ['borrador', 'programada', 'enviando', 'enviada', 'cancelada'],
    default: 'borrador',
    required: false,
  })
  @IsEnum(['borrador', 'programada', 'enviando', 'enviada', 'cancelada'])
  @IsOptional()
  estado?: 'borrador' | 'programada' | 'enviando' | 'enviada' | 'cancelada';

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

  @ApiProperty({
    description: 'Array de IDs de clientes seleccionados manualmente (opcional, tiene prioridad sobre filtros)',
    example: ['123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001'],
    required: false,
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  destinatarios_ids?: string[];

  @ApiProperty({
    description: 'Tipo de campaña',
    enum: ['promocional', 'bienvenida', 'cumpleanos', 'reactivacion', 'abandono', 'fidelizacion', 'informativa'],
    default: 'promocional',
    required: false,
  })
  @IsEnum(['promocional', 'bienvenida', 'cumpleanos', 'reactivacion', 'abandono', 'fidelizacion', 'informativa'])
  @IsOptional()
  tipo?: 'promocional' | 'bienvenida' | 'cumpleanos' | 'reactivacion' | 'abandono' | 'fidelizacion' | 'informativa';

  @ApiProperty({
    description: 'Si es true, cada cliente solo puede recibir esta campaña una vez',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  envio_unico?: boolean;
}
