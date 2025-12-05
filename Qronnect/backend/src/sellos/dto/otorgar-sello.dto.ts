import { IsUUID, IsOptional, IsNumber, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OtorgarSelloDto {
  @ApiProperty({ description: 'ID del cliente', example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  id_cliente: string;

  @ApiProperty({ description: 'ID del programa de sellos', example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsUUID()
  id_programa: string;

  @ApiPropertyOptional({ description: 'ID de la compra asociada (opcional)' })
  @IsUUID()
  @IsOptional()
  id_compra?: string;

  @ApiPropertyOptional({ description: 'Monto de la compra asociada (opcional)', example: 4.50 })
  @IsNumber()
  @IsOptional()
  monto_compra?: number;

  @ApiPropertyOptional({ description: 'Notas adicionales', example: 'Cliente frecuente' })
  @IsString()
  @IsOptional()
  notas?: string;
}
