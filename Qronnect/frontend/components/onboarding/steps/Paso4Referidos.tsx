'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Coins, UserPlus, Users, Trophy, Plus, X } from 'lucide-react'

interface RegaloItem {
  id: string
  nombre: string
  descripcion?: string
  tipo: string
  icono?: string
}

interface Milestone {
  nombre: string
  cantidad_referidos: number
  tipo_recompensa: 'puntos' | 'regalo_concreto' | 'ambos'
  puntos: number
  id_regalo?: string
}

interface Paso4ReferidosProps {
  datosIniciales?: {
    referidos_activo?: boolean
    puntos_referidor?: number
    puntos_referido?: number
    milestones?: Milestone[]
  }
  onChange: (data: any) => void
}

export function Paso4Referidos({ datosIniciales, onChange }: Paso4ReferidosProps) {
  // Estados para referidos
  const [referidosActivo, setReferidosActivo] = useState(datosIniciales?.referidos_activo ?? true)
  const [puntosReferidor, setPuntosReferidor] = useState(datosIniciales?.puntos_referidor || 100)
  const [puntosReferido, setPuntosReferido] = useState(datosIniciales?.puntos_referido || 50)
  const [milestones, setMilestones] = useState<Milestone[]>(
    datosIniciales?.milestones || [
      { nombre: 'Invita 3 amigos', cantidad_referidos: 3, tipo_recompensa: 'puntos', puntos: 200 },
      { nombre: 'Invita 5 amigos', cantidad_referidos: 5, tipo_recompensa: 'puntos', puntos: 500 },
    ]
  )

  // Catalogo de regalos
  const [catalogoRegalos, setCatalogoRegalos] = useState<RegaloItem[]>([])

  // Cargar catalogo de regalos
  useEffect(() => {
    const cargarCatalogo = async () => {
      try {
        const domain = window.location.hostname.split('.')[0]
        const token = localStorage.getItem(`admin_token_${domain}`) || localStorage.getItem('admin_token')

        if (!token) return

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const response = await fetch(`${API_URL}/api/regalos/catalogo`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Tenant-Domain': domain,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setCatalogoRegalos(data || [])
        }
      } catch (error) {
        console.error('Error cargando catalogo de regalos:', error)
      }
    }

    cargarCatalogo()
  }, [])

  // Notificar cambios al padre
  useEffect(() => {
    onChange({
      referidos_activo: referidosActivo,
      puntos_referidor: referidosActivo ? puntosReferidor : 0,
      puntos_referido: referidosActivo ? puntosReferido : 0,
      milestones: referidosActivo ? milestones : [],
    })
  }, [referidosActivo, puntosReferidor, puntosReferido, milestones])

  // Funciones para milestones
  const actualizarMilestone = (index: number, campo: keyof Milestone, valor: any) => {
    const nuevosMilestones = [...milestones]
    nuevosMilestones[index] = { ...nuevosMilestones[index], [campo]: valor }
    setMilestones(nuevosMilestones)
  }

  const agregarMilestone = () => {
    const ultimoMilestone = milestones[milestones.length - 1]
    const nuevaCantidad = ultimoMilestone ? ultimoMilestone.cantidad_referidos + 5 : 5
    setMilestones([
      ...milestones,
      {
        nombre: `Invita ${nuevaCantidad} amigos`,
        cantidad_referidos: nuevaCantidad,
        tipo_recompensa: 'puntos',
        puntos: nuevaCantidad * 100,
      },
    ])
  }

  const eliminarMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <UserPlus className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Programa de Referidos</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Permite que tus clientes inviten amigos y ganen recompensas
        </p>
      </div>

      {/* Activar/Desactivar */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-semibold">Activar programa de referidos</Label>
            <p className="text-sm text-muted-foreground">
              Los clientes podrán compartir su código y ganar recompensas
            </p>
          </div>
          <Switch checked={referidosActivo} onCheckedChange={setReferidosActivo} />
        </div>
      </Card>

      {referidosActivo && (
        <>
          {/* Puntos por referido */}
          <Card className="p-4 space-y-4">
            <div className="flex items-center gap-2 font-semibold">
              <Coins className="h-5 w-5 text-amber-500" />
              Puntos por referido exitoso
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <Label className="text-sm">Quien refiere</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="50"
                    value={puntosReferidor}
                    onChange={(e) => setPuntosReferidor(Number(e.target.value))}
                    className="max-w-[100px]"
                  />
                  <span className="text-xs text-muted-foreground">pts</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-green-500" />
                  <Label className="text-sm">Nuevo cliente</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="50"
                    value={puntosReferido}
                    onChange={(e) => setPuntosReferido(Number(e.target.value))}
                    className="max-w-[100px]"
                  />
                  <span className="text-xs text-muted-foreground">pts</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Milestones */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Objetivos (Milestones)
              </div>
              <Button variant="outline" size="sm" onClick={agregarMilestone}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Recompensas al alcanzar cierto número de referidos
            </p>

            <div className="space-y-2">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <Input
                    value={milestone.nombre}
                    onChange={(e) => actualizarMilestone(index, 'nombre', e.target.value)}
                    className="flex-1 h-8 text-sm"
                    placeholder="Nombre"
                  />
                  <Input
                    type="number"
                    min="1"
                    value={milestone.cantidad_referidos}
                    onChange={(e) => actualizarMilestone(index, 'cantidad_referidos', Number(e.target.value))}
                    className="w-16 h-8 text-sm"
                  />
                  <span className="text-xs text-muted-foreground">refs</span>
                  <Input
                    type="number"
                    min="0"
                    value={milestone.puntos}
                    onChange={(e) => actualizarMilestone(index, 'puntos', Number(e.target.value))}
                    className="w-20 h-8 text-sm"
                  />
                  <span className="text-xs text-muted-foreground">pts</span>
                  {catalogoRegalos.length > 0 && (
                    <Select
                      value={milestone.id_regalo || 'none'}
                      onValueChange={(v) => actualizarMilestone(index, 'id_regalo', v === 'none' ? undefined : v)}
                    >
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue placeholder="+ Regalo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin regalo</SelectItem>
                        {catalogoRegalos.map((regalo) => (
                          <SelectItem key={regalo.id} value={regalo.id}>
                            {regalo.icono || '🎁'} {regalo.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => eliminarMilestone(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {milestones.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Sin milestones. Haz clic en + para agregar.
                </div>
              )}
            </div>
          </Card>

          {/* Preview referidos */}
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-2">Vista previa:</p>
            <div className="bg-white p-3 rounded border text-sm space-y-2">
              <p>
                <span className="text-blue-600 font-medium">Juan</span> invita a María →{' '}
                <span className="text-amber-600 font-semibold">+{puntosReferidor} pts</span>
              </p>
              <p>
                <span className="text-green-600 font-medium">María</span> se registra →{' '}
                <span className="text-amber-600 font-semibold">+{puntosReferido} pts</span>
              </p>
            </div>
          </Card>
        </>
      )}

      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Consejo:</strong> Un programa de referidos bien diseñado puede aumentar tu base de
          clientes hasta un 40%. Ofrece recompensas atractivas para ambas partes.
        </p>
      </div>
    </div>
  )
}
