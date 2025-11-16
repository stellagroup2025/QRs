import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Percent } from "lucide-react"

interface OfertaCardProps {
  tipo: "sellos" | "descuento"
  titulo: string
  requisito?: number
  porcentaje?: number
}

export function OfertaCard({ tipo, titulo, requisito, porcentaje }: OfertaCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {tipo === "sellos" ? (
              <Gift className="w-5 h-5 text-primary" />
            ) : (
              <Percent className="w-5 h-5 text-accent" />
            )}
            {tipo === "sellos" ? "Tarjeta de Sellos" : "Descuento Miembro"}
          </CardTitle>
          <Badge variant="secondary">Activo</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{titulo}</p>
        {tipo === "sellos" && requisito && (
          <p className="text-sm mt-2 text-foreground font-medium">Colecciona {requisito} sellos</p>
        )}
        {tipo === "descuento" && porcentaje && (
          <p className="text-sm mt-2 text-foreground font-medium">{porcentaje}% de descuento en cada compra</p>
        )}
      </CardContent>
    </Card>
  )
}
