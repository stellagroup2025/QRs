import { IsOptional, IsNumber, IsString, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para filtros de segmentación de clientes
 * Permite filtrar clientes por múltiples criterios para crear campañas dirigidas
 */
export class FiltrosSegmentacionDto {
  // Filtro por ticket medio (importe promedio por compra)
  @ApiProperty({
    description: 'Ticket medio mínimo (€)',
    example: 50,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  ticket_medio_min?: number;

  @ApiProperty({
    description: 'Ticket medio máximo (€)',
    example: 200,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  ticket_medio_max?: number;

  // Filtro por cantidad de visitas/compras
  @ApiProperty({
    description: 'Número mínimo de visitas/compras',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  num_visitas_min?: number;

  @ApiProperty({
    description: 'Número máximo de visitas/compras',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  num_visitas_max?: number;

  // Filtro por edad
  @ApiProperty({
    description: 'Edad mínima del cliente',
    example: 18,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  edad_min?: number;

  @ApiProperty({
    description: 'Edad máxima del cliente',
    example: 65,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  edad_max?: number;

  // Filtro por última visita (días desde la última compra)
  @ApiProperty({
    description: 'Días mínimos desde la última visita',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dias_desde_ultima_visita_min?: number;

  @ApiProperty({
    description: 'Días máximos desde la última visita',
    example: 90,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dias_desde_ultima_visita_max?: number;

  // Filtro por puntos acumulados
  @ApiProperty({
    description: 'Puntos mínimos acumulados',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  puntos_min?: number;

  @ApiProperty({
    description: 'Puntos máximos acumulados',
    example: 1000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  puntos_max?: number;

  // Filtro por género (si está disponible)
  @ApiProperty({
    description: 'Género del cliente',
    example: 'mujer',
    required: false,
    enum: ['hombre', 'mujer', 'otro', 'no_especificado'],
  })
  @IsOptional()
  @IsEnum(['hombre', 'mujer', 'otro', 'no_especificado'])
  genero?: string;
}
