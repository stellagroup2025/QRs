import { COMERCIO } from "@/config/commerce"

export function validarPIN(pin: string): boolean {
  return pin === COMERCIO.pinStaff
}

// LocalStorage para sesión de staff
const STAFF_SESSION_KEY = "comercio_staff_session"

export function guardarSesionStaff(): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(STAFF_SESSION_KEY, "true")
}

export function verificarSesionStaff(): boolean {
  if (typeof window === "undefined") return false
  return sessionStorage.getItem(STAFF_SESSION_KEY) === "true"
}

export function cerrarSesionStaff(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(STAFF_SESSION_KEY)
}
