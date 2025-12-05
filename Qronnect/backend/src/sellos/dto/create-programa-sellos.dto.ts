import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, IsObject, Min, IsHexColor, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TipoPremioSello {
  PRODUCTO = 'producto',
  DESCUENTO_PORCENTAJE = 'descuento_porcentaje',
  DESCUENTO_FIJO = 'descuento_fijo',
  PUNTOS = 'puntos',
  TEXTO = 'texto',
}

export class PremioDetallesProductoDto {
  @ApiProperty({ description: 'Nombre del producto', example: 'Café gratis' })
  nombre: string;

  @ApiPropertyOptional({ description: 'Descripción del producto', example: 'Un café de cualquier tamaño' })
  descripcion?: string;

  @ApiPropertyOptional({ description: 'URL de imagen del producto' })
  imagen?: string;
}

export class PremioDetallesDescuentoPorcentajeDto {
  @ApiProperty({ description: 'Porcentaje de descuento', example: 20 })
  porcentaje: number;

  @ApiPropertyOptional({ description: 'Descuento máximo en euros', example: 10 })
  max_descuento?: number;
}

export class PremioDetallesDescuentoFijoDto {
  @ApiProperty({ description: 'Monto fijo de descuento', example: 5.00 })
  monto: number;

  @ApiPropertyOptional({ description: 'Moneda', example: 'EUR', default: 'EUR' })
  moneda?: string;
}

export class PremioDetallesPuntosDto {
  @ApiProperty({ description: 'Cantidad de puntos a otorgar', example: 100 })
  puntos: number;
}

export class PremioDetallesTextoDto {
  @ApiProperty({ description: 'Descripción textual del premio', example: 'Postre del día gratis' })
  texto: string;

  @ApiPropertyOptional({ description: 'Instrucciones adicionales', example: 'Válido de lunes a viernes' })
  instrucciones?: string;
}

export class CreateProgramaSellosDto {
  @ApiProperty({ description: 'Nombre del programa', example: 'Cafetería - 10 cafés' })
  @IsString()
  nombre: string;

  @ApiPropertyOptional({ description: 'Descripción del programa', example: 'Compra 10 cafés y llévate el 11º gratis' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'Icono del programa (lucide-react)', example: 'coffee', default: 'stamp' })
  @IsString()
  @IsOptional()
  icono?: string;

  @ApiPropertyOptional({ description: 'URL de imagen del programa' })
  @IsString()
  @IsOptional()
  imagen_url?: string;

  @ApiPropertyOptional({ description: 'Color hex para la tarjeta', example: '#3B82F6', default: '#3B82F6' })
  @IsHexColor()
  @IsOptional()
  color?: string;

  @ApiProperty({ description: 'Número de sellos requeridos para completar', example: 10, minimum: 1 })
  @IsNumber()
  @Min(1)
  sellos_requeridos: number;

  @ApiProperty({ description: 'Tipo de premio', enum: TipoPremioSello, example: TipoPremioSello.PRODUCTO })
  @IsEnum(TipoPremioSello)
  tipo_premio: TipoPremioSello;

  @ApiProperty({
    description: 'Detalles del premio según el tipo',
    example: { nombre: 'Café gratis', descripcion: 'Un café de cualquier tamaño' }
  })
  @IsObject()
  premio_detalles: PremioDetallesProductoDto | PremioDetallesDescuentoPorcentajeDto | PremioDetallesDescuentoFijoDto | PremioDetallesPuntosDto | PremioDetallesTextoDto;

  @ApiPropertyOptional({
    description: 'Instrucciones de canje',
    example: 'Presenta este cupón al personal para canjearlo',
    default: 'Presenta este cupón al personal para canjearlo'
  })
  @IsString()
  @IsOptional()
  instrucciones_canje?: string;

  @ApiPropertyOptional({ description: 'Días de validez del cupón generado', example: 30, default: 30 })
  @IsNumber()
  @IsOptional()
  dias_validez_cupon?: number;

  @ApiPropertyOptional({ description: 'Máximo de sellos por día', example: 1, default: 1 })
  @IsNumber()
  @IsOptional()
  sellos_por_dia_max?: number;

  @ApiPropertyOptional({ description: 'Requiere compra mínima', default: false })
  @IsBoolean()
  @IsOptional()
  requiere_compra_minima?: boolean;

  @ApiPropertyOptional({ description: 'Monto de compra mínima', example: 5.00 })
  @IsNumber()
  @IsOptional()
  compra_minima?: number;

  @ApiPropertyOptional({ description: 'Programa activo', default: true })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @ApiPropertyOptional({ description: 'Visible para clientes', default: true })
  @IsBoolean()
  @IsOptional()
  visible_cliente?: boolean;

  @ApiPropertyOptional({ description: 'Fecha de inicio del programa (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  fecha_inicio?: string;

  @ApiPropertyOptional({ description: 'Fecha de fin del programa (ISO 8601)' })
  @IsDateString()
  @IsOptional()
  fecha_fin?: string;
}
