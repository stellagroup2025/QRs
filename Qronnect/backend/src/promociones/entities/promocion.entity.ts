/**
 * Entidad que representa una promoción en el sistema
 */
export class Promocion {
  id: string;
  id_tienda: string;

  // Información básica
  titulo: string;
  descripcion: string;

  // Tipo y valor
  tipo: 'descuento_fijo' | 'descuento_porcentaje' | 'producto_gratis';
  valor: number;

  // Puntos requeridos
  puntos_requeridos: number;

  // Imagen
  imagen_url?: string;

  // Estado y disponibilidad
  activo: boolean;
  fecha_inicio: Date;
  fecha_fin?: Date;

  // Control de cantidad
  cantidad_disponible?: number; // null = ilimitado
  cantidad_canjeada: number;

  // Auditoría
  creado_en: Date;
  actualizado_en: Date;
}
