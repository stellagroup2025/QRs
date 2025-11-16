"use client"

import { create } from "zustand"
import type { StaffRole, StaffSession } from "@/types/auth"
import { COMERCIO } from "@/config/commerce"

interface StaffAuthStore {
  session: StaffSession | null
  loginWithPin: (pin: string) => StaffRole | null
  logout: () => void
  hasRole: (role: StaffRole) => boolean
}

const STAFF_SESSION_KEY = "staffSession"
const SESSION_MAX_MS = 4 * 60 * 60 * 1000 // 4 hours

export const useStaffAuth = create<StaffAuthStore>((set, get) => ({
  session: null,

  loginWithPin: (pin: string) => {
    let role: StaffRole | null = null

    if (pin === COMERCIO.pins.admin) {
      role = "admin"
    } else if (pin === COMERCIO.pins.comercial) {
      role = "comercial"
    }

    if (role) {
      const session: StaffSession = {
        role,
        loggedAt: new Date().toISOString(),
      }
      set({ session })
      if (typeof window !== "undefined") {
        sessionStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(session))
      }
      return role
    }

    return null
  },

  logout: () => {
    set({ session: null })
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(STAFF_SESSION_KEY)
    }
  },

  hasRole: (role: StaffRole) => {
    return get().session?.role === role
  },
}))

// Restore session if not expired (4h)
if (typeof window !== "undefined") {
  const raw = sessionStorage.getItem(STAFF_SESSION_KEY)
  if (raw) {
    try {
      const session = JSON.parse(raw) as StaffSession
      const elapsed = Date.now() - new Date(session.loggedAt).getTime()
      if (elapsed < SESSION_MAX_MS) {
        useStaffAuth.setState({ session })
      } else {
        sessionStorage.removeItem(STAFF_SESSION_KEY)
      }
    } catch (error) {
      console.error("[v0] Failed to restore staff session:", error)
      sessionStorage.removeItem(STAFF_SESSION_KEY)
    }
  }
}
