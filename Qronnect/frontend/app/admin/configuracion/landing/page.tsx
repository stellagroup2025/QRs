"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, Eye, Monitor } from "lucide-react"
import { LandingConfig } from "@/hooks/use-landing"
import { LandingPreview } from "@/components/LandingPreview"

const iconOptions = ["Users", "Gift", "TrendingUp", "QrCode", "Shield", "Zap", "Store"]

export default function LandingConfigPage() {
  const [config, setConfig] = useState<Partial<LandingConfig>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      const token = localStorage.getItem("admin_token")

      const host = window.location.host
      const domain = host.split(":")[0].split(".")[0]

      const response = await fetch(`${API_URL}/api/config/landing`, {
        headers: {
          "X-Tenant-Domain": domain === "localhost" ? "visionplus" : domain,
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la configuración",
        })
      }
    } catch (error) {
      console.error("Error loading config:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cargar la configuración",
      })
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    try {
      setSaving(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      const token = localStorage.getItem("admin_token")

      const host = window.location.host
      const domain = host.split(":")[0].split(".")[0]

      const response = await fetch(`${API_URL}/api/config/landing`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-Domain": domain === "localhost" ? "visionplus" : domain,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Configuración guardada correctamente",
        })
      } else {
        throw new Error("Error al guardar")
      }
    } catch (error) {
      console.error("Error saving config:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la configuración",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof LandingConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración de Landing Page</h1>
          <p className="text-muted-foreground mt-2">
            Personaliza todos los textos e imágenes de tu página de inicio
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Monitor className="w-4 h-4 mr-2" />
            Preview en Vivo
          </Button>
          <Button variant="outline" asChild>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Eye className="w-4 h-4 mr-2" />
              Abrir Landing
            </a>
          </Button>
          <Button onClick={saveConfig} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Modal de Preview en Vivo */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview en Vivo de tu Landing Page</DialogTitle>
            <DialogDescription>
              Así es como se verá tu landing page con los cambios actuales.
              Los cambios se actualizan en tiempo real mientras editas.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 border rounded-lg overflow-hidden">
            <LandingPreview config={config} scale={0.6} />
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="servicios">Servicios</TabsTrigger>
          <TabsTrigger value="beneficios">Beneficios</TabsTrigger>
          <TabsTrigger value="testimonios">Testimonios</TabsTrigger>
          <TabsTrigger value="cta">CTA Final</TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Sección Hero</CardTitle>
              <CardDescription>
                La primera sección que ven los visitantes. Debe ser impactante y clara.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hero_titulo_principal">Título Principal</Label>
                <Input
                  id="hero_titulo_principal"
                  value={config.hero_titulo_principal || ""}
                  onChange={(e) => updateField("hero_titulo_principal", e.target.value)}
                  placeholder="Impulsa tu negocio"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero_titulo_destacado">Título Destacado (con color)</Label>
                <Input
                  id="hero_titulo_destacado"
                  value={config.hero_titulo_destacado || ""}
                  onChange={(e) => updateField("hero_titulo_destacado", e.target.value)}
                  placeholder="al siguiente nivel"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero_subtitulo">Subtítulo</Label>
                <Textarea
                  id="hero_subtitulo"
                  value={config.hero_subtitulo || ""}
                  onChange={(e) => updateField("hero_subtitulo", e.target.value)}
                  placeholder="Descripción breve de tu servicio..."
                  rows={3}
                />
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hero_cta_principal">Botón Principal</Label>
                  <Input
                    id="hero_cta_principal"
                    value={config.hero_cta_principal || ""}
                    onChange={(e) => updateField("hero_cta_principal", e.target.value)}
                    placeholder="Solicitar Información"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero_cta_secundario">Botón Secundario</Label>
                  <Input
                    id="hero_cta_secundario"
                    value={config.hero_cta_secundario || ""}
                    onChange={(e) => updateField("hero_cta_secundario", e.target.value)}
                    placeholder="Acceder"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hero_social_proof">Social Proof</Label>
                <Input
                  id="hero_social_proof"
                  value={config.hero_social_proof || ""}
                  onChange={(e) => updateField("hero_social_proof", e.target.value)}
                  placeholder="Más de 500 comercios ya confían en nosotros"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Servicios */}
        <TabsContent value="servicios">
          <Card>
            <CardHeader>
              <CardTitle>Servicios / Soluciones</CardTitle>
              <CardDescription>
                Las 6 características principales de tu producto o servicio.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="servicios_titulo">Título de Sección</Label>
                  <Input
                    id="servicios_titulo"
                    value={config.servicios_titulo || ""}
                    onChange={(e) => updateField("servicios_titulo", e.target.value)}
                    placeholder="Soluciones completas para tu negocio"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servicios_subtitulo">Subtítulo</Label>
                  <Input
                    id="servicios_subtitulo"
                    value={config.servicios_subtitulo || ""}
                    onChange={(e) => updateField("servicios_subtitulo", e.target.value)}
                    placeholder="Todo lo que necesitas en una sola plataforma"
                  />
                </div>
              </div>

              <Separator />

              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className="space-y-3 p-4 border rounded-lg">
                  <h4 className="font-semibold">Servicio {num}</h4>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`servicio_${num}_icono`}>Icono</Label>
                      <select
                        id={`servicio_${num}_icono`}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                        value={config[`servicio_${num}_icono` as keyof LandingConfig] as string || ""}
                        onChange={(e) => updateField(`servicio_${num}_icono` as keyof LandingConfig, e.target.value)}
                      >
                        {iconOptions.map((icon) => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={`servicio_${num}_titulo`}>Título</Label>
                      <Input
                        id={`servicio_${num}_titulo`}
                        value={config[`servicio_${num}_titulo` as keyof LandingConfig] as string || ""}
                        onChange={(e) => updateField(`servicio_${num}_titulo` as keyof LandingConfig, e.target.value)}
                        placeholder="Nombre del servicio"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`servicio_${num}_descripcion`}>Descripción</Label>
                    <Textarea
                      id={`servicio_${num}_descripcion`}
                      value={config[`servicio_${num}_descripcion` as keyof LandingConfig] as string || ""}
                      onChange={(e) => updateField(`servicio_${num}_descripcion` as keyof LandingConfig, e.target.value)}
                      placeholder="Descripción breve del servicio..."
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Beneficios */}
        <TabsContent value="beneficios">
          <Card>
            <CardHeader>
              <CardTitle>Beneficios</CardTitle>
              <CardDescription>
                Lista de beneficios clave y estadísticas destacadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="beneficios_titulo">Título de Sección</Label>
                  <Input
                    id="beneficios_titulo"
                    value={config.beneficios_titulo || ""}
                    onChange={(e) => updateField("beneficios_titulo", e.target.value)}
                    placeholder="Por qué elegirnos"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="beneficios_subtitulo">Subtítulo</Label>
                  <Input
                    id="beneficios_subtitulo"
                    value={config.beneficios_subtitulo || ""}
                    onChange={(e) => updateField("beneficios_subtitulo", e.target.value)}
                    placeholder="Beneficios que marcan la diferencia"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold">Lista de Beneficios</h4>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <div key={num} className="space-y-2">
                    <Label htmlFor={`beneficio_${num}`}>Beneficio {num}</Label>
                    <Input
                      id={`beneficio_${num}`}
                      value={config[`beneficio_${num}` as keyof LandingConfig] as string || ""}
                      onChange={(e) => updateField(`beneficio_${num}` as keyof LandingConfig, e.target.value)}
                      placeholder="Describe un beneficio específico..."
                    />
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold">Estadísticas</h4>

                <div className="grid md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>Estadística Principal - Número</Label>
                    <Input
                      value={config.estadistica_principal_numero || ""}
                      onChange={(e) => updateField("estadistica_principal_numero", e.target.value)}
                      placeholder="500+"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estadística Principal - Texto</Label>
                    <Input
                      value={config.estadistica_principal_texto || ""}
                      onChange={(e) => updateField("estadistica_principal_texto", e.target.value)}
                      placeholder="Comercios activos"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>Estadística 1 - Número</Label>
                    <Input
                      value={config.estadistica_1_numero || ""}
                      onChange={(e) => updateField("estadistica_1_numero", e.target.value)}
                      placeholder="98%"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estadística 1 - Texto</Label>
                    <Input
                      value={config.estadistica_1_texto || ""}
                      onChange={(e) => updateField("estadistica_1_texto", e.target.value)}
                      placeholder="Satisfacción"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>Estadística 2 - Número</Label>
                    <Input
                      value={config.estadistica_2_numero || ""}
                      onChange={(e) => updateField("estadistica_2_numero", e.target.value)}
                      placeholder="24/7"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estadística 2 - Texto</Label>
                    <Input
                      value={config.estadistica_2_texto || ""}
                      onChange={(e) => updateField("estadistica_2_texto", e.target.value)}
                      placeholder="Soporte"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testimonios */}
        <TabsContent value="testimonios">
          <Card>
            <CardHeader>
              <CardTitle>Testimonios</CardTitle>
              <CardDescription>
                Opiniones de clientes satisfechos (3 testimonios).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="testimonios_titulo">Título de Sección</Label>
                <Input
                  id="testimonios_titulo"
                  value={config.testimonios_titulo || ""}
                  onChange={(e) => updateField("testimonios_titulo", e.target.value)}
                  placeholder="Lo que dicen nuestros clientes"
                />
              </div>

              <Separator />

              {[1, 2, 3].map((num) => (
                <div key={num} className="space-y-3 p-4 border rounded-lg">
                  <h4 className="font-semibold">Testimonio {num}</h4>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre</Label>
                      <Input
                        value={config[`testimonio_${num}_nombre` as keyof LandingConfig] as string || ""}
                        onChange={(e) => updateField(`testimonio_${num}_nombre` as keyof LandingConfig, e.target.value)}
                        placeholder="María García"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Cargo/Empresa</Label>
                      <Input
                        value={config[`testimonio_${num}_cargo` as keyof LandingConfig] as string || ""}
                        onChange={(e) => updateField(`testimonio_${num}_cargo` as keyof LandingConfig, e.target.value)}
                        placeholder="Gerente, Boutique Fashion"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Rating (1-5)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={config[`testimonio_${num}_rating` as keyof LandingConfig] as number || 5}
                        onChange={(e) => updateField(`testimonio_${num}_rating` as keyof LandingConfig, parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Contenido del testimonio</Label>
                    <Textarea
                      value={config[`testimonio_${num}_contenido` as keyof LandingConfig] as string || ""}
                      onChange={(e) => updateField(`testimonio_${num}_contenido` as keyof LandingConfig, e.target.value)}
                      placeholder="Escribe aquí el testimonio completo..."
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CTA Final */}
        <TabsContent value="cta">
          <Card>
            <CardHeader>
              <CardTitle>Call-to-Action Final</CardTitle>
              <CardDescription>
                La última oportunidad de conversión antes del footer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cta_final_titulo_1">Título Línea 1</Label>
                  <Input
                    id="cta_final_titulo_1"
                    value={config.cta_final_titulo_1 || ""}
                    onChange={(e) => updateField("cta_final_titulo_1", e.target.value)}
                    placeholder="¿Listo para transformar"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cta_final_titulo_2">Título Línea 2</Label>
                  <Input
                    id="cta_final_titulo_2"
                    value={config.cta_final_titulo_2 || ""}
                    onChange={(e) => updateField("cta_final_titulo_2", e.target.value)}
                    placeholder="tu negocio?"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cta_final_subtitulo">Subtítulo</Label>
                <Textarea
                  id="cta_final_subtitulo"
                  value={config.cta_final_subtitulo || ""}
                  onChange={(e) => updateField("cta_final_subtitulo", e.target.value)}
                  placeholder="Únete a cientos de comercios que ya están creciendo con nosotros"
                  rows={2}
                />
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cta_final_boton_principal">Botón Principal</Label>
                  <Input
                    id="cta_final_boton_principal"
                    value={config.cta_final_boton_principal || ""}
                    onChange={(e) => updateField("cta_final_boton_principal", e.target.value)}
                    placeholder="Solicitar Información"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cta_final_boton_secundario">Botón Secundario</Label>
                  <Input
                    id="cta_final_boton_secundario"
                    value={config.cta_final_boton_secundario || ""}
                    onChange={(e) => updateField("cta_final_boton_secundario", e.target.value)}
                    placeholder="Ver Demo"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
