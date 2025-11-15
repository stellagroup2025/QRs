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

export enum TipoPromocion {
  DESCUENTO_FIJO = 'descuento_fijo',
  DESCUENTO_PORCENTAJE = 'descuento_porcentaje',
  PRODUCTO_GRATIS = 'producto_gratis',
}

export class CreatePromocionDto {
  @ApiProperty({
    description: 'Título de la promoción',
    example: '10€ de descuento en tu próxima compra',
  })
  @IsString()
  @MinLength(3)
  titulo: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada de la promoción',
    example: 'Canjea 100 puntos y obtén 10€ de descuento en compras superiores a 50€',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({
    description: 'Tipo de promoción',
    enum: TipoPromocion,
    example: TipoPromocion.DESCUENTO_FIJO,
  })
  @IsEnum(TipoPromocion)
  tipo: TipoPromocion;

  @ApiProperty({
    description:
      'Valor del descuento (euros para descuento_fijo, porcentaje para descuento_porcentaje)',
    example: 10,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  valor: number;

  @ApiProperty({
    description: 'Puntos requeridos para canjear',
    example: 100,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  puntos_requeridos: number;

  @ApiPropertyOptional({
    description: 'URL de la imagen de la promoción',
    example: 'https://example.com/promo.jpg',
  })
  @IsOptional()
  @IsString()
  imagen_url?: string;

  @ApiPropertyOptional({
    description: 'Estado de la promoción',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({
    description: 'Fecha de inicio de la promoción (ISO 8601)',
    example: '2025-11-10T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @ApiPropertyOptional({
    description:
      'Fecha de fin de la promoción (ISO 8601). Si no se especifica, la promoción no expira',
    example: '2025-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @ApiPropertyOptional({
    description: 'Cantidad máxima de canjes disponibles (null = ilimitado)',
    example: 50,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cantidad_disponible?: number;
}
