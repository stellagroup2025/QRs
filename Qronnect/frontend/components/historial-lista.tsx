import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Evento } from "@/types"
import { Gift, ShoppingBag, Percent, UserPlus, Award } from "lucide-react"

interface HistorialListaProps {
  eventos: Evento[]
}

const eventoConfig = {
  compra: { icon: ShoppingBag, label: "Compra", color: "bg-blue-500" },
  sello: { icon: Gift, label: "Sello añadido", color: "bg-primary" },
  canje: { icon: Award, label: "Canje realizado", color: "bg-green-500" },
  descuento_aplicado: { icon: Percent, label: "Descuento aplicado", color: "bg-accent" },
  alta_cliente: { icon: UserPlus, label: "Alta de cliente", color: "bg-muted" },
}

export function HistorialLista({ eventos }: HistorialListaProps) {
  const eventosOrdenados = [...eventos].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de actividad</CardTitle>
        <CardDescription>Todas tus interacciones y recompensas</CardDescription>
      </CardHeader>
      <CardContent>
        {eventosOrdenados.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aún no tienes actividad</p>
            <p className="text-sm mt-2">Tu historial aparecerá aquí después de tu primera compra</p>
          </div>
        ) : (
          <div className="space-y-3">
            {eventosOrdenados.map((evento) => {
              const config = eventoConfig[evento.tipo]
              const Icon = config.icon
              const fecha = new Date(evento.fecha)
              const fechaFormateada = fecha.toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })

              return (
                <div key={evento.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div
                    className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">{config.label}</p>
                      <Badge variant="outline" className="text-xs">
                        {fechaFormateada}
                      </Badge>
                    </div>
                    {evento.meta && Object.keys(evento.meta).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">{JSON.stringify(evento.meta)}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
