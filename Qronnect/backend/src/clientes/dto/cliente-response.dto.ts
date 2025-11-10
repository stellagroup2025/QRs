import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de respuesta con los datos de un cliente
 */
export class ClienteResponseDto {
  @ApiProperty({
    description: 'ID único del cliente (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'Nombre del cliente',
    example: 'Juan Pérez',
  })
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Email del cliente',
    example: 'juan@ejemplo.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Teléfono del cliente',
    example: '+34 600 123 456',
  })
  telefono?: string;

  @ApiProperty({
    description: 'Puntos totales acumulados',
    example: 150,
  })
  puntos_totales: number;

  @ApiProperty({
    description: 'Fecha de registro del cliente',
    example: '2024-01-15T10:30:00Z',
  })
  fecha_registro: string;

  @ApiPropertyOptional({
    description: 'Fecha de la última visita/compra',
    example: '2024-03-20T14:45:00Z',
  })
  ultima_visita?: string;
}
