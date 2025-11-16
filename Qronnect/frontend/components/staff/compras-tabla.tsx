"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import { EditarCompraDialog } from "./editar-compra-dialog"
import { useToast } from "@/hooks/use-toast"

interface Compra {
  id: string
  fecha: string
  importe: number
  puntos_otorgados: number
  notas?: string
  cliente: {
    id: string
    nombre: string
    email?: string
    telefono?: string
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function ComprasTabla() {
  const [compras, setCompras] = useState<Compra[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const { toast } = useToast()

  const [compraEditar, setCompraEditar] = useState<Compra | null>(null)
  const [compraEliminar, setCompraEliminar] = useState<Compra | null>(null)
  const [eliminando, setEliminando] = useState(false)

  const limit = 10

  const cargarCompras = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) throw new Error('No autenticado')

      const domain = window.location.host.split(':')[0].split('.')[0]
      const tenantDomain = domain === 'localhost' ? 'lokeyokiera' : domain

      const res = await fetch(
        `${API_URL}/api/admin/compras?page=${page}&limit=${limit}&orderBy=fecha&order=desc`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-Domain': tenantDomain,
          },
        }
      )

      if (!res.ok) {
        throw new Error('Error al cargar compras')
      }

      const data = await res.json()
      setCompras(data.data || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar las compras",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarCompras()
  }, [page])

  const handleEliminar = async () => {
    if (!compraEliminar) return

    setEliminando(true)
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) throw new Error('No autenticado')

      const domain = window.location.host.split(':')[0].split('.')[0]
      const tenantDomain = domain === 'localhost' ? 'lokeyokiera' : domain

      const res = await fetch(`${API_URL}/api/admin/compras/${compraEliminar.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': tenantDomain,
        },
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Error al eliminar compra')
      }

      const result = await res.json()

      toast({
        title: "Compra eliminada",
        description: `Se restaron ${result.puntos_restados} puntos de ${result.cliente.nombre}`,
      })

      // Recargar lista
      cargarCompras()
      setCompraEliminar(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la compra",
        variant: "destructive",
      })
    } finally {
      setEliminando(false)
    }
  }

  const handleEditSuccess = () => {
    cargarCompras()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Ventas</CardTitle>
        <CardDescription>
          Total de {total} venta{total !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Cargando ventas...</p>
          </div>
        ) : compras.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay ventas registradas</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Importe</TableHead>
                    <TableHead>Puntos</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compras.map((compra) => (
                    <TableRow key={compra.id}>
                      <TableCell className="font-medium">
                        {new Date(compra.fecha).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {new Date(compra.fecha).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{compra.cliente.nombre}</span>
                          {compra.cliente.email && (
                            <span className="text-xs text-muted-foreground">
                              {compra.cliente.email}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">€{compra.importe.toFixed(2)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">+{compra.puntos_otorgados} pts</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        {compra.notas && (
                          <span className="text-xs text-muted-foreground truncate block">
                            {compra.notas}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setCompraEditar(compra)}
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setCompraEliminar(compra)}
                            className="text-destructive hover:text-destructive"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>

      {/* Diálogo de Edición */}
      {compraEditar && (
        <EditarCompraDialog
          compra={compraEditar}
          open={!!compraEditar}
          onOpenChange={(open) => !open && setCompraEditar(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Diálogo de Confirmación de Eliminación */}
      <AlertDialog open={!!compraEliminar} onOpenChange={(open) => !open && setCompraEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar venta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la venta de <strong>{compraEliminar?.cliente.nombre}</strong> por{" "}
              <strong>€{compraEliminar?.importe.toFixed(2)}</strong>.
              <br />
              <br />
              Se restarán <strong>{compraEliminar?.puntos_otorgados} puntos</strong> del cliente.
              {compraEliminar?.notas?.includes('Cupón aplicado:') && (
                <span className="text-amber-600">
                  <br />
                  <br />
                  ⚠️ Esta venta usó un cupón. El cupón será marcado como cancelado.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={eliminando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminar}
              disabled={eliminando}
              className="bg-destructive hover:bg-destructive/90"
            >
              {eliminando ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
