import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PromocionResponseDto {
  @ApiProperty({ description: 'ID único de la promoción' })
  id: string;

  @ApiProperty({ description: 'ID de la tienda' })
  id_tienda: string;

  @ApiProperty({ description: 'Título de la promoción' })
  titulo: string;

  @ApiPropertyOptional({ description: 'Descripción detallada' })
  descripcion?: string;

  @ApiProperty({ description: 'Tipo de promoción' })
  tipo: string;

  @ApiProperty({ description: 'Valor del descuento' })
  valor: number;

  @ApiProperty({ description: 'Puntos requeridos para canjear' })
  puntos_requeridos: number;

  @ApiPropertyOptional({ description: 'URL de la imagen' })
  imagen_url?: string;

  @ApiProperty({ description: 'Estado activo/inactivo' })
  activo: boolean;

  @ApiProperty({ description: 'Fecha de inicio' })
  fecha_inicio: string;

  @ApiPropertyOptional({ description: 'Fecha de fin (null = sin expiración)' })
  fecha_fin?: string;

  @ApiPropertyOptional({ description: 'Cantidad máxima disponible (null = ilimitado)' })
  cantidad_disponible?: number;

  @ApiProperty({ description: 'Cantidad ya canjeada' })
  cantidad_canjeada: number;

  @ApiProperty({ description: 'Indica si la promoción está disponible para canjear' })
  disponible: boolean;

  @ApiProperty({ description: 'Fecha de creación' })
  creado_en: string;

  @ApiProperty({ description: 'Fecha de última actualización' })
  actualizado_en: string;
}

export class ListPromocionesDto {
  @ApiProperty({ type: [PromocionResponseDto] })
  data: PromocionResponseDto[];

  @ApiProperty({ description: 'Total de promociones' })
  total: number;

  @ApiProperty({ description: 'Página actual' })
  page: number;

  @ApiProperty({ description: 'Resultados por página' })
  limit: number;
}
