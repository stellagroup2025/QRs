import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift } from "lucide-react"
import { COMERCIO } from "@/config/commerce"

interface ProgresoSellosProps {
  progreso: number
  requisito: number
}

export function ProgresoSellos({ progreso, requisito }: ProgresoSellosProps) {
  const porcentaje = (progreso / requisito) * 100
  const falta = requisito - progreso

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Tarjeta de Sellos</CardTitle>
          {progreso >= requisito && <Badge className="bg-brand-accent text-white">¡Canjeable!</Badge>}
        </div>
        <CardDescription>{COMERCIO.programas.sellos.titulo}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de progreso */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">
              {progreso} / {requisito} sellos
            </span>
            <span className="text-muted-foreground">{Math.round(porcentaje)}%</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-500"
              style={{ width: `${Math.min(porcentaje, 100)}%` }}
            />
          </div>
        </div>

        {/* Grid de sellos */}
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: requisito }).map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-lg flex items-center justify-center border-2 transition-all ${
                i < progreso ? "bg-brand border-brand text-white" : "bg-muted border-border"
              }`}
            >
              {i < progreso && <Gift className="w-4 h-4" />}
            </div>
          ))}
        </div>

        {progreso < requisito ? (
          <p className="text-sm text-center text-muted-foreground">
            Te faltan {falta} sello{falta !== 1 ? "s" : ""} para tu próxima recompensa
          </p>
        ) : (
          <p className="text-sm text-center font-medium text-[rgb(var(--brand-accent))]">
            ¡Tienes una recompensa disponible! Muestra este QR en tu próxima compra.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
