import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';

export class ConfigureIaDto {
  @ApiProperty({
    description: 'Modo de uso de IA',
    enum: ['global', 'propio'],
    example: 'global',
  })
  @IsEnum(['global', 'propio'])
  ia_modo: 'global' | 'propio';

  @ApiPropertyOptional({
    description: 'API key propia de Gemini (requerida si modo es "propio")',
    example: 'AIzaSy...',
  })
  @IsOptional()
  @IsString()
  ia_api_key_propia?: string;

  @ApiPropertyOptional({
    description: 'Límite mensual de generaciones con IA (solo para modo global)',
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  ia_limite_mensual?: number;
}
