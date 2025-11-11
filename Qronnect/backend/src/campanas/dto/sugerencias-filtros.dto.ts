import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta con sugerencias predefinidas para filtros de segmentación
 * Ayuda al usuario a crear campañas con filtros comunes
 */

export interface RangoSugerencia {
  label: string;
  min?: number;
  max?: number;
  descripcion: string;
}

export class SugerenciasFiltrosDto {
  @ApiProperty({
    description: 'Sugerencias de rangos de edad',
    example: [
      { label: 'Jóvenes (18-30)', min: 18, max: 30, descripcion: 'Clientes jóvenes' },
      { label: 'Adultos (31-50)', min: 31, max: 50, descripcion: 'Clientes adultos' },
    ],
  })
  edad: RangoSugerencia[];

  @ApiProperty({
    description: 'Sugerencias de rangos de ticket medio',
    example: [
      { label: 'Compras pequeñas (<30€)', min: 0, max: 30, descripcion: 'Clientes con compras pequeñas' },
      { label: 'Compras medianas (30-100€)', min: 30, max: 100, descripcion: 'Clientes con compras medianas' },
    ],
  })
  ticket_medio: RangoSugerencia[];

  @ApiProperty({
    description: 'Sugerencias de rangos de número de visitas',
    example: [
      { label: 'Nuevos (1-3 visitas)', min: 1, max: 3, descripcion: 'Clientes nuevos' },
      { label: 'Regulares (4-10 visitas)', min: 4, max: 10, descripcion: 'Clientes regulares' },
    ],
  })
  num_visitas: RangoSugerencia[];

  @ApiProperty({
    description: 'Sugerencias de rangos de días desde última visita',
    example: [
      { label: 'Recientes (0-7 días)', min: 0, max: 7, descripcion: 'Visitaron recientemente' },
      { label: 'Inactivos (30-90 días)', min: 30, max: 90, descripcion: 'No visitan hace tiempo' },
    ],
  })
  dias_ultima_visita: RangoSugerencia[];

  @ApiProperty({
    description: 'Sugerencias de rangos de puntos acumulados',
    example: [
      { label: 'Pocos puntos (<100)', min: 0, max: 100, descripcion: 'Clientes con pocos puntos' },
      { label: 'Muchos puntos (>500)', min: 500, descripcion: 'Clientes con muchos puntos' },
    ],
  })
  puntos: RangoSugerencia[];

  @ApiProperty({
    description: 'Sugerencias de filtros de campañas',
    example: [
      { label: 'Sin campañas previas', descripcion: 'Clientes que nunca recibieron campañas' },
      { label: 'Hace más de 30 días', min: 30, descripcion: 'No recibieron campañas en 30+ días' },
    ],
  })
  historial_campanas: RangoSugerencia[];
}
