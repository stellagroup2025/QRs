/**
 * Entidad que representa un cliente en la base de datos
 */
export interface Cliente {
  id: string;
  supabase_user_id: string;
  id_tienda: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  puntos_totales: number;
  fecha_registro: string;
  ultima_visita?: string;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}
