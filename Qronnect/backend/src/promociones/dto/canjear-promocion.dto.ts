import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

/**
 * DTO para canjear una promoción por parte del cliente
 */
export class CanjearPromocionDto {
  @ApiProperty({
    description: 'ID de la promoción a canjear',
    example: 'e25c0d2d-d81e-4d77-95d8-1a167a553c3d',
  })
  @IsUUID()
  id_promocion: string;
}

/**
 * DTO de respuesta cuando se canjea una promoción
 */
export class CanjeResponseDto {
  @ApiProperty({ description: 'ID del canje generado' })
  id: string;

  @ApiProperty({ description: 'ID del cliente' })
  id_cliente: string;

  @ApiProperty({ description: 'ID de la promoción canjeada' })
  id_promocion: string;

  @ApiProperty({ description: 'Información de la promoción' })
  promocion: {
    titulo: string;
    descripcion: string;
    tipo: string;
    valor: number;
  };

  @ApiProperty({ description: 'Puntos usados en el canje' })
  puntos_usados: number;

  @ApiProperty({ description: 'Puntos restantes del cliente' })
  puntos_restantes: number;

  @ApiProperty({ description: 'Estado del canje' })
  estado: string;

  @ApiProperty({ description: 'Código único para validar en tienda' })
  codigo_canje: string;

  @ApiProperty({ description: 'Fecha del canje' })
  fecha_canje: string;

  @ApiPropertyOptional({ description: 'Fecha de expiración del cupón' })
  fecha_expiracion?: string;
}
