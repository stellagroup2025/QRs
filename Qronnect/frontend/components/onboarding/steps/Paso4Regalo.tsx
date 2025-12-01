'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Gift, Coins, Percent, Package, Loader2, UserPlus, Users, Trophy, Plus, X } from 'lucide-react'

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

interface Paso4RegaloProps {
  datosIniciales?: {
    tipo_regalo?: 'puntos' | 'descuento' | 'regalo' | 'ninguno'
    cantidad_puntos?: number
    descuento_porcentaje?: number
    id_regalo?: string
    referidos_activo?: boolean
    puntos_referidor?: number
    puntos_referido?: number
    milestones?: Milestone[]
  }
  onChange: (data: any) => void
}

export function Paso4Regalo({ datosIniciales, onChange }: Paso4RegaloProps) {
  // Estados para regalo de bienvenida
  const [tipoRegalo, setTipoRegalo] = useState(datosIniciales?.tipo_regalo || 'puntos')
  const [cantidadPuntos, setCantidadPuntos] = useState(datosIniciales?.cantidad_puntos || 100)
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(
    datosIniciales?.descuento_porcentaje || 10
  )
  const [idRegaloSeleccionado, setIdRegaloSeleccionado] = useState(datosIniciales?.id_regalo || '')

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
        console.error('Error cargando catalogo de regalos:', error)
      } finally {
        setCargandoRegalos(false)
      }
    }

    cargarCatalogo()
  }, [])

  // Notificar cambios al padre
  useEffect(() => {
    onChange({
      // Regalo de bienvenida
      tipo_regalo: tipoRegalo,
      cantidad_puntos: tipoRegalo === 'puntos' ? cantidadPuntos : undefined,
      descuento_porcentaje: tipoRegalo === 'descuento' ? descuentoPorcentaje : undefined,
      id_regalo: tipoRegalo === 'regalo' ? idRegaloSeleccionado : undefined,
      // Referidos
      referidos_activo: referidosActivo,
      puntos_referidor: referidosActivo ? puntosReferidor : 0,
      puntos_referido: referidosActivo ? puntosReferido : 0,
      milestones: referidosActivo ? milestones : [],
    })
  }, [tipoRegalo, cantidadPuntos, descuentoPorcentaje, idRegaloSeleccionado,
      referidosActivo, puntosReferidor, puntosReferido, milestones])

  const regaloSeleccionado = catalogoRegalos.find(r => r.id === idRegaloSeleccionado)

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
          <Gift className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Recompensas e Incentivos</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Configura las recompensas para nuevos clientes y el programa de referidos
        </p>
      </div>

      <Tabs defaultValue="bienvenida" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bienvenida" className="gap-2">
            <Gift className="h-4 w-4" />
            Regalo Bienvenida
          </TabsTrigger>
          <TabsTrigger value="referidos" className="gap-2">
            <UserPlus className="h-4 w-4" />
            Referidos
          </TabsTrigger>
        </TabsList>

        {/* TAB: Regalo de Bienvenida */}
        <TabsContent value="bienvenida" className="space-y-4 mt-4">
          <RadioGroup value={tipoRegalo} onValueChange={setTipoRegalo}>
            <div className="space-y-3">
              {/* Opcion: Puntos */}
              <Card
                className={`p-4 cursor-pointer transition-all ${
                  tipoRegalo === 'puntos'
                    ? 'ring-2 ring-primary border-primary'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setTipoRegalo('puntos')}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="puntos" id="regalo-puntos" className="mt-1" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-amber-500" />
                      <Label htmlFor="regalo-puntos" className="font-semibold cursor-pointer">
                        Puntos de Bienvenida
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Los nuevos clientes reciben puntos al registrarse
                    </p>

                    {tipoRegalo === 'puntos' && (
                      <div className="space-y-2 pt-2">
                        <Label htmlFor="cantidad-puntos" className="text-sm">
                          Cantidad de puntos:
                        </Label>
                        <div className="flex items-center gap-3">
                          <Input
                            id="cantidad-puntos"
                            type="number"
                            min="0"
                            step="50"
                            value={cantidadPuntos}
                            onChange={(e) => setCantidadPuntos(Number(e.target.value))}
                            className="max-w-[150px]"
                          />
                          <span className="text-sm text-muted-foreground">puntos</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Opcion: Descuento */}
              <Card
                className={`p-4 cursor-pointer transition-all ${
                  tipoRegalo === 'descuento'
                    ? 'ring-2 ring-primary border-primary'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setTipoRegalo('descuento')}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="descuento" id="regalo-descuento" className="mt-1" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Percent className="h-5 w-5 text-green-500" />
                      <Label htmlFor="regalo-descuento" className="font-semibold cursor-pointer">
                        Descuento en Primera Compra
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Un cupon de descuento para usar en su primera visita
                    </p>

                    {tipoRegalo === 'descuento' && (
                      <div className="space-y-2 pt-2">
                        <Label htmlFor="descuento-porcentaje" className="text-sm">
                          Porcentaje de descuento:
                        </Label>
                        <div className="flex items-center gap-3">
                          <Input
                            id="descuento-porcentaje"
                            type="number"
                            min="5"
                            max="50"
                            step="5"
                            value={descuentoPorcentaje}
                            onChange={(e) => setDescuentoPorcentaje(Number(e.target.value))}
                            className="max-w-[150px]"
                          />
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Opcion: Regalo/Producto Gratis */}
              <Card
                className={`p-4 cursor-pointer transition-all ${
                  tipoRegalo === 'regalo'
                    ? 'ring-2 ring-primary border-primary'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setTipoRegalo('regalo')}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem value="regalo" id="regalo-producto" className="mt-1" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-purple-500" />
                      <Label htmlFor="regalo-producto" className="font-semibold cursor-pointer">
                        Producto o Servicio Gratis
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Un regalo fisico o servicio gratuito de tu catalogo
                    </p>

                    {tipoRegalo === 'regalo' && (
                      <div className="space-y-2 pt-2">
                        {cargandoRegalos ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Cargando catalogo...
                          </div>
                        ) : catalogoRegalos.length > 0 ? (
                          <>
                            <Label htmlFor="regalo-seleccionado" className="text-sm">
                              Selecciona el regalo:
                            </Label>
                            <Select value={idRegaloSeleccionado} onValueChange={setIdRegaloSeleccionado}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Elige un regalo del catalogo" />
                              </SelectTrigger>
                              <SelectContent>
                                {catalogoRegalos.map((regalo) => (
                                  <SelectItem key={regalo.id} value={regalo.id}>
                                    <div className="flex items-center gap-2">
                                      <span>{regalo.icono || '🎁'}</span>
                                      <span>{regalo.nombre}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </>
                        ) : (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <p className="text-sm text-orange-800 mb-2">
                              No tienes productos en tu catalogo todavia.
                            </p>
                            <p className="text-xs text-orange-600">
                              Crea productos en Configuracion - Productos y Servicios
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Opcion: Ninguno */}
              <Card
                className={`p-4 cursor-pointer transition-all ${
                  tipoRegalo === 'ninguno'
                    ? 'ring-2 ring-primary border-primary'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setTipoRegalo('ninguno')}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value="ninguno" id="regalo-ninguno" />
                  <Label htmlFor="regalo-ninguno" className="font-semibold cursor-pointer">
                    Sin regalo de bienvenida
                  </Label>
                </div>
              </Card>
            </div>
          </RadioGroup>
        </TabsContent>

        {/* TAB: Referidos */}
        <TabsContent value="referidos" className="space-y-4 mt-4">
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
                  Recompensas al alcanzar cierto numero de referidos
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
                    <span className="text-blue-600 font-medium">Juan</span> invita a Maria →{' '}
                    <span className="text-amber-600 font-semibold">+{puntosReferidor} pts</span>
                  </p>
                  <p>
                    <span className="text-green-600 font-medium">Maria</span> se registra →{' '}
                    <span className="text-amber-600 font-semibold">+{puntosReferido} pts</span>
                  </p>
                </div>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Consejo:</strong> Combinar un regalo de bienvenida atractivo con un programa de
          referidos puede aumentar tu base de clientes hasta un 40%.
        </p>
      </div>
    </div>
  )
}
