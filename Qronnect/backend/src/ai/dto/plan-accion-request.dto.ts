import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PlanAccionRequestDto {
  @ApiProperty({
    description: 'Texto de la recomendación a evaluar',
    example: 'Lanza una campaña de reactivación para clientes inactivos de más de 60 días',
  })
  @IsString()
  recomendacion: string;

  @ApiPropertyOptional({
    description: 'Contexto adicional de la recomendación',
    example: 'campaña de reactivación a clientes inactivos 60+ días',
  })
  @IsString()
  @IsOptional()
  contexto?: string;

  @ApiPropertyOptional({
    description: 'Tipo de acción sugerida por la IA',
    enum: ['campana_email', 'promocion', 'ambas', 'ninguna'],
    example: 'campana_email',
  })
  @IsEnum(['campana_email', 'promocion', 'ambas', 'ninguna'])
  @IsOptional()
  tipo_accion?: 'campana_email' | 'promocion' | 'ambas' | 'ninguna';
}
