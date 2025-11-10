import { IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para solicitar análisis de KPIs con IA
 */
export class KpiAnalysisRequestDto {
  @ApiProperty({
    description: 'Fecha de inicio del período a analizar (ISO 8601)',
    example: '2025-10-01T00:00:00Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @ApiProperty({
    description: 'Fecha de fin del período a analizar (ISO 8601)',
    example: '2025-10-31T23:59:59Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  toDate?: string;
}
