'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  MessageSquare,
  Plus,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Eye,
  Trash2,
  Smartphone,
} from 'lucide-react'
import { CrearCampanaSMSModal } from './CrearCampanaSMSModal'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface CampanaSMS {
  id: string
  nombre: string
  mensaje: string
  tipo: 'marketing' | 'informativa' | 'transaccional'
  estado: 'borrador' | 'programada' | 'enviada' | 'cancelada'
  fecha_programada?: string
  fecha_envio?: string
  total_destinatarios: number
  enviados?: number
  entregados?: number
  fallidos?: number
  creado_en: string
}

interface CampanasSMSPanelProps {
  adminToken: string
  tenantDomain: string
}

export function CampanasSMSPanel({ adminToken, tenantDomain }: CampanasSMSPanelProps) {
  const [campanas, setCampanas] = useState<CampanaSMS[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    cargarCampanas()
  }, [adminToken, tenantDomain])

  const cargarCampanas = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_URL}/api/campanas-sms`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
        },
      })

      if (!res.ok) {
        throw new Error('Error al cargar campañas SMS')
      }

      const data = await res.json()
      setCampanas(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const eliminarCampana = async (id: string) => {
    if (!confirm('¿Eliminar esta campaña SMS?')) return

    try {
      const res = await fetch(`${API_URL}/api/campanas-sms/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
        },
      })

      if (!res.ok) throw new Error('Error al eliminar campaña')

      await cargarCampanas()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const getEstadoBadge = (estado: string) => {
    const badges = {
      borrador: <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Borrador</Badge>,
      programada: <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Programada</Badge>,
      enviada: <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" />Enviada</Badge>,
      cancelada: <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Cancelada</Badge>,
    }
    return badges[estado as keyof typeof badges] || <Badge>{estado}</Badge>
  }

  const getTipoBadge = (tipo: string) => {
    const badges = {
      marketing: <Badge variant="default">Marketing</Badge>,
      informativa: <Badge variant="secondary">Informativa</Badge>,
      transaccional: <Badge variant="outline">Transaccional</Badge>,
    }
    return badges[tipo as keyof typeof badges] || <Badge>{tipo}</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Campañas SMS
              </CardTitle>
              <CardDescription>
                Gestiona tus campañas de SMS para enviar mensajes a tus clientes
              </CardDescription>
            </div>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Campaña SMS
            </Button>
          </div>
        </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {campanas.length === 0 ? (
          <div className="text-center py-12">
            <Smartphone className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay campañas SMS</h3>
            <p className="text-gray-600 mb-4">
              Crea tu primera campaña SMS para empezar a comunicarte con tus clientes
            </p>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Campaña
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Campañas</p>
                    <p className="text-2xl font-bold text-blue-900">{campanas.length}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-600 opacity-50" />
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Enviadas</p>
                    <p className="text-2xl font-bold text-green-900">
                      {campanas.filter(c => c.estado === 'enviada').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600 opacity-50" />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">Programadas</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {campanas.filter(c => c.estado === 'programada').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600 opacity-50" />
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">SMS Enviados</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {campanas.reduce((acc, c) => acc + (c.enviados || 0), 0)}
                    </p>
                  </div>
                  <Send className="h-8 w-8 text-purple-600 opacity-50" />
                </div>
              </div>
            </div>

            {/* Tabla */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaña</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-center">Destinatarios</TableHead>
                    <TableHead className="text-center">Enviados</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campanas.map((campana) => (
                    <TableRow key={campana.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{campana.nombre}</p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">
                            {campana.mensaje.substring(0, 60)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getTipoBadge(campana.tipo)}</TableCell>
                      <TableCell>{getEstadoBadge(campana.estado)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="font-semibold">{campana.total_destinatarios}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {campana.estado === 'enviada' ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-center gap-1 text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              <span className="text-sm font-semibold">{campana.entregados || 0}</span>
                            </div>
                            {campana.fallidos && campana.fallidos > 0 && (
                              <div className="flex items-center justify-center gap-1 text-red-600">
                                <XCircle className="h-3 w-3" />
                                <span className="text-xs">{campana.fallidos}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {campana.fecha_envio ? (
                            <>
                              <p className="font-medium">
                                {new Date(campana.fecha_envio).toLocaleDateString('es-ES')}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(campana.fecha_envio).toLocaleTimeString('es-ES', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </>
                          ) : campana.fecha_programada ? (
                            <>
                              <p className="font-medium text-yellow-600">
                                {new Date(campana.fecha_programada).toLocaleDateString('es-ES')}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(campana.fecha_programada).toLocaleTimeString('es-ES', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </>
                          ) : (
                            <span className="text-gray-400">Sin programar</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.location.href = `/admin/campanas-sms/${campana.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {campana.estado === 'borrador' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => eliminarCampana(campana.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Modal para crear campaña */}
    <CrearCampanaSMSModal
      open={modalOpen}
      onOpenChange={setModalOpen}
      adminToken={adminToken}
      tenantDomain={tenantDomain}
      onSuccess={cargarCampanas}
    />
    </>
  )
}
