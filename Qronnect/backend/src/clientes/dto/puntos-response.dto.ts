import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para una compra en el historial
 */
export class CompraHistorialDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '2024-03-20T14:45:00Z' })
  fecha: string;

  @ApiProperty({ example: 25.5 })
  importe: number;

  @ApiProperty({ example: 25 })
  puntos_otorgados: number;

  @ApiProperty({ example: 'Compra de productos varios', required: false })
  notas?: string;
}

/**
 * DTO de respuesta con puntos y compras del cliente
 */
export class PuntosResponseDto {
  @ApiProperty({
    description: 'Puntos totales acumulados por el cliente',
    example: 150,
  })
  puntos_totales: number;

  @ApiProperty({
    description: 'Últimas compras realizadas (máximo 10)',
    type: [CompraHistorialDto],
  })
  ultima_compras: CompraHistorialDto[];
}
