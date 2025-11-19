'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Users, Filter, CheckSquare, Square, Loader2, Lightbulb, Sparkles } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { hexToRgb } from '@/lib/brand-colors'
import { useBrandingContext } from '@/components/BrandingProvider'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Cliente {
  id: string
  nombre: string
  email: string
  telefono?: string
  fecha_nacimiento?: string
  puntos_totales: number
  fecha_registro: string
  ultima_visita?: string
  total_compras: number
  ticket_medio?: number
  num_compras?: number
  dias_desde_ultima_visita?: number
}

interface FiltrosSegmentacion {
  ticket_medio_min?: number
  ticket_medio_max?: number
  num_visitas_min?: number
  num_visitas_max?: number
  edad_min?: number
  edad_max?: number
  dias_desde_ultima_visita_min?: number
  dias_desde_ultima_visita_max?: number
  puntos_min?: number
  puntos_max?: number
  genero?: string
  dias_desde_ultima_campana_min?: number
  excluir_campanas_ultimos_dias?: number
  solo_sin_campanas?: boolean
}

interface SegmentacionClientesProps {
  adminToken: string
  tenantDomain: string
  onClientesSeleccionados: (clienteIds: string[]) => void
  initialFiltros?: FiltrosSegmentacion
}

export function SegmentacionClientes({
  adminToken,
  tenantDomain,
  onClientesSeleccionados,
  initialFiltros,
}: SegmentacionClientesProps) {
  const { branding } = useBrandingContext()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [clientesSeleccionados, setClientesSeleccionados] = useState<Set<string>>(new Set())
  const [filtros, setFiltros] = useState<FiltrosSegmentacion>(initialFiltros || {})
  const [loadingSugerencias, setLoadingSugerencias] = useState(false)
  const [sugerencias, setSugerencias] = useState<any[]>([])

  useEffect(() => {
    cargarClientes()
    cargarSugerencias()
  }, [])

  useEffect(() => {
    // Actualizar selección cuando cambien los filtros
    aplicarFiltrosAutomaticamente()
  }, [filtros, clientes])

  async function cargarClientes() {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/admin/clientes?limit=100`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setClientes(data.data || [])
        // Seleccionar todos por defecto
        const todosIds = new Set(data.data.map((c: Cliente) => c.id))
        setClientesSeleccionados(todosIds)
        onClientesSeleccionados(Array.from(todosIds))
      }
    } catch (error) {
      console.error('Error cargando clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function cargarSugerencias() {
    try {
      setLoadingSugerencias(true)
      const response = await fetch(`${API_URL}/api/admin/campanas/sugerencias-filtros`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSugerencias(data.sugerencias || [])
      }
    } catch (error) {
      console.error('Error cargando sugerencias:', error)
    } finally {
      setLoadingSugerencias(false)
    }
  }

  function aplicarSugerencia(sugerencia: any) {
    setFiltros(sugerencia.filtros)
  }

  function aplicarFiltrosAutomaticamente() {
    if (clientes.length === 0) return

    const clientesFiltrados = clientes.filter((cliente) => {
      // Filtro por ticket medio
      if (filtros.ticket_medio_min !== undefined && (cliente.ticket_medio || 0) < filtros.ticket_medio_min) return false
      if (filtros.ticket_medio_max !== undefined && (cliente.ticket_medio || 0) > filtros.ticket_medio_max) return false

      // Filtro por número de visitas/compras
      if (filtros.num_visitas_min !== undefined && (cliente.num_compras || 0) < filtros.num_visitas_min) return false
      if (filtros.num_visitas_max !== undefined && (cliente.num_compras || 0) > filtros.num_visitas_max) return false

      // Filtro por edad
      if (filtros.edad_min !== undefined || filtros.edad_max !== undefined) {
        if (!cliente.fecha_nacimiento) return false
        const edad = calcularEdad(cliente.fecha_nacimiento)
        if (filtros.edad_min !== undefined && edad < filtros.edad_min) return false
        if (filtros.edad_max !== undefined && edad > filtros.edad_max) return false
      }

      // Filtro por días desde última visita
      if (filtros.dias_desde_ultima_visita_min !== undefined && (cliente.dias_desde_ultima_visita || 0) < filtros.dias_desde_ultima_visita_min) return false
      if (filtros.dias_desde_ultima_visita_max !== undefined && (cliente.dias_desde_ultima_visita || 0) > filtros.dias_desde_ultima_visita_max) return false

      // Filtro por puntos
      if (filtros.puntos_min !== undefined && cliente.puntos_totales < filtros.puntos_min) return false
      if (filtros.puntos_max !== undefined && cliente.puntos_totales > filtros.puntos_max) return false

      return true
    })

    const nuevosIds = new Set(clientesFiltrados.map(c => c.id))
    setClientesSeleccionados(nuevosIds)
    onClientesSeleccionados(Array.from(nuevosIds))
  }

  function calcularEdad(fechaNacimiento: string): number {
    const hoy = new Date()
    const nacimiento = new Date(fechaNacimiento)
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }
    return edad
  }

  function toggleCliente(clienteId: string) {
    const nuevaSeleccion = new Set(clientesSeleccionados)
    if (nuevaSeleccion.has(clienteId)) {
      nuevaSeleccion.delete(clienteId)
    } else {
      nuevaSeleccion.add(clienteId)
    }
    setClientesSeleccionados(nuevaSeleccion)
    onClientesSeleccionados(Array.from(nuevaSeleccion))
  }

  function toggleTodos() {
    const clientesVisibles = clientes.filter((cliente) => {
      // Aplicar filtros para obtener solo los visibles
      if (filtros.ticket_medio_min !== undefined && (cliente.ticket_medio || 0) < filtros.ticket_medio_min) return false
      if (filtros.ticket_medio_max !== undefined && (cliente.ticket_medio || 0) > filtros.ticket_medio_max) return false
      if (filtros.num_visitas_min !== undefined && (cliente.num_compras || 0) < filtros.num_visitas_min) return false
      if (filtros.num_visitas_max !== undefined && (cliente.num_compras || 0) > filtros.num_visitas_max) return false
      if (filtros.edad_min !== undefined || filtros.edad_max !== undefined) {
        if (!cliente.fecha_nacimiento) return false
        const edad = calcularEdad(cliente.fecha_nacimiento)
        if (filtros.edad_min !== undefined && edad < filtros.edad_min) return false
        if (filtros.edad_max !== undefined && edad > filtros.edad_max) return false
      }
      if (filtros.dias_desde_ultima_visita_min !== undefined && (cliente.dias_desde_ultima_visita || 0) < filtros.dias_desde_ultima_visita_min) return false
      if (filtros.dias_desde_ultima_visita_max !== undefined && (cliente.dias_desde_ultima_visita || 0) > filtros.dias_desde_ultima_visita_max) return false
      if (filtros.puntos_min !== undefined && cliente.puntos_totales < filtros.puntos_min) return false
      if (filtros.puntos_max !== undefined && cliente.puntos_totales > filtros.puntos_max) return false
      return true
    })

    const todosSeleccionados = clientesVisibles.every(c => clientesSeleccionados.has(c.id))

    if (todosSeleccionados) {
      // Deseleccionar todos los visibles
      const nuevaSeleccion = new Set(clientesSeleccionados)
      clientesVisibles.forEach(c => nuevaSeleccion.delete(c.id))
      setClientesSeleccionados(nuevaSeleccion)
      onClientesSeleccionados(Array.from(nuevaSeleccion))
    } else {
      // Seleccionar todos los visibles
      const nuevaSeleccion = new Set(clientesSeleccionados)
      clientesVisibles.forEach(c => nuevaSeleccion.add(c.id))
      setClientesSeleccionados(nuevaSeleccion)
      onClientesSeleccionados(Array.from(nuevaSeleccion))
    }
  }

  const clientesFiltrados = clientes.filter((cliente) => {
    if (filtros.ticket_medio_min !== undefined && (cliente.ticket_medio || 0) < filtros.ticket_medio_min) return false
    if (filtros.ticket_medio_max !== undefined && (cliente.ticket_medio || 0) > filtros.ticket_medio_max) return false
    if (filtros.num_visitas_min !== undefined && (cliente.num_compras || 0) < filtros.num_visitas_min) return false
    if (filtros.num_visitas_max !== undefined && (cliente.num_compras || 0) > filtros.num_visitas_max) return false
    if (filtros.edad_min !== undefined || filtros.edad_max !== undefined) {
      if (!cliente.fecha_nacimiento) return false
      const edad = calcularEdad(cliente.fecha_nacimiento)
      if (filtros.edad_min !== undefined && edad < filtros.edad_min) return false
      if (filtros.edad_max !== undefined && edad > filtros.edad_max) return false
    }
    if (filtros.dias_desde_ultima_visita_min !== undefined && (cliente.dias_desde_ultima_visita || 0) < filtros.dias_desde_ultima_visita_min) return false
    if (filtros.dias_desde_ultima_visita_max !== undefined && (cliente.dias_desde_ultima_visita || 0) > filtros.dias_desde_ultima_visita_max) return false
    if (filtros.puntos_min !== undefined && cliente.puntos_totales < filtros.puntos_min) return false
    if (filtros.puntos_max !== undefined && cliente.puntos_totales > filtros.puntos_max) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Sugerencias de Filtros */}
      {sugerencias.length > 0 && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Sparkles className="h-5 w-5" />
              Sugerencias de Segmentación
            </CardTitle>
            <CardDescription>
              Aplica filtros predefinidos con un solo clic para segmentar rápidamente tu audiencia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {sugerencias.map((sugerencia, idx) => (
                <Card key={idx} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => aplicarSugerencia(sugerencia)}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      {sugerencia.nombre}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-2">{sugerencia.descripcion}</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(sugerencia.filtros).map(([key, value]: [string, any]) => {
                        if (value !== undefined) {
                          const labels: Record<string, string> = {
                            ticket_medio_min: 'Ticket ≥',
                            ticket_medio_max: 'Ticket ≤',
                            num_visitas_min: 'Visitas ≥',
                            num_visitas_max: 'Visitas ≤',
                            edad_min: 'Edad ≥',
                            edad_max: 'Edad ≤',
                            dias_desde_ultima_visita_min: 'Días ≥',
                            dias_desde_ultima_visita_max: 'Días ≤',
                            puntos_min: 'Puntos ≥',
                            puntos_max: 'Puntos ≤',
                          }
                          return (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {labels[key]} {value}
                            </Badge>
                          )
                        }
                        return null
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros Manuales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Personalizados
          </CardTitle>
          <CardDescription>
            Ajusta manualmente los filtros para segmentar tu audiencia. Los clientes que cumplan los criterios se seleccionarán automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Ticket Medio */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Ticket Medio (€)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filtros.ticket_medio_min || ''}
                  onChange={(e) => setFiltros({ ...filtros, ticket_medio_min: e.target.value ? parseFloat(e.target.value) : undefined })}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filtros.ticket_medio_max || ''}
                  onChange={(e) => setFiltros({ ...filtros, ticket_medio_max: e.target.value ? parseFloat(e.target.value) : undefined })}
                />
              </div>
            </div>

            {/* Número de Compras */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Número de Compras</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filtros.num_visitas_min || ''}
                  onChange={(e) => setFiltros({ ...filtros, num_visitas_min: e.target.value ? parseInt(e.target.value) : undefined })}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filtros.num_visitas_max || ''}
                  onChange={(e) => setFiltros({ ...filtros, num_visitas_max: e.target.value ? parseInt(e.target.value) : undefined })}
                />
              </div>
            </div>

            {/* Puntos */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Puntos</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filtros.puntos_min || ''}
                  onChange={(e) => setFiltros({ ...filtros, puntos_min: e.target.value ? parseInt(e.target.value) : undefined })}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filtros.puntos_max || ''}
                  onChange={(e) => setFiltros({ ...filtros, puntos_max: e.target.value ? parseInt(e.target.value) : undefined })}
                />
              </div>
            </div>

            {/* Edad */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Edad (años)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filtros.edad_min || ''}
                  onChange={(e) => setFiltros({ ...filtros, edad_min: e.target.value ? parseInt(e.target.value) : undefined })}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filtros.edad_max || ''}
                  onChange={(e) => setFiltros({ ...filtros, edad_max: e.target.value ? parseInt(e.target.value) : undefined })}
                />
              </div>
            </div>

            {/* Días desde última visita */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Días sin venir</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filtros.dias_desde_ultima_visita_min || ''}
                  onChange={(e) => setFiltros({ ...filtros, dias_desde_ultima_visita_min: e.target.value ? parseInt(e.target.value) : undefined })}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filtros.dias_desde_ultima_visita_max || ''}
                  onChange={(e) => setFiltros({ ...filtros, dias_desde_ultima_visita_max: e.target.value ? parseInt(e.target.value) : undefined })}
                />
              </div>
            </div>

            {/* Género */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Género</Label>
              <Select
                value={filtros.genero || 'todos'}
                onValueChange={(v) => setFiltros({ ...filtros, genero: v === 'todos' ? undefined : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="femenino">Femenino</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                  <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Días desde última campaña */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Días desde última campaña</Label>
              <Input
                type="number"
                placeholder="Mínimo de días"
                value={filtros.dias_desde_ultima_campana_min || ''}
                onChange={(e) => setFiltros({ ...filtros, dias_desde_ultima_campana_min: e.target.value ? parseInt(e.target.value) : undefined })}
              />
              <p className="text-xs text-muted-foreground">
                Clientes que no recibieron campañas en X días
              </p>
            </div>

            {/* Solo sin campañas */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Historial de campañas</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={filtros.solo_sin_campanas || false}
                  onCheckedChange={(checked) => setFiltros({ ...filtros, solo_sin_campanas: checked as boolean })}
                />
                <Label className="text-sm font-normal cursor-pointer">
                  Solo clientes sin campañas previas
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Incluir solo clientes nuevos para campañas
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltros({})}
            >
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Clientes Destinatarios
              </CardTitle>
              <CardDescription>
                {clientesSeleccionados.size} de {clientesFiltrados.length} clientes seleccionados
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTodos}
              className="flex items-center gap-2"
            >
              {clientesFiltrados.every(c => clientesSeleccionados.has(c.id)) ? (
                <>
                  <Square className="h-4 w-4" />
                  Deseleccionar Todos
                </>
              ) : (
                <>
                  <CheckSquare className="h-4 w-4" />
                  Seleccionar Todos
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <Alert>
              <AlertDescription>
                No hay clientes que cumplan los criterios de filtrado. Ajusta los filtros para ver más resultados.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="border rounded-lg max-h-96 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Puntos</TableHead>
                    <TableHead className="text-right">Compras</TableHead>
                    <TableHead className="text-right">Ticket Medio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesFiltrados.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell>
                        <Checkbox
                          checked={clientesSeleccionados.has(cliente.id)}
                          onCheckedChange={() => toggleCliente(cliente.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{cliente.nombre}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{cliente.email}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{cliente.puntos_totales}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{cliente.total_compras || 0}</TableCell>
                      <TableCell className="text-right">
                        {cliente.ticket_medio ? `${cliente.ticket_medio.toFixed(2)} €` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
