"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PromoEditor } from "./PromoEditor"
import { usePromos } from "@/stores/usePromos"
import { Edit, Trash2, Play, Pause } from "lucide-react"
import type { Promocion, PromoStatus } from "@/types/promo"
import { useToast } from "@/hooks/use-toast"

export function PromoTable() {
  const { promos, reload, create, updateStatus, save, remove } = usePromos()
  const [showEditor, setShowEditor] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promocion | undefined>()
  const { toast } = useToast()

  useEffect(() => {
    reload()
  }, [reload])

  const handleCreate = () => {
    setEditingPromo(undefined)
    setShowEditor(true)
  }

  const handleEdit = (promo: Promocion) => {
    setEditingPromo(promo)
    setShowEditor(true)
  }

  const handleSave = (data: Partial<Promocion>) => {
    if (editingPromo) {
      save({ ...editingPromo, ...data })
      toast({ title: "Promoción actualizada", description: "Los cambios se guardaron correctamente" })
    } else {
      create(data)
      toast({ title: "Promoción creada", description: "La nueva promoción se creó correctamente" })
    }
    setShowEditor(false)
    setEditingPromo(undefined)
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Seguro que deseas eliminar esta promoción?")) {
      remove(id)
      toast({ title: "Promoción eliminada", variant: "destructive" })
    }
  }

  const handleStatusChange = (id: string, estado: PromoStatus) => {
    updateStatus(id, estado)
    toast({ title: "Estado actualizado", description: `La promoción ahora está ${estado}` })
  }

  const getEstadoBadge = (estado: PromoStatus) => {
    const variants = {
      borrador: "secondary",
      programada: "default",
      publicada: "default",
      expirada: "secondary",
    } as const
    return <Badge variant={variants[estado]}>{estado}</Badge>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Promociones</CardTitle>
              <CardDescription>Gestiona las promociones del comercio</CardDescription>
            </div>
            <Button onClick={handleCreate}>Nueva promoción</Button>
          </div>
        </CardHeader>
        <CardContent>
          {promos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay promociones creadas</p>
              <Button variant="link" onClick={handleCreate}>
                Crear primera promoción
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Fechas</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promos.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell className="font-medium">{promo.titulo}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{promo.placement}</Badge>
                      </TableCell>
                      <TableCell>{getEstadoBadge(promo.estado)}</TableCell>
                      <TableCell>{promo.prioridad}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {promo.inicio && <div>Inicio: {new Date(promo.inicio).toLocaleDateString("es-ES")}</div>}
                        {promo.fin && <div>Fin: {new Date(promo.fin).toLocaleDateString("es-ES")}</div>}
                        {!promo.inicio && !promo.fin && <div>-</div>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(promo)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          {promo.estado === "publicada" ? (
                            <Button size="sm" variant="ghost" onClick={() => handleStatusChange(promo.id, "borrador")}>
                              <Pause className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => handleStatusChange(promo.id, "publicada")}>
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(promo.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPromo ? "Editar promoción" : "Nueva promoción"}</DialogTitle>
          </DialogHeader>
          <PromoEditor promo={editingPromo} onSave={handleSave} onCancel={() => setShowEditor(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
