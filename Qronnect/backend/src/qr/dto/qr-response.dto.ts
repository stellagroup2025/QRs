import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta con el código QR del cliente
 */
export class QrResponseDto {
  @ApiProperty({
    description: 'ID del registro QR',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Código único del QR (16 caracteres alfanuméricos)',
    example: 'Vx9kR2mP7nQ4sLt8',
  })
  codigo: string;

  @ApiProperty({
    description: 'Fecha de creación del código QR',
    example: '2024-01-15T10:30:00Z',
  })
  creado_en: string;
}
