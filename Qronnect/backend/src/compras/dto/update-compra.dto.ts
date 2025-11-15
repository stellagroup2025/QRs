import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para actualizar una compra existente
 * Solo se pueden modificar algunos campos (importe y notas)
 */
export class UpdateCompraDto {
  @ApiPropertyOptional({
    description:
      'Nuevo importe de la compra. Al modificar el importe, los puntos se recalcularán automáticamente.',
    example: 75.5,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El importe debe ser un número válido' })
  @Min(0.01, { message: 'El importe debe ser mayor a 0' })
  importe?: number;

  @ApiPropertyOptional({
    description: 'Notas o comentarios sobre la compra',
    example: 'Corrección de importe por devolución parcial',
  })
  @IsOptional()
  @IsString()
  notas?: string;
}
