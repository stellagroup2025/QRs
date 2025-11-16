"use client"

import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Mail, Phone } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { getClientePorToken } from "@/lib/dataAdapter"
import type { Cliente } from "@/types"

export default function ValidarClientePage() {
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
    <AppShell>
      <div className="max-w-md mx-auto py-8">
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : cliente ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <CardTitle>Cliente verificado</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-2xl font-bold">{cliente.nombre}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {cliente.email && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {cliente.email}
                    </Badge>
                  )}
                  {cliente.telefono && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {cliente.telefono}
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Este código QR es válido y pertenece a este cliente.</p>
              <Alert>
                <AlertDescription>
                  El personal de la tienda puede escanear este QR para aplicar beneficios.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Validando...</p>
          </div>
        )}
      </div>
    </AppShell>
  )
}
