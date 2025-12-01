'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserPlus, Coins, Gift, Users, Trophy, Loader2, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Milestone {
  id?: string
  nombre: string
  cantidad_referidos: number
  tipo_recompensa: 'puntos' | 'regalo_concreto' | 'ambos'
  puntos: number
  id_regalo?: string
}

interface RegaloItem {
  id: string
  nombre: string
  icono?: string
  tipo: string
}

interface Paso4bReferidosProps {
  datosIniciales?: {
    referidos_activo?: boolean
    puntos_referidor?: number
    puntos_referido?: number
    milestones?: Milestone[]
  }
  onChange: (data: any) => void
}

export function Paso4bReferidos({ datosIniciales, onChange }: Paso4bReferidosProps) {
  const [referidosActivo, setReferidosActivo] = useState(datosIniciales?.referidos_activo ?? true)
  const [puntosReferidor, setPuntosReferidor] = useState(datosIniciales?.puntos_referidor || 100)
  const [puntosReferido, setPuntosReferido] = useState(datosIniciales?.puntos_referido || 50)
  const [milestones, setMilestones] = useState<Milestone[]>(
    datosIniciales?.milestones || [
      { nombre: 'Invita 3 amigos', cantidad_referidos: 3, tipo_recompensa: 'puntos', puntos: 200 },
      { nombre: 'Invita 5 amigos', cantidad_referidos: 5, tipo_recompensa: 'puntos', puntos: 500 },
      { nombre: 'Super Referidor', cantidad_referidos: 10, tipo_recompensa: 'puntos', puntos: 1000 },
    ]
  )
  const [catalogoRegalos, setCatalogoRegalos] = useState<RegaloItem[]>([])
  const [cargandoRegalos, setCargandoRegalos] = useState(false)

  // Cargar catalogo de regalos
  useEffect(() => {
    const cargarCatalogo = async () => {
      setCargandoRegalos(true)
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
        console.error('Error cargando catalogo:', error)
      } finally {
        setCargandoRegalos(false)
      }
    }

    cargarCatalogo()
  }, [])

  // Notificar cambios
  useEffect(() => {
    onChange({
      referidos_activo: referidosActivo,
      puntos_referidor: referidosActivo ? puntosReferidor : 0,
      puntos_referido: referidosActivo ? puntosReferido : 0,
      milestones: referidosActivo ? milestones : [],
    })
  }, [referidosActivo, puntosReferidor, puntosReferido, milestones])

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

  const getRegaloIcono = (id?: string) => {
    const regalo = catalogoRegalos.find((r) => r.id === id)
    return regalo?.icono || '🎁'
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
          Incentiva a tus clientes a traer amigos con recompensas para ambos
        </p>
      </div>

      {/* Activar/Desactivar */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-semibold">Activar programa de referidos</Label>
            <p className="text-sm text-muted-foreground">
              Los clientes podran compartir su codigo y ganar recompensas
            </p>
          </div>
          <Switch checked={referidosActivo} onCheckedChange={setReferidosActivo} />
        </div>
      </Card>

      {referidosActivo && (
        <>
          {/* Puntos por referido */}
          <Card className="p-6 space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Coins className="h-5 w-5 text-amber-500" />
              Puntos por referido exitoso
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quien refiere */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <Label>Cliente que refiere</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="0"
                    step="50"
                    value={puntosReferidor}
                    onChange={(e) => setPuntosReferidor(Number(e.target.value))}
                    className="max-w-[120px]"
                  />
                  <span className="text-sm text-muted-foreground">puntos</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Puntos que gana quien invita a un amigo
                </p>
              </div>

              {/* Quien es referido */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-green-500" />
                  <Label>Nuevo cliente referido</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="0"
                    step="50"
                    value={puntosReferido}
                    onChange={(e) => setPuntosReferido(Number(e.target.value))}
                    className="max-w-[120px]"
                  />
                  <span className="text-sm text-muted-foreground">puntos</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Puntos que gana el nuevo cliente al registrarse
                </p>
              </div>
            </div>
          </Card>

          {/* Milestones */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Objetivos (Milestones)
              </div>
              <Button variant="outline" size="sm" onClick={agregarMilestone}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Recompensas especiales cuando el cliente alcanza cierto numero de referidos
            </p>

            <div className="space-y-3">
              {milestones.map((milestone, index) => (
                <Card key={index} className="p-4 bg-gray-50">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                      {/* Nombre */}
                      <div className="space-y-1">
                        <Label className="text-xs">Nombre</Label>
                        <Input
                          value={milestone.nombre}
                          onChange={(e) => actualizarMilestone(index, 'nombre', e.target.value)}
                          placeholder="Ej: Super Referidor"
                        />
                      </div>

                      {/* Cantidad */}
                      <div className="space-y-1">
                        <Label className="text-xs">Referidos necesarios</Label>
                        <Input
                          type="number"
                          min="1"
                          value={milestone.cantidad_referidos}
                          onChange={(e) =>
                            actualizarMilestone(index, 'cantidad_referidos', Number(e.target.value))
                          }
                        />
                      </div>

                      {/* Tipo recompensa */}
                      <div className="space-y-1">
                        <Label className="text-xs">Tipo de recompensa</Label>
                        <Select
                          value={milestone.tipo_recompensa}
                          onValueChange={(v) => actualizarMilestone(index, 'tipo_recompensa', v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="puntos">Solo puntos</SelectItem>
                            <SelectItem value="regalo_concreto">Producto/Servicio</SelectItem>
                            <SelectItem value="ambos">Puntos + Producto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Valor */}
                      <div className="space-y-1">
                        {milestone.tipo_recompensa === 'puntos' && (
                          <>
                            <Label className="text-xs">Puntos</Label>
                            <Input
                              type="number"
                              min="0"
                              step="100"
                              value={milestone.puntos}
                              onChange={(e) =>
                                actualizarMilestone(index, 'puntos', Number(e.target.value))
                              }
                            />
                          </>
                        )}
                        {milestone.tipo_recompensa === 'regalo_concreto' && (
                          <>
                            <Label className="text-xs">Producto/Servicio</Label>
                            {cargandoRegalos ? (
                              <div className="flex items-center gap-2 h-10 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Cargando...
                              </div>
                            ) : catalogoRegalos.length > 0 ? (
                              <Select
                                value={milestone.id_regalo || ''}
                                onValueChange={(v) => actualizarMilestone(index, 'id_regalo', v)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                  {catalogoRegalos.map((regalo) => (
                                    <SelectItem key={regalo.id} value={regalo.id}>
                                      {regalo.icono || '🎁'} {regalo.nombre}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <p className="text-xs text-orange-600 py-2">
                                Crea productos en Configuracion - Productos
                              </p>
                            )}
                          </>
                        )}
                        {milestone.tipo_recompensa === 'ambos' && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                className="w-20"
                                placeholder="Pts"
                                value={milestone.puntos}
                                onChange={(e) =>
                                  actualizarMilestone(index, 'puntos', Number(e.target.value))
                                }
                              />
                              <span className="text-xs">+</span>
                              {catalogoRegalos.length > 0 ? (
                                <Select
                                  value={milestone.id_regalo || ''}
                                  onValueChange={(v) => actualizarMilestone(index, 'id_regalo', v)}
                                >
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Regalo" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {catalogoRegalos.map((regalo) => (
                                      <SelectItem key={regalo.id} value={regalo.id}>
                                        {regalo.icono || '🎁'} {regalo.nombre}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <span className="text-xs text-muted-foreground">Sin productos</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Eliminar */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => eliminarMilestone(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}

              {milestones.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay milestones configurados</p>
                  <Button variant="link" size="sm" onClick={agregarMilestone}>
                    Agregar primer milestone
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Preview */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="space-y-3">
              <p className="font-medium text-blue-900">Asi funciona para tus clientes:</p>
              <div className="bg-white p-4 rounded-lg border shadow-sm space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Juan invita a Maria</p>
                    <p className="text-muted-foreground">
                      Juan gana <span className="font-semibold text-amber-600">+{puntosReferidor} pts</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <UserPlus className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Maria se registra</p>
                    <p className="text-muted-foreground">
                      Maria recibe <span className="font-semibold text-amber-600">+{puntosReferido} pts</span> de bienvenida
                    </p>
                  </div>
                </div>
                {milestones.length > 0 && (
                  <div className="flex items-center gap-3 text-sm pt-2 border-t">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Trophy className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">Juan alcanza {milestones[0].cantidad_referidos} referidos</p>
                      <p className="text-muted-foreground">
                        Desbloquea: <span className="font-semibold text-yellow-600">{milestones[0].nombre}</span>
                        {milestones[0].tipo_recompensa !== 'regalo_concreto' && (
                          <span> (+{milestones[0].puntos} pts)</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Consejo:</strong> Los programas de referidos pueden aumentar tu base de clientes
          hasta un 25%. Ofrece recompensas atractivas tanto para quien refiere como para el nuevo cliente.
        </p>
      </div>
    </div>
  )
}
