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
import { Mail, Phone, Eye, Edit, Trash2 } from "lucide-react"
import type { Cliente } from "@/types"
import { useEffect, useState } from "react"
import { listarClientes } from "@/lib/dataAdapter"
import { useFidelizacion } from "@/stores/useFidelizacion"
import { EditarClienteDialog } from "./editar-cliente-dialog"
import { useToast } from "@/hooks/use-toast"

interface ClientesTablaProps {
  onVerCliente?: (cliente: Cliente) => void
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function ClientesTabla({ onVerCliente }: ClientesTablaProps) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const { obtenerEstadoSellos, obtenerEventosCliente } = useFidelizacion()
  const { toast } = useToast()

  const [clienteEditar, setClienteEditar] = useState<Cliente | null>(null)
  const [clienteEliminar, setClienteEliminar] = useState<Cliente | null>(null)
  const [eliminando, setEliminando] = useState(false)

  useEffect(() => {
    setClientes(listarClientes())
  }, [])

  const handleEliminar = async () => {
    if (!clienteEliminar) return

    setEliminando(true)
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) throw new Error('No autenticado')

      const domain = window.location.host.split(':')[0].split('.')[0]
      const tenantDomain = domain === 'localhost' ? 'lokeyokiera' : domain

      const res = await fetch(`${API_URL}/api/admin/clientes/${clienteEliminar.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': tenantDomain,
        },
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Error al eliminar cliente')
      }

      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido desactivado correctamente",
      })

      // Recargar lista de clientes
      setClientes(listarClientes())
      setClienteEliminar(null)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el cliente",
        variant: "destructive",
      })
    } finally {
      setEliminando(false)
    }
  }

  const handleEditSuccess = () => {
    // Recargar lista de clientes
    setClientes(listarClientes())
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes registrados</CardTitle>
        <CardDescription>
          Total de {clientes.length} cliente{clientes.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {clientes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay clientes registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Sellos</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((cliente) => {
                  const sellos = obtenerEstadoSellos(cliente.id)
                  const eventos = obtenerEventosCliente(cliente.id)
                  const ultimoEvento =
                    eventos.length > 0 ? new Date(eventos[eventos.length - 1].fecha) : new Date(cliente.createdAt)

                  return (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nombre}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {cliente.email && (
                            <Badge variant="outline" className="text-xs w-fit">
                              <Mail className="w-3 h-3 mr-1" />
                              {cliente.email}
                            </Badge>
                          )}
                          {cliente.telefono && (
                            <Badge variant="outline" className="text-xs w-fit">
                              <Phone className="w-3 h-3 mr-1" />
                              {cliente.telefono}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{sellos ? `${sellos.progreso}/${sellos.requisito}` : "0/10"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ultimoEvento.toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => onVerCliente?.(cliente)} title="Ver detalles">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setClienteEditar(cliente)} title="Editar">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setClienteEliminar(cliente)}
                            className="text-destructive hover:text-destructive"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Diálogo de Edición */}
      {clienteEditar && (
        <EditarClienteDialog
          cliente={clienteEditar}
          open={!!clienteEditar}
          onOpenChange={(open) => !open && setClienteEditar(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Diálogo de Confirmación de Eliminación */}
      <AlertDialog open={!!clienteEliminar} onOpenChange={(open) => !open && setClienteEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactivará al cliente <strong>{clienteEliminar?.nombre}</strong>.
              Los datos históricos se mantendrán, pero el cliente no aparecerá en las listas activas.
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
