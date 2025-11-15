import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  ValidateNested,
  IsUUID,
  IsArray,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { FiltrosSegmentacionDto } from './filtros-segmentacion.dto';

/**
 * DTO para crear una nueva campaña SMS
 */
export class CreateCampanaSmsDto {
  @ApiProperty({
    description: 'Nombre de la campaña',
    example: 'Campaña Black Friday SMS',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    description: 'Mensaje SMS (máximo 1600 caracteres = 10 SMS concatenados)',
    example: 'Hola {{nombre}}! 50% descuento hoy. Código: BF50',
    maxLength: 1600,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1600, {
    message: 'El mensaje no puede superar 1600 caracteres (10 SMS)',
  })
  mensaje: string;

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
    description: 'Asunto interno para organización (opcional)',
    example: 'Campaña Black Friday Noviembre',
    required: false,
  })
  @IsString()
  @IsOptional()
  asunto?: string;

  @ApiProperty({
    description: 'Nombre del remitente (visible en SMS)',
    example: 'GymFit',
    required: false,
    maxLength: 50,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  remitente_nombre?: string;

  @ApiProperty({
    description: 'Fecha programada para el envío (ISO 8601)',
    example: '2025-11-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fecha_programada?: string;

  @ApiProperty({
    description: 'Hora programada para el envío (HH:mm)',
    example: '10:00',
    required: false,
  })
  @IsString()
  @IsOptional()
  hora_programada?: string;

  @ApiProperty({
    description: 'Zona horaria para envío programado',
    example: 'Europe/Madrid',
    default: 'Europe/Madrid',
    required: false,
  })
  @IsString()
  @IsOptional()
  zona_horaria?: string;

  @ApiProperty({
    description:
      'Array de IDs de clientes seleccionados manualmente (opcional, tiene prioridad sobre filtros)',
    example: ['123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001'],
    required: false,
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  destinatarios_ids?: string[];

  @ApiProperty({
    description: 'Tipo de campaña SMS',
    enum: [
      'promocional',
      'bienvenida',
      'cumpleanos',
      'reactivacion',
      'abandono',
      'fidelizacion',
      'informativa',
      'transaccional',
    ],
    default: 'promocional',
    required: false,
  })
  @IsEnum([
    'promocional',
    'bienvenida',
    'cumpleanos',
    'reactivacion',
    'abandono',
    'fidelizacion',
    'informativa',
    'transaccional',
  ])
  @IsOptional()
  tipo?:
    | 'promocional'
    | 'bienvenida'
    | 'cumpleanos'
    | 'reactivacion'
    | 'abandono'
    | 'fidelizacion'
    | 'informativa'
    | 'transaccional';

  @ApiProperty({
    description: 'Si es true, cada cliente solo puede recibir esta campaña una vez',
    default: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  envio_unico?: boolean;
}
