"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { StaffGuard } from "@/components/staff/StaffGuard"
import { ClientesTabla } from "@/components/staff/clientes-tabla"
import { ComprasTabla } from "@/components/staff/compras-tabla"
import { OfertasPanel } from "@/components/staff/ofertas-panel"
import { PromoTable } from "@/components/staff/promos/PromoTable"
import { QRScanner } from "@/components/staff/qr-scanner"
import { ClienteFicha } from "@/components/staff/cliente-ficha"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getClientePorToken } from "@/lib/dataAdapter"
import { LogOut, QrCode, Users, Settings, AlertCircle, Megaphone, ShoppingCart } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Cliente } from "@/types"
import { useStaffAuth } from "@/stores/useStaffAuth"
import { canEditPromos, canOperatePOS, canViewClients } from "@/lib/permissions"

export default function StaffPage() {
  return (
    <StaffGuard>
      <StaffContent />
    </StaffGuard>
  )
}

function StaffContent() {
  const [clienteActual, setClienteActual] = useState<Cliente | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const router = useRouter()

  const session = useStaffAuth((s) => s.session)
  const logout = useStaffAuth((s) => s.logout)
  const role = session?.role

  const handleCerrarSesion = () => {
    logout()
    router.push("/")
  }

  const handleScan = (url: string) => {
    try {
      setError(null)
      console.log("[v0] QR scanned:", url)

      const urlObj = new URL(url)
      const cid = urlObj.searchParams.get("cid")
      const t = urlObj.searchParams.get("t")

      if (!cid || !t) {
        setError("Código QR inválido: faltan parámetros")
        return
      }

      const cliente = getClientePorToken(cid, t)
      if (!cliente) {
        setError("Cliente no encontrado o token inválido")
        return
      }

      setClienteActual(cliente)
    } catch (err) {
      console.error("[v0] Parse QR error:", err)
      setError("Error al procesar el código QR")
    }
  }

  const handleUpdate = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const tabs = [
    {
      key: "escanear",
      label: "Escanear",
      icon: QrCode,
      visible: role ? canOperatePOS(role) : false,
    },
    {
      key: "clientes",
      label: "Clientes",
      icon: Users,
      visible: role ? canViewClients(role) : false,
    },
    {
      key: "ventas",
      label: "Ventas",
      icon: ShoppingCart,
      visible: role ? canViewClients(role) : false,
    },
    {
      key: "promociones",
      label: "Promociones",
      icon: Megaphone,
      visible: role ? canEditPromos(role) : false,
    },
    {
      key: "ofertas",
      label: "Ofertas",
      icon: Settings,
      visible: role ? canEditPromos(role) : false,
    },
  ].filter((t) => t.visible)

  if (!role) return null

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Panel de Staff</h2>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-muted-foreground">Gestiona clientes y ofertas</p>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-brand/10 text-brand">
                {role === "admin" ? "ADMIN" : "COMERCIAL"}
              </span>
            </div>
          </div>
          <Button variant="outline" onClick={handleCerrarSesion}>
            <LogOut className="w-4 h-4 mr-2" />
            Cambiar de rol
          </Button>
        </div>

        <Tabs defaultValue={tabs[0]?.key || "escanear"} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {canOperatePOS(role) && (
            <TabsContent value="escanear" className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <QRScanner onScan={handleScan} />
                {clienteActual && (
                  <ClienteFicha
                    cliente={clienteActual}
                    onClose={() => setClienteActual(null)}
                    onUpdate={handleUpdate}
                  />
                )}
              </div>
            </TabsContent>
          )}

          {canViewClients(role) && (
            <TabsContent value="clientes" className="space-y-4">
              <ClientesTabla key={refreshKey} onVerCliente={setClienteActual} />
              {clienteActual && (
                <ClienteFicha cliente={clienteActual} onClose={() => setClienteActual(null)} onUpdate={handleUpdate} />
              )}
            </TabsContent>
          )}

          {canViewClients(role) && (
            <TabsContent value="ventas" className="space-y-4">
              <ComprasTabla key={refreshKey} />
            </TabsContent>
          )}

          {canEditPromos(role) && (
            <TabsContent value="promociones" className="space-y-4">
              <PromoTable />
            </TabsContent>
          )}

          {canEditPromos(role) && (
            <TabsContent value="ofertas" className="space-y-4">
              <OfertasPanel />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppShell>
  )
}
