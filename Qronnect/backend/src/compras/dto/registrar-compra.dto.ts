import { IsString, IsNumber, IsOptional, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para registrar una nueva compra desde el panel de admin
 * Se puede usar codigoQr (escaneado) o clienteId (búsqueda por email/teléfono)
 */
export class RegistrarCompraDto {
  @ApiPropertyOptional({
    description: 'Código QR del cliente (escaneado desde el panel)',
    example: 'Vx9kR2mP7nQ4sLt8',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  codigoQr?: string;

  @ApiPropertyOptional({
    description: 'ID del cliente (alternativa al código QR)',
    example: 'e25c0d2d-d81e-4d77-95d8-1a167a553c3d',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  clienteId?: string;

  @ApiProperty({
    description: 'Importe de la compra en euros',
    example: 25.5,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  importe: number;

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre la compra',
    example: 'Compra de productos varios',
  })
  @IsOptional()
  @IsString()
  notas?: string;
}
