import { ApiProperty } from '@nestjs/swagger';

export class ProgresoResponseDto {
  @ApiProperty({ description: 'UUID del progreso' })
  id: string;

  @ApiProperty({ description: 'UUID de la tienda' })
  id_tienda: string;

  @ApiProperty({ description: 'Si el onboarding está completado' })
  completado: boolean;

  @ApiProperty({ description: 'Paso actual del wizard (1-5)' })
  paso_actual: number;

  @ApiProperty({ description: 'Porcentaje completado (0-100)' })
  porcentaje_completado: number;

  @ApiProperty({ description: 'Si se completó el paso 1 (branding)' })
  paso_1_branding: boolean;

  @ApiProperty({ description: 'Si se completó el paso 2 (puntos)' })
  paso_2_puntos: boolean;

  @ApiProperty({ description: 'Si se completó el paso 3 (regalo)' })
  paso_3_regalo: boolean;

  @ApiProperty({ description: 'Si se completó el paso 4 (referidos)' })
  paso_4_referidos: boolean;

  @ApiProperty({ description: 'Si se completó el paso 5 (QR)' })
  paso_5_qr: boolean;

  @ApiProperty({ description: 'Datos del wizard', type: 'object' })
  wizard_data: Record<string, any>;

  @ApiProperty({ description: 'Fecha de inicio del onboarding' })
  fecha_inicio: Date;

  @ApiProperty({ description: 'Fecha de completado', nullable: true })
  fecha_completado: Date | null;

  @ApiProperty({ description: 'Tiempo total en segundos', nullable: true })
  tiempo_total_segundos: number | null;

  @ApiProperty({ description: 'Pasos omitidos', type: [String] })
  pasos_omitidos: string[];

  @ApiProperty({ description: 'Nombre de la tienda', required: false })
  nombre_tienda?: string;
}
