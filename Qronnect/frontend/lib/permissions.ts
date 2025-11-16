import type { StaffRole } from "@/types/auth"

export function canEditPromos(role: StaffRole): boolean {
  return role === "admin"
}

export function canExportData(role: StaffRole): boolean {
  return role === "admin"
}

export function canEditBranding(role: StaffRole): boolean {
  return role === "admin"
}

export function canOperatePOS(role: StaffRole): boolean {
  return role === "admin" || role === "comercial"
}

export function canViewClients(role: StaffRole): boolean {
  return role === "admin" || role === "comercial"
}
