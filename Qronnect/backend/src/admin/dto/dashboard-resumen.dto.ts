import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta con el resumen del dashboard de la tienda
 */
export class DashboardResumenDto {
  @ApiProperty({
    description: 'Total de clientes registrados en la tienda',
    example: 250,
  })
  total_clientes: number;

  @ApiProperty({
    description: 'Clientes que han visitado en los últimos 30 días',
    example: 85,
  })
  clientes_activos_ultimos_30_dias: number;

  @ApiProperty({
    description: 'Total de compras realizadas',
    example: 1250,
  })
  total_compras: number;

  @ApiProperty({
    description: 'Suma total de ventas en euros',
    example: 15750.5,
  })
  ventas_totales: number;

  @ApiProperty({
    description: 'Ticket medio (promedio por compra)',
    example: 12.6,
  })
  ticket_medio: number;

  @ApiProperty({
    description: 'Total de puntos otorgados a todos los clientes',
    example: 15750,
  })
  puntos_otorgados_totales: number;
}
