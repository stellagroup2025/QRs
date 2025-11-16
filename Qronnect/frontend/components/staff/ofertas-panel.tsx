"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { COMERCIO } from "@/config/commerce"
import { Gift, Percent } from "lucide-react"

export function OfertasPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de ofertas</CardTitle>
        <CardDescription>Vista de las ofertas actuales (sin persistencia API real)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Programa de Sellos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Programa de Sellos</h3>
            </div>
            <Badge variant={COMERCIO.programas.sellos.activo ? "default" : "secondary"}>
              {COMERCIO.programas.sellos.activo ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <div className="space-y-2">
            <Label htmlFor="titulo-sellos">Título</Label>
            <Input id="titulo-sellos" value={COMERCIO.programas.sellos.titulo} readOnly disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requisito-sellos">Requisito (sellos)</Label>
            <Input id="requisito-sellos" type="number" value={COMERCIO.programas.sellos.requisito} readOnly disabled />
          </div>
        </div>

        {/* Programa de Descuento */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-accent" />
              <h3 className="font-semibold">Programa de Descuento</h3>
            </div>
            <Badge variant={COMERCIO.programas.descuento.activo ? "default" : "secondary"}>
              {COMERCIO.programas.descuento.activo ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          <div className="space-y-2">
            <Label htmlFor="titulo-descuento">Título</Label>
            <Input id="titulo-descuento" value={COMERCIO.programas.descuento.titulo} readOnly disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="porcentaje-descuento">Porcentaje (%)</Label>
            <Input
              id="porcentaje-descuento"
              type="number"
              value={COMERCIO.programas.descuento.porcentaje}
              readOnly
              disabled
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Para modificar estas ofertas, edita el archivo config/commerce.ts
        </p>
      </CardContent>
    </Card>
  )
}
