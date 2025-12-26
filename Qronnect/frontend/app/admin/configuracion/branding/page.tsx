'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Paintbrush, Upload, Store, Save, Loader2, Image as ImageIcon, X } from 'lucide-react'
import Image from 'next/image'

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
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const token = localStorage.getItem('admin_token')
      const domain = window.location.hostname.split('.')[0]

      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'logo')

      const response = await fetch(`${API_URL}/api/config/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': domain === 'localhost' ? 'visionplus' : domain,
          // Note: Do NOT set Content-Type header manually for FormData, the browser sets it with boundary
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir imagen');
      }

      const data = await response.json()

      setConfig(prev => ({ ...prev, logo_url: data.url }))

      toast({
        title: 'Logo actualizado',
        description: 'La imagen se ha subido correctamente.',
      })

    } catch (error) {
      console.error('Error uploading logo:', error)
      toast({
        variant: 'destructive',
        title: 'Error subiendo logo',
        description: error instanceof Error ? error.message : 'No se pudo subir la imagen',
      })
    } finally {
      setUploadingLogo(false)
      // Reset input value to allow uploading same file again if needed
      if (fileInputRef.current) fileInputRef.current.value = ''
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
        // Recargar la página para que se apliquen los cambios visualmente en toda la app
        // setTimeout(() => window.location.reload(), 1500)
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
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  return (
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
            <CardContent className="space-y-6">
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

              {/* Logo Upload */}
              <div className="space-y-3">
                <Label>Logo del Negocio</Label>

                <div className="flex items-start gap-4">
                  {/* Preview Box */}
                  <div className="relative w-32 h-32 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden flex-shrink-0 group">
                    {config.logo_url ? (
                      <>
                        <Image
                          src={config.logo_url}
                          alt="Logo actual"
                          fill
                          className="object-contain p-2"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:text-white hover:bg-white/20"
                            onClick={() => setConfig(prev => ({ ...prev, logo_url: undefined }))}
                          >
                            <X className="w-6 h-6" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <ImageIcon className="w-10 h-10 text-gray-300" />
                    )}
                    {uploadingLogo && (
                      <div className="absolute inset-0 bg-white/80 dark:bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingLogo}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {config.logo_url ? 'Cambiar Logo' : 'Subir Logo'}
                    </Button>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Formato recomendado: PNG o SVG con fondo transparente. <br />
                      Tamaño máximo: 2MB.
                    </p>
                  </div>
                </div>
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
                      className="h-12 cursor-pointer w-full p-1"
                    />
                    <Input
                      type="text"
                      value={config.color_primario}
                      onChange={(e) => setConfig({ ...config, color_primario: e.target.value })}
                      className="h-8 text-xs font-mono uppercase"
                      placeholder="#0ea5e9"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Usado en botones, enlaces y elementos destacados principales.</p>
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
                      className="h-12 cursor-pointer w-full p-1"
                    />
                    <Input
                      type="text"
                      value={config.color_secundario}
                      onChange={(e) => setConfig({ ...config, color_secundario: e.target.value })}
                      className="h-8 text-xs font-mono uppercase"
                      placeholder="#6366f1"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Usado en fondos, encabezados secundarios y bordes suaves.</p>
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
                      className="h-12 cursor-pointer w-full p-1"
                    />
                    <Input
                      type="text"
                      value={config.color_acento}
                      onChange={(e) => setConfig({ ...config, color_acento: e.target.value })}
                      className="h-8 text-xs font-mono uppercase"
                      placeholder="#22c55e"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Usado en notificaciones, badges de éxito y elementos que requieren atención.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card className="dark:bg-slate-900 dark:border-slate-800 sticky top-6">
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
              <CardDescription>
                Así se verá tu branding en la aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mobile App Card Preview */}
              <div
                className="p-6 rounded-2xl text-white shadow-xl relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${config.color_primario} 0%, ${config.color_secundario} 100%)`,
                }}
              >
                {/* Glass effect overlay */}
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />

                <div className="relative z-10 flex flex-col items-center text-center">
                  {config.logo_url ? (
                    <div className="mb-4 bg-white/90 p-3 rounded-full shadow-lg">
                      <img src={config.logo_url} alt="Logo" className="w-12 h-12 object-contain" />
                    </div>
                  ) : (
                    <div className="mb-4 bg-white/20 p-3 rounded-full">
                      <Store className="w-8 h-8 text-white" />
                    </div>
                  )}

                  <h4 className="text-2xl font-bold mb-1 tracking-tight">{config.nombre_comercial || 'Tu Negocio'}</h4>
                  <p className="text-sm opacity-90 mb-6 font-light">
                    ¡Bienvenido a nuestro club de recompensas!
                  </p>

                  <div className="w-full bg-white/20 rounded-xl p-4 mb-4 backdrop-blur-sm border border-white/20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium uppercase tracking-wider opacity-80">Mis Puntos</span>
                      <span className="text-xs opacity-80">Nivel Bronce</span>
                    </div>
                    <div className="text-4xl font-black mb-1">250</div>
                    <div className="w-full bg-black/20 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-white h-full w-[60%]" />
                    </div>
                  </div>

                  <div
                    className="px-6 py-2.5 rounded-full font-bold text-sm shadow-lg cursor-not-allowed opacity-90"
                    style={{ backgroundColor: config.color_acento }}
                  >
                    Canjear Recompensas
                  </div>
                </div>
              </div>

              {/* Button Preview */}
              <div className="border border-dashed p-4 rounded-lg space-y-4">
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Componentes UI</div>
                <div className="flex gap-2">
                  <Button style={{ backgroundColor: config.color_primario }}>Botón Primario</Button>
                  <Button variant="outline" style={{ borderColor: config.color_primario, color: config.color_primario }}>Botón Secundario</Button>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
