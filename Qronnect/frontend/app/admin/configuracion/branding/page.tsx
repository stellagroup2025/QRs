'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

import { Paintbrush, Upload, Store, Save, Loader2 } from 'lucide-react'

interface BrandingConfig {
  nombre_comercial: string
  logo_url?: string
  color_primario: string
  color_secundario: string
  color_acento: string
}

export default function ConfiguracionBrandingPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<BrandingConfig>({
    nombre_comercial: '',
    color_primario: '#0ea5e9',
    color_secundario: '#6366f1',
    color_acento: '#22c55e',
  })

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const token = localStorage.getItem('admin_token')
      const domain = window.location.hostname.split('.')[0]

      const response = await fetch(`${API_URL}/api/tiendas/branding`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': domain === 'localhost' ? 'visionplus' : domain,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setConfig({
          nombre_comercial: data.nombre_comercial || '',
          logo_url: data.logo_url,
          color_primario: data.color_primario || '#0ea5e9',
          color_secundario: data.color_secundario || '#6366f1',
          color_acento: data.color_acento || '#22c55e',
        })
      }
    } catch (error) {
      console.error('Error cargando branding:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cargar la configuración de branding',
      })
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const token = localStorage.getItem('admin_token')
      const domain = window.location.hostname.split('.')[0]

      const response = await fetch(`${API_URL}/api/tiendas/config/branding`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': domain === 'localhost' ? 'visionplus' : domain,
        },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        toast({
          title: 'Guardado',
          description: 'Configuración de branding actualizada correctamente',
        })
        // Recargar la página para que se apliquen los cambios
        setTimeout(() => window.location.reload(), 1000)
      } else {
        throw new Error('Error al guardar')
      }
    } catch (error) {
      console.error('Error guardando branding:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo guardar la configuración',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>

        <div className="container mx-auto p-4 md:p-6 lg:p-8">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </div>
      </>
    )
  }

  return (
    <>

      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Configuración de Branding</h1>
            <p className="text-muted-foreground text-sm">
              Personaliza la identidad visual de tu marca
            </p>
          </div>
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

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Formulario */}
          <div className="space-y-6">
            <Card className="dark:bg-slate-900 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Información Básica
                </CardTitle>
                <CardDescription>
                  Configura el nombre y logo de tu negocio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Nombre Comercial */}
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre de tu negocio</Label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Cafetería El Aroma"
                    value={config.nombre_comercial}
                    onChange={(e) => setConfig({ ...config, nombre_comercial: e.target.value })}
                    className="text-lg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Este nombre aparecerá en todos tus emails y mensajes
                  </p>
                </div>

                {/* Logo Upload (placeholder) */}
                <div className="space-y-2">
                  <Label>Logo (opcional)</Label>
                  <Card className="border-2 border-dashed p-8 dark:bg-slate-900 dark:border-slate-800">
                    <div className="text-center space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Arrastra tu logo aquí o haz clic para subir
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG o SVG (máx. 2MB)
                      </p>
                    </div>
                  </Card>
                  <p className="text-xs text-muted-foreground">
                    Funcionalidad de carga de logo próximamente
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-900 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paintbrush className="h-5 w-5" />
                  Colores de Marca
                </CardTitle>
                <CardDescription>
                  Define la paleta de colores de tu marca
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Color Primario */}
                <div className="space-y-2">
                  <Label htmlFor="color-primario">Color Principal</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm"
                      style={{ backgroundColor: config.color_primario }}
                    />
                    <div className="flex-1 space-y-1">
                      <Input
                        id="color-primario"
                        type="color"
                        value={config.color_primario}
                        onChange={(e) => setConfig({ ...config, color_primario: e.target.value })}
                        className="h-12 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={config.color_primario}
                        onChange={(e) => setConfig({ ...config, color_primario: e.target.value })}
                        className="h-8 text-xs font-mono"
                        placeholder="#0ea5e9"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Botones, enlaces</p>
                </div>

                {/* Color Secundario */}
                <div className="space-y-2">
                  <Label htmlFor="color-secundario">Color Secundario</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm"
                      style={{ backgroundColor: config.color_secundario }}
                    />
                    <div className="flex-1 space-y-1">
                      <Input
                        id="color-secundario"
                        type="color"
                        value={config.color_secundario}
                        onChange={(e) => setConfig({ ...config, color_secundario: e.target.value })}
                        className="h-12 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={config.color_secundario}
                        onChange={(e) => setConfig({ ...config, color_secundario: e.target.value })}
                        className="h-8 text-xs font-mono"
                        placeholder="#6366f1"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Encabezados, fondos</p>
                </div>

                {/* Color Acento */}
                <div className="space-y-2">
                  <Label htmlFor="color-acento">Color de Acento</Label>
                  <div className="flex gap-2">
                    <div
                      className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm"
                      style={{ backgroundColor: config.color_acento }}
                    />
                    <div className="flex-1 space-y-1">
                      <Input
                        id="color-acento"
                        type="color"
                        value={config.color_acento}
                        onChange={(e) => setConfig({ ...config, color_acento: e.target.value })}
                        className="h-12 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={config.color_acento}
                        onChange={(e) => setConfig({ ...config, color_acento: e.target.value })}
                        className="h-8 text-xs font-mono"
                        placeholder="#22c55e"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Alertas, badges</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <Card className="dark:bg-slate-900 dark:border-slate-800">
              <CardHeader>
                <CardTitle>Vista Previa</CardTitle>
                <CardDescription>
                  Así se verá tu branding en la aplicación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="p-6 rounded-lg text-white shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${config.color_primario} 0%, ${config.color_secundario} 100%)`,
                  }}
                >
                  <h4 className="text-2xl font-bold mb-2">{config.nombre_comercial || 'Tu Negocio'}</h4>
                  <p className="text-sm opacity-90 mb-4">
                    ¡Únete a nuestro programa de fidelización y gana recompensas!
                  </p>
                  <div
                    className="inline-block px-4 py-2 rounded-lg font-medium text-sm"
                    style={{ backgroundColor: config.color_acento }}
                  >
                    Obtener Puntos
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
              <p className="text-sm text-blue-900">
                <strong>💡 Consejo:</strong> Usa los colores de tu marca existente para que tus
                clientes reconozcan fácilmente tus comunicaciones. Los cambios se aplicarán en toda
                la plataforma.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
