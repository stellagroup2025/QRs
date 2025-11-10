import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Representa un punto de datos en una serie temporal
 */
export class DataPoint {
  @ApiProperty({ description: 'Fecha del punto de datos', example: '2025-11-01' })
  fecha: string;

  @ApiProperty({ description: 'Valor del punto de datos', example: 125.5 })
  valor: number;
}

/**
 * Representa un cliente en el ranking
 */
export class TopCliente {
  @ApiProperty({ description: 'ID del cliente' })
  id: string;

  @ApiProperty({ description: 'Nombre del cliente' })
  nombre: string;

  @ApiProperty({ description: 'Email del cliente' })
  email: string;

  @ApiProperty({ description: 'Total gastado' })
  total_gastado: number;

  @ApiProperty({ description: 'Número de compras' })
  num_compras: number;

  @ApiProperty({ description: 'Puntos totales' })
  puntos_totales: number;
}

/**
 * Representa un rango de puntos con el número de clientes
 */
export class RangoPuntos {
  @ApiProperty({ description: 'Etiqueta del rango', example: '0-50 puntos' })
  rango: string;

  @ApiProperty({ description: 'Número de clientes en este rango' })
  clientes: number;

  @ApiProperty({ description: 'Color para el gráfico (opcional)' })
  color?: string;
}

/**
 * DTO de respuesta con analytics del dashboard
 */
export class AnalyticsDto {
  @ApiProperty({
    description: 'Evolución de clientes nuevos por día',
    type: [DataPoint],
  })
  evolucion_clientes: DataPoint[];

  @ApiProperty({
    description: 'Evolución de facturación por día',
    type: [DataPoint],
  })
  evolucion_facturacion: DataPoint[];

  @ApiProperty({
    description: 'Distribución de clientes por rango de puntos',
    type: [RangoPuntos],
  })
  distribucion_puntos: RangoPuntos[];

  @ApiProperty({
    description: 'Top 10 clientes por facturación',
    type: [TopCliente],
  })
  top_clientes: TopCliente[];

  @ApiProperty({
    description: 'Tasa de retención (% de clientes que han regresado)',
    example: 65.5,
  })
  tasa_retencion: number;

  @ApiProperty({
    description: 'Frecuencia de visita promedio (días entre visitas)',
    example: 14.2,
  })
  frecuencia_visita_promedio: number;

  @ApiProperty({
    description: 'Cambio porcentual de clientes vs periodo anterior',
    example: 12.5,
  })
  cambio_clientes_pct: number;

  @ApiProperty({
    description: 'Cambio porcentual de facturación vs periodo anterior',
    example: -5.3,
  })
  cambio_facturacion_pct: number;

  @ApiProperty({
    description: 'Cambio porcentual de ticket medio vs periodo anterior',
    example: 8.1,
  })
  cambio_ticket_medio_pct: number;
}

/**
 * DTO para query params del endpoint de analytics
 */
export class AnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'Periodo de análisis',
    enum: ['7d', '30d', '90d'],
    default: '30d',
  })
  periodo?: '7d' | '30d' | '90d' = '30d';
}
