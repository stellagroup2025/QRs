import { IsInt, IsObject, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActualizarProgresoDto {
  @ApiProperty({
    description: 'Número del paso completado (1-5)',
    minimum: 1,
    maximum: 5,
    example: 1,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  paso: number;

  @ApiProperty({
    description: 'Datos del paso (branding elegido, config de puntos, etc.)',
    required: false,
    example: {
      color_primario: '#0ea5e9',
      color_secundario: '#6366f1',
      logo_url: '/uploads/logo-123.png',
    },
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}
