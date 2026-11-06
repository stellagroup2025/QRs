// Guarda los tokens en disco para no tener que iniciar sesión en cada arranque.
// Fichero: $QRONNECT_MCP_SESION o ~/.qronnect-mcp/sesion.json (solo legible por el usuario).
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export const RUTA_SESION =
  process.env.QRONNECT_MCP_SESION || path.join(os.homedir(), '.qronnect-mcp', 'sesion.json')

/** Segundos que le quedan a un JWT (o -1 si no se puede leer) */
export function segundosRestantes(token, ahora = Date.now()) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'))
    if (!payload.exp) return Infinity
    return Math.floor(payload.exp - ahora / 1000)
  } catch {
    return -1
  }
}

/** Un token vale si le queda al menos un minuto */
export const tokenVigente = (token) => !!token && segundosRestantes(token) > 60

export function leerSesion(ruta = RUTA_SESION) {
  try {
    return JSON.parse(fs.readFileSync(ruta, 'utf8'))
  } catch {
    return { superadmin: null, tiendas: {} }
  }
}

export function guardarSesion(sesion, ruta = RUTA_SESION) {
  fs.mkdirSync(path.dirname(ruta), { recursive: true, mode: 0o700 })
  fs.writeFileSync(ruta, JSON.stringify(sesion, null, 2), { mode: 0o600 })
}
