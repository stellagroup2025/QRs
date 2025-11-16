"use client"

import { AppShell } from "@/components/app-shell"
import { MiQRCard } from "@/components/mi-qr-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { getClientePorToken } from "@/lib/dataAdapter"
import type { Cliente } from "@/types"
import { ClientNav } from "@/components/ClientNav"

export default function MiQRPage() {
  const searchParams = useSearchParams()
  const cid = searchParams.get("cid")
  const t = searchParams.get("t")

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!cid || !t) {
      setError("Parámetros inválidos")
      return
    }

    const clienteData = getClientePorToken(cid, t)
    if (!clienteData) {
      setError("Cliente no encontrado o token inválido")
      return
    }

    setCliente(clienteData)
  }, [cid, t])

  return (
    <>
      <ClientNav />
      <AppShell showBackButton>
        <div className="max-w-md mx-auto py-8">
        {error ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button asChild className="w-full">
              <Link href="/recuperar">Recuperar mi QR</Link>
            </Button>
          </div>
        ) : cliente ? (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Hola, {cliente.nombre}</h2>
              <p className="text-muted-foreground">Este es tu código QR personal</p>
            </div>
            <MiQRCard clienteId={cliente.id} token={cliente.token} nombre={cliente.nombre} />
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Cargando...</p>
          </div>
        )}
      </div>
      </AppShell>
    </>
  )
}
