/**
 * Entidad que representa una tienda en la base de datos
 */
export interface Tienda {
  id: string;
  nombre: string;
  dominio: string;
  dominio_personalizado?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  logo_url?: string;
  color_primario?: string;
  color_secundario?: string;
  color_acento?: string;
  nombre_comercial?: string;
  plan?: string;
  activo?: boolean;
  configuracion?: Record<string, any>;
  metadata?: Record<string, any>;
  creado_en: string;
  actualizado_en: string;
}
