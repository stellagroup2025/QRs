import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsBoolean, IsInt, IsOptional, Min, MaxLength, Matches, IsUrl } from 'class-validator';

export enum TipoPremioGacha {
  DESCUENTO_PORCENTAJE = 'descuento_porcentaje',
  DESCUENTO_FIJO = 'descuento_fijo',
  PRODUCTO_GRATIS = 'producto_gratis',
  PUNTOS_EXTRA = 'puntos_extra',
  SELLO_EXTRA = 'sello_extra',
}

export enum RarezaPremio {
  COMUN = 'comun',
  RARO = 'raro',
  EPICO = 'epico',
  LEGENDARIO = 'legendario',
}

export class CrearPremioGachaDto {
  @ApiProperty({ description: 'Nombre del premio', example: '10% de descuento' })
  @IsString()
  @MaxLength(200)
  nombre: string;

  @ApiPropertyOptional({ description: 'Descripción del premio' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({
    description: 'Tipo de premio',
    enum: TipoPremioGacha,
    example: TipoPremioGacha.DESCUENTO_PORCENTAJE,
  })
  @IsEnum(TipoPremioGacha)
  tipo: TipoPremioGacha;

  @ApiProperty({ description: 'Valor del premio (depende del tipo)', example: 10 })
  @IsNumber()
  @Min(0)
  valor: number;

  @ApiProperty({
    description: 'Rareza del premio (afecta probabilidad)',
    enum: RarezaPremio,
    example: RarezaPremio.RARO,
  })
  @IsEnum(RarezaPremio)
  rareza: RarezaPremio;

  @ApiPropertyOptional({ description: 'Peso para calcular probabilidad (mayor = más común)', example: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  peso?: number;

  @ApiPropertyOptional({ description: 'URL de la imagen del premio' })
  @IsOptional()
  @IsUrl()
  imagen_url?: string;

  @ApiPropertyOptional({ description: 'Color hex para la rareza', example: '#3498DB' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  color_rareza?: string;

  @ApiPropertyOptional({ description: 'Condiciones para canjear el premio' })
  @IsOptional()
  @IsString()
  condiciones?: string;

  @ApiPropertyOptional({ description: 'Días de validez del premio', example: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  dias_validez?: number;

  @ApiPropertyOptional({ description: 'Si el premio está activo', example: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({ description: 'Si el premio tiene stock limitado', example: false })
  @IsOptional()
  @IsBoolean()
  stock_limitado?: boolean;

  @ApiPropertyOptional({ description: 'Stock actual (si es limitado)', example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock_actual?: number;
}
