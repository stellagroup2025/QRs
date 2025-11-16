import { AppShell } from "@/components/app-shell"
import { RecuperarForm } from "@/components/recuperar-form"

export default function RecuperarPage() {
  return (
    <AppShell showBackButton>
      <div className="max-w-md mx-auto py-8">
        <RecuperarForm />
      </div>
    </AppShell>
  )
}
