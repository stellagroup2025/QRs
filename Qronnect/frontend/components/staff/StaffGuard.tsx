"use client"

import type { ReactNode } from "react"
import { useStaffAuth } from "@/stores/useStaffAuth"
import { PINDialog } from "@/components/staff/pin-dialog"

interface StaffGuardProps {
  children: ReactNode
}

export function StaffGuard({ children }: StaffGuardProps) {
  const session = useStaffAuth((s) => s.session)

  if (!session) {
    return <PINDialog open={true} onSuccess={() => {}} />
  }

  return <>{children}</>
}
