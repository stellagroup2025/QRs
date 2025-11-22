import { ApiProperty } from '@nestjs/swagger';

export class PlantillaResponseDto {
  @ApiProperty({ description: 'UUID de la plantilla' })
  id: string;

  @ApiProperty({ description: 'Nombre de la plantilla' })
  nombre: string;

  @ApiProperty({ description: 'Descripción de la plantilla' })
  descripcion: string;

  @ApiProperty({
    description: 'Categoría de la plantilla',
    enum: ['bienvenida', 'cumpleanos', 'recuperacion', 'vip', 'flash'],
  })
  categoria: string;

  @ApiProperty({
    description: 'Tipo de negocio recomendado',
    nullable: true,
    example: 'cafeteria',
  })
  tipo_negocio: string | null;

  @ApiProperty({
    description: 'Tipo de promoción',
    enum: ['descuento', 'regalo', 'puntos', '2x1'],
  })
  tipo_promocion: string;

  @ApiProperty({
    description: 'Configuración de la promoción',
    type: 'object',
    example: {
      descuento_porcentaje: 20,
      valido_para: 'nuevo_cliente',
      dias_validez: 30,
    },
  })
  configuracion: Record<string, any>;

  @ApiProperty({
    description: 'Copy sugerido para la campaña',
    type: 'object',
    example: {
      asunto: '¡Bienvenido! 20% de descuento',
      mensaje: 'Disfruta de tu descuento...',
      cta: 'Usar descuento',
    },
  })
  copy_sugerido: Record<string, any>;

  @ApiProperty({
    description: 'Canales recomendados',
    type: [String],
    example: ['email', 'sms'],
  })
  canales: string[];

  @ApiProperty({ description: 'Veces que se ha usado esta plantilla' })
  veces_usada: number;

  @ApiProperty({ description: 'Rating promedio (0-5)' })
  rating_promedio: number;

  @ApiProperty({ description: 'Si es una plantilla recomendada' })
  es_recomendada: boolean;

  @ApiProperty({ description: 'Orden de visualización' })
  orden: number;

  @ApiProperty({ description: 'Si la plantilla está activa' })
  activa: boolean;
}
