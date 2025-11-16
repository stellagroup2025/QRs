"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { RegistroForm } from "@/components/registro-form"

export default function GetQRPage() {
  const router = useRouter()

  // Verificar si el usuario está logueado y redirigir al perfil
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("client_token")
      if (token) {
        // Usuario está logueado, redirigir a su perfil
        router.push("/mi-perfil")
      }
    }
  }, [router])

  return (
    <AppShell showBackButton>
      <div className="max-w-md mx-auto py-8 space-y-4">
        <RegistroForm />
        <div className="text-center pt-2">
          <Link
            href="/login"
            className="text-sm text-[rgb(var(--brand-accent))] hover:text-[rgb(var(--brand-accent))]/80 underline font-medium"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
