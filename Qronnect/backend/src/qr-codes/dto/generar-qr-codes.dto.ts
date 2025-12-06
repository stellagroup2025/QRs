import { IsInt, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerarQrCodesDto {
  @ApiProperty({
    description: 'Cantidad de QR codes a generar',
    example: 1000,
    minimum: 1,
    maximum: 10000,
  })
  @IsInt()
  @Min(1)
  @Max(10000)
  cantidad: number;

  @ApiProperty({
    description: 'Identificador del lote (opcional)',
    example: 'LOTE-2024-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lote?: string;
}
