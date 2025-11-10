import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta para preview de destinatarios
 * Muestra cuántos clientes recibirán la campaña según los filtros
 */
export class PreviewDestinatariosDto {
  @ApiProperty({
    description: 'Número total de destinatarios que cumplen los filtros',
    example: 150,
  })
  total_destinatarios: number;

  @ApiProperty({
    description: 'Lista de ejemplos de clientes (primeros 10)',
    type: 'array',
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        puntos_totales: 250,
        num_compras: 5,
        ticket_medio: 45.50,
        ultima_visita: '2025-10-15',
      },
    ],
  })
  ejemplos: Array<{
    id: string;
    nombre: string;
    email: string;
    puntos_totales: number;
    num_compras: number;
    ticket_medio: number;
    ultima_visita: string;
  }>;
}
