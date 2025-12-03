'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Filter, Loader2, Lightbulb, Sparkles } from 'lucide-react'

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
    <div className="space-y-3">
      {/* Sugerencias de Filtros - Compacto */}
      {sugerencias.length > 0 && (
        <Card className="border border-blue-200 bg-blue-50/50">
          <CardHeader className="py-2 px-3">
            <CardTitle className="flex items-center gap-2 text-blue-900 text-sm">
              <Sparkles className="h-4 w-4" />
              Segmentación rápida
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-2">
            <div className="flex flex-wrap gap-1.5">
              {sugerencias.slice(0, 4).map((sugerencia, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 bg-white"
                  onClick={() => aplicarSugerencia(sugerencia)}
                >
                  <Lightbulb className="h-3 w-3 mr-1 text-amber-500" />
                  {sugerencia.nombre}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros Manuales - Compacto */}
      <Card>
        <CardHeader className="py-2 px-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
            {/* Ticket Medio */}
            <div className="space-y-1">
              <Label className="text-xs">Ticket (€)</Label>
              <div className="flex gap-1">
                <Input type="number" placeholder="Min" className="h-7 text-xs" value={filtros.ticket_medio_min || ''} onChange={(e) => setFiltros({ ...filtros, ticket_medio_min: e.target.value ? parseFloat(e.target.value) : undefined })} />
                <Input type="number" placeholder="Max" className="h-7 text-xs" value={filtros.ticket_medio_max || ''} onChange={(e) => setFiltros({ ...filtros, ticket_medio_max: e.target.value ? parseFloat(e.target.value) : undefined })} />
              </div>
            </div>

            {/* Número de Compras */}
            <div className="space-y-1">
              <Label className="text-xs">Compras</Label>
              <div className="flex gap-1">
                <Input type="number" placeholder="Min" className="h-7 text-xs" value={filtros.num_visitas_min || ''} onChange={(e) => setFiltros({ ...filtros, num_visitas_min: e.target.value ? parseInt(e.target.value) : undefined })} />
                <Input type="number" placeholder="Max" className="h-7 text-xs" value={filtros.num_visitas_max || ''} onChange={(e) => setFiltros({ ...filtros, num_visitas_max: e.target.value ? parseInt(e.target.value) : undefined })} />
              </div>
            </div>

            {/* Puntos */}
            <div className="space-y-1">
              <Label className="text-xs">Puntos</Label>
              <div className="flex gap-1">
                <Input type="number" placeholder="Min" className="h-7 text-xs" value={filtros.puntos_min || ''} onChange={(e) => setFiltros({ ...filtros, puntos_min: e.target.value ? parseInt(e.target.value) : undefined })} />
                <Input type="number" placeholder="Max" className="h-7 text-xs" value={filtros.puntos_max || ''} onChange={(e) => setFiltros({ ...filtros, puntos_max: e.target.value ? parseInt(e.target.value) : undefined })} />
              </div>
            </div>

            {/* Edad */}
            <div className="space-y-1">
              <Label className="text-xs">Edad</Label>
              <div className="flex gap-1">
                <Input type="number" placeholder="Min" className="h-7 text-xs" value={filtros.edad_min || ''} onChange={(e) => setFiltros({ ...filtros, edad_min: e.target.value ? parseInt(e.target.value) : undefined })} />
                <Input type="number" placeholder="Max" className="h-7 text-xs" value={filtros.edad_max || ''} onChange={(e) => setFiltros({ ...filtros, edad_max: e.target.value ? parseInt(e.target.value) : undefined })} />
              </div>
            </div>

            {/* Días sin venir */}
            <div className="space-y-1">
              <Label className="text-xs">Días sin venir</Label>
              <div className="flex gap-1">
                <Input type="number" placeholder="Min" className="h-7 text-xs" value={filtros.dias_desde_ultima_visita_min || ''} onChange={(e) => setFiltros({ ...filtros, dias_desde_ultima_visita_min: e.target.value ? parseInt(e.target.value) : undefined })} />
                <Input type="number" placeholder="Max" className="h-7 text-xs" value={filtros.dias_desde_ultima_visita_max || ''} onChange={(e) => setFiltros({ ...filtros, dias_desde_ultima_visita_max: e.target.value ? parseInt(e.target.value) : undefined })} />
              </div>
            </div>

            {/* Género */}
            <div className="space-y-1">
              <Label className="text-xs">Género</Label>
              <Select value={filtros.genero || 'todos'} onValueChange={(v) => setFiltros({ ...filtros, genero: v === 'todos' ? undefined : v })}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="masculino">M</SelectItem>
                  <SelectItem value="femenino">F</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button variant="ghost" size="sm" className="mt-2 text-xs h-6" onClick={() => setFiltros({})}>
            Limpiar
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Clientes - Compacta */}
      <Card>
        <CardHeader className="py-2 px-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Destinatarios
              </CardTitle>
              <CardDescription className="text-xs">
                {clientesSeleccionados.size}/{clientesFiltrados.length} seleccionados
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTodos} className="text-xs h-7">
              {clientesFiltrados.every(c => clientesSeleccionados.has(c.id)) ? 'Ninguno' : 'Todos'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-2">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">No hay clientes con estos filtros</p>
          ) : (
            <div className="border rounded-lg max-h-40 overflow-y-auto divide-y">
              {clientesFiltrados.map((cliente) => (
                <div
                  key={cliente.id}
                  className="flex items-center gap-2 p-1.5 hover:bg-muted/50 cursor-pointer"
                  onClick={() => toggleCliente(cliente.id)}
                >
                  <Checkbox
                    checked={clientesSeleccionados.has(cliente.id)}
                    onCheckedChange={() => toggleCliente(cliente.id)}
                    className="h-4 w-4"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{cliente.nombre}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{cliente.email}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] h-5 shrink-0">
                    {cliente.puntos_totales}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
