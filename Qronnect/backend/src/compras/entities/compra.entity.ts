/**
 * Entidad que representa una compra en la base de datos
 */
export interface Compra {
  id: string;
  id_cliente: string;
  id_tienda: string;
  fecha: string;
  importe: string; // Numeric en Postgres se mapea a string
  puntos_otorgados: number;
  notas?: string;
  creado_en: string;
}
