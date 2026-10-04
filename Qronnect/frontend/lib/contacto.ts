const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

/** Lo que se envía a POST /api/contacto (mismo formato que CrearSolicitudContactoDto) */
export interface SolicitudContacto {
  nombre_negocio: string
  nombre_contacto: string
  email: string
  telefono?: string
  sector?: string
  plan_interes?: string
  mensaje?: string
  origen?: string
  /** Campo trampa para bots: las personas lo dejan vacío */
  web?: string
}

export const EMAIL_VALIDO = /^\S+@\S+\.\S+$/

/** Envía la solicitud de contacto; lanza un Error con un mensaje para mostrar si falla */
export async function enviarSolicitudContacto(datos: SolicitudContacto) {
  const res = await fetch(`${API_URL}/api/contacto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...datos, acepta_privacidad: true }),
  }).catch(() => null)
  if (res?.status === 429) throw new Error('Has enviado varias solicitudes seguidas. Espera un poco y vuelve a intentarlo.')
  if (!res?.ok) throw new Error('No se ha podido enviar. Revisa los datos o escríbenos a sales@qronnect.com.')
}

/** Página desde la que llega el visitante, para saber qué landing convierte */
export function origenActual(param?: string | null) {
  if (param) return param
  if (typeof document === 'undefined' || !document.referrer) return undefined
  try {
    return new URL(document.referrer).pathname
  } catch {
    return undefined
  }
}
