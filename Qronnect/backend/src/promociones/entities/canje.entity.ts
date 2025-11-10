/**
 * Entidad que representa un canje de promoción realizado por un cliente
 */
export class Canje {
  id: string;

  // Referencias
  id_cliente: string;
  id_promocion: string;
  id_tienda: string;

  // Puntos y estado
  puntos_usados: number;
  estado: 'pendiente' | 'usado' | 'expirado' | 'cancelado';

  // Código único para validar
  codigo_canje: string;

  // Fechas
  fecha_canje: Date;
  fecha_uso?: Date;
  fecha_expiracion?: Date;

  // Quién validó
  usado_por?: string;

  // Auditoría
  creado_en: Date;
  actualizado_en: Date;
}
