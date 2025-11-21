import { Suspense } from "react"
import { AppShell } from "@/components/app-shell"
import { RegistroFormV2 } from "@/components/registro-form-v2"

export default function RegistroPage() {
  return (
    <AppShell showBackButton>
      <div className="container mx-auto py-8 px-4">
        <Suspense fallback={<div className="text-center">Cargando...</div>}>
          <RegistroFormV2 />
        </Suspense>
      </div>
    </AppShell>
  )
}
