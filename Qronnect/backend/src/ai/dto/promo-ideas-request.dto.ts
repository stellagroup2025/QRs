import { IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para solicitar ideas de promociones con IA
 */
export class PromoIdeasRequestDto {
  @ApiProperty({
    description: 'Sector del negocio',
    example: 'peluquería',
    required: false,
  })
  @IsString()
  @IsOptional()
  sector?: string;

  @ApiProperty({
    description: 'Ticket medio actual del negocio',
    example: 35.50,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  ticketMedio?: number;

  @ApiProperty({
    description: 'Frecuencia promedio de visitas por mes',
    example: 2.5,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  frecuenciaVisitas?: number;

  @ApiProperty({
    description: 'Objetivo de la promoción',
    enum: ['aumentar_visitas', 'subir_ticket', 'reactivar_inactivos', 'fidelizar'],
    example: 'aumentar_visitas',
  })
  @IsEnum(['aumentar_visitas', 'subir_ticket', 'reactivar_inactivos', 'fidelizar'])
  objetivo: 'aumentar_visitas' | 'subir_ticket' | 'reactivar_inactivos' | 'fidelizar';

  @ApiProperty({
    description: 'Contexto adicional sobre el negocio',
    example: 'Tenemos mucho flujo los sábados pero muy poco entre semana',
    required: false,
  })
  @IsString()
  @IsOptional()
  contexto?: string;
}
