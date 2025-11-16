import { AppShell } from "@/components/app-shell"
import { RegistroForm } from "@/components/registro-form"

export default function RegistroPage() {
  return (
    <AppShell showBackButton>
      <div className="max-w-md mx-auto py-8">
        <RegistroForm />
      </div>
    </AppShell>
  )
}
