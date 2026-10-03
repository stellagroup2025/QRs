/**
 * Contenido del QR personal del cliente. Con la cámara del móvil abre "añadir venta"
 * en el panel del negocio; el escáner de caja saca de aquí el ID del cliente.
 */
export function clienteQrValue(origin: string, clienteId: string) {
  return `${origin}/admin/dashboard?open_sale=true&cliente_id=${clienteId}`
}
