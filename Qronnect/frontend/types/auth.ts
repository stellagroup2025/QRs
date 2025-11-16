export type StaffRole = "admin" | "comercial"

export interface StaffSession {
  role: StaffRole
  loggedAt: string
}
