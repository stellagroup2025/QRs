export type StaffRole = "admin" | "empleado" | "comercial" // comercial es legacy

export interface StaffSession {
  role: StaffRole
  loggedAt: string
}
