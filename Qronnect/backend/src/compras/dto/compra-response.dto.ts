import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de respuesta al registrar una compra
 */
export class CompraResponseDto {
  @ApiProperty({
    description: 'ID de la compra registrada',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  compra_id: string;

  @ApiProperty({
    description: 'Datos básicos del cliente',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      nombre: 'Juan Pérez',
      email: 'juan@ejemplo.com',
    },
  })
  cliente: {
    id: string;
    nombre?: string;
    email?: string;
  };

  @ApiProperty({
    description: 'Importe de la compra',
    example: 25.5,
  })
  importe: number;

  @ApiPropertyOptional({
    description: 'Descuento aplicado (si se usó un cupón)',
    example: 5.0,
  })
  descuento_aplicado?: number;

  @ApiPropertyOptional({
    description: 'Cupón usado en esta compra',
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      titulo: '5€ de descuento',
    },
  })
  cupon_usado?: {
    id: string;
    titulo: string;
  };

  @ApiProperty({
    description: 'Puntos otorgados por esta compra',
    example: 25,
  })
  puntos_otorgados: number;

  @ApiProperty({
    description: 'Puntos totales del cliente después de esta compra',
    example: 125,
  })
  puntos_totales_cliente: number;

  @ApiProperty({
    description: 'Fecha de la compra',
    example: '2024-03-20T14:45:00Z',
  })
  fecha: string;
}
