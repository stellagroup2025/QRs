/**
 * Entidad que representa un código QR de cliente en la base de datos
 */
export interface QrCliente {
  id: string;
  id_cliente: string;
  codigo: string;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}
