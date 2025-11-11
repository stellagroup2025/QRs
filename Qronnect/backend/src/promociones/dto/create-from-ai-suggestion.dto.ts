import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsDateString,
  Min,
  MinLength,
} from 'class-validator';
import { TipoPromocion } from './create-promocion.dto';

/**
 * DTO para crear una promoción automáticamente desde una sugerencia de IA
 * Permite sobrescribir valores o usar valores por defecto inteligentes
 */
export class CreateFromAiSuggestionDto {
  @ApiProperty({
    description: 'Título de la promoción (de la sugerencia de IA)',
    example: '2x1 en cortes de cabello los martes',
  })
  @IsString()
  @MinLength(3)
  titulo: string;

  @ApiProperty({
    description: 'Descripción de la promoción (de la sugerencia de IA)',
    example: 'Ofrece un corte gratis por cada corte pagado todos los martes...',
  })
  @IsString()
  descripcion: string;

  @ApiPropertyOptional({
    description: 'Condiciones de la promoción (de la sugerencia de IA)',
    example: 'Válido solo los martes. Reserva con antelación...',
  })
  @IsOptional()
  @IsString()
  condiciones?: string;

  @ApiPropertyOptional({
    description: 'Mensaje para WhatsApp (de la sugerencia de IA)',
    example: '🎉 ¡2x1 en cortes todos los martes! Reserva ya...',
  })
  @IsOptional()
  @IsString()
  mensajeWhatsApp?: string;

  @ApiPropertyOptional({
    description: 'Texto para cartel (de la sugerencia de IA)',
    example: '¡MARTES 2X1! 💈 Paga 1 y llévate 2 cortes',
  })
  @IsOptional()
  @IsString()
  textoCartel?: string;

  @ApiPropertyOptional({
    description: 'Estimado de impacto (de la sugerencia de IA)',
    example: 'Puede incrementar visitas los martes en un 40-60%...',
  })
  @IsOptional()
  @IsString()
  estimadoImpacto?: string;

  // Campos editables/sobrescribibles para la promoción

  @ApiPropertyOptional({
    description: 'Tipo de promoción. Si no se especifica, se intenta inferir de la descripción',
    enum: TipoPromocion,
    example: TipoPromocion.DESCUENTO_PORCENTAJE,
  })
  @IsOptional()
  @IsEnum(TipoPromocion)
  tipo?: TipoPromocion;

  @ApiPropertyOptional({
    description: 'Valor del descuento. Si no se especifica, se usa un valor por defecto según el tipo',
    example: 50,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  valor?: number;

  @ApiPropertyOptional({
    description: 'Puntos requeridos para canjear. Si no se especifica, se calcula automáticamente',
    example: 200,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  puntos_requeridos?: number;

  @ApiPropertyOptional({
    description: 'URL de la imagen de la promoción',
    example: 'https://example.com/promo.jpg',
  })
  @IsOptional()
  @IsString()
  imagen_url?: string;

  @ApiPropertyOptional({
    description: 'Estado de la promoción (por defecto false para crear borrador)',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({
    description: 'Fecha de inicio de la promoción (ISO 8601). Si no se especifica, se usa la fecha actual',
    example: '2025-11-12T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin de la promoción (ISO 8601). Si no se especifica, se calcula 30 días después',
    example: '2025-12-12T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @ApiPropertyOptional({
    description: 'Cantidad máxima de canjes disponibles (null = ilimitado)',
    example: 100,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cantidad_disponible?: number;
}
