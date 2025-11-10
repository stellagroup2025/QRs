import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para solicitar generación de campaña de email con IA
 */
export class EmailCampaignRequestDto {
  @ApiProperty({
    description: 'Descripción del segmento de clientes objetivo',
    example: 'Mujeres 30-45 años, 2-4 visitas en el último año, ticket medio 35€, llevan entre 60 y 120 días sin venir. Tamaño del segmento: 124 personas.',
  })
  @IsString()
  segmentoDescripcion: string;

  @ApiProperty({
    description: 'Sector del negocio',
    example: 'peluquería',
    required: false,
  })
  @IsString()
  @IsOptional()
  sector?: string;

  @ApiProperty({
    description: 'Objetivo de la campaña de email',
    enum: ['reactivacion', 'upsell', 'lanzamiento', 'fidelizacion'],
    example: 'reactivacion',
  })
  @IsEnum(['reactivacion', 'upsell', 'lanzamiento', 'fidelizacion'])
  objetivo: 'reactivacion' | 'upsell' | 'lanzamiento' | 'fidelizacion';

  @ApiProperty({
    description: 'Tono del mensaje',
    enum: ['cercano', 'familiar', 'premium', 'juvenil'],
    example: 'cercano',
  })
  @IsEnum(['cercano', 'familiar', 'premium', 'juvenil'])
  tono: 'cercano' | 'familiar' | 'premium' | 'juvenil';
}
