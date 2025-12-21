import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para la verificación de límite de un tipo de IA
 */
export class VerificacionLimiteDto {
  @ApiProperty({ description: 'Indica si hay disponibilidad para usar esta función' })
  disponible: boolean;

  @ApiProperty({ description: 'Indica si el plan tiene uso ilimitado' })
  ilimitado: boolean;

  @ApiProperty({ description: 'Plan de la tienda' })
  plan: string;

  @ApiProperty({ description: 'Tipo de uso de IA' })
  tipo_uso: string;

  @ApiProperty({ description: 'Límite semanal según el plan', nullable: true })
  limite_semanal: number | null;

  @ApiProperty({ description: 'Usos realizados esta semana', nullable: true })
  usos_realizados: number | null;

  @ApiProperty({ description: 'Usos restantes esta semana', nullable: true })
  restantes: number | null;

  @ApiProperty({ description: 'Fecha de inicio de la semana (lunes)' })
  semana_inicio: string;

  @ApiProperty({ description: 'Fecha de fin de la semana (domingo)' })
  semana_fin: string;
}

/**
 * DTO para el resumen completo de límites de IA
 */
export class ResumenLimitesIADto {
  @ApiProperty({ description: 'Límites para generación de promociones con IA', type: VerificacionLimiteDto })
  promocion_ia: VerificacionLimiteDto;

  @ApiProperty({ description: 'Límites para generación de campañas con IA', type: VerificacionLimiteDto })
  campana_ia: VerificacionLimiteDto;

  @ApiProperty({ description: 'Límites para análisis de KPIs con IA', type: VerificacionLimiteDto })
  analisis_kpi: VerificacionLimiteDto;
}

/**
 * DTO para respuesta de error por límite excedido
 */
export class LimiteExcedidoResponseDto {
  @ApiProperty({ description: 'Mensaje de error' })
  message: string;

  @ApiProperty({ description: 'Código de error', example: 'AI_LIMIT_EXCEEDED' })
  code: string;

  @ApiProperty({ description: 'Detalles del límite', type: VerificacionLimiteDto })
  details: VerificacionLimiteDto;
}
