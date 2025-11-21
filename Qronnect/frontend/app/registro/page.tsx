import { Suspense } from "react"
import { AppShell } from "@/components/app-shell"
import { RegistroForm } from "@/components/registro-form"

export default function RegistroPage() {
  return (
    <AppShell showBackButton>
      <div className="max-w-md mx-auto py-8">
        <Suspense fallback={<div className="text-center">Cargando...</div>}>
          <RegistroForm />
        </Suspense>
      </div>
    </AppShell>
  )
}
