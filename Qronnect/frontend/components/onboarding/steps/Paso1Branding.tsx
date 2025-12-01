'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Paintbrush, Upload, Store, X, Loader2, ImageIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Paso1BrandingProps {
  datosIniciales?: {
    nombre_comercial?: string
    logo_url?: string
    color_primario?: string
    color_secundario?: string
    color_acento?: string
  }
  onChange: (data: any) => void
}

export function Paso1Branding({ datosIniciales, onChange }: Paso1BrandingProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [nombre, setNombre] = useState(datosIniciales?.nombre_comercial || '')
  const [logoUrl, setLogoUrl] = useState(datosIniciales?.logo_url || '')
  const [colorPrimario, setColorPrimario] = useState(datosIniciales?.color_primario || '#0ea5e9')
  const [colorSecundario, setColorSecundario] = useState(datosIniciales?.color_secundario || '#6366f1')
  const [colorAccento, setColorAccento] = useState(datosIniciales?.color_acento || '#22c55e')
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // Notificar cambios al padre
  useEffect(() => {
    onChange({
      nombre_comercial: nombre,
      logo_url: logoUrl,
      color_primario: colorPrimario,
      color_secundario: colorSecundario,
      color_acento: colorAccento,
    })
  }, [nombre, logoUrl, colorPrimario, colorSecundario, colorAccento])

  const handleFileUpload = async (file: File) => {
    // Validar tipo de archivo
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Tipo de archivo no v\u00e1lido',
        description: 'Solo se permiten archivos PNG, JPG, SVG o WebP',
        variant: 'destructive',
      })
      return
    }

    // Validar tama\u00f1o (m\u00e1x 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Archivo muy grande',
        description: 'El tama\u00f1o m\u00e1ximo es 2MB',
        variant: 'destructive',
      })
      return
    }

    setUploading(true)

    try {
      const domain = window.location.hostname.split('.')[0]
      const token = localStorage.getItem(`admin_token_${domain}`) || localStorage.getItem('admin_token')

      if (!token) {
        throw new Error('No autorizado')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'logo')

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_URL}/api/config/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': domain,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al subir el archivo')
      }

      const data = await response.json()
      setLogoUrl(data.url)

      toast({
        title: 'Logo subido',
        description: 'Tu logo se ha subido correctamente',
      })
    } catch (error: any) {
      console.error('Error uploading file:', error)
      toast({
        title: 'Error al subir',
        description: error.message || 'No se pudo subir el archivo',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const removeLogo = () => {
    setLogoUrl('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Store className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Personaliza tu marca</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Configura cómo se verá tu programa de fidelización para tus clientes
        </p>
      </div>

      {/* Nombre Comercial */}
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre de tu negocio</Label>
        <Input
          id="nombre"
          placeholder="Ej: Cafetería El Aroma"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="text-lg"
        />
        <p className="text-xs text-muted-foreground">
          Este nombre aparecerá en todos tus emails y mensajes
        </p>
      </div>

      {/* Logo Upload */}
      <div className="space-y-2">
        <Label>Logo (opcional)</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
          onChange={handleInputChange}
          className="hidden"
        />

        {logoUrl ? (
          // Logo subido - mostrar preview
          <Card className="border-2 p-4">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-600">Logo subido correctamente</p>
                <p className="text-xs text-muted-foreground">
                  Haz clic en el boton para cambiar
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  Cambiar
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeLogo}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          // Sin logo - mostrar zona de drop
          <Card
            className={`border-2 border-dashed p-8 cursor-pointer transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'hover:border-primary/50 hover:bg-gray-50'
            } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <div className="text-center space-y-2">
              {uploading ? (
                <>
                  <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">Subiendo...</p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Arrastra tu logo aqui o haz clic para subir
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, SVG o WebP (max. 2MB)
                  </p>
                </>
              )}
            </div>
          </Card>
        )}
        <p className="text-xs text-muted-foreground">
          Puedes configurar tu logo mas tarde desde Configuracion - Branding
        </p>
      </div>

      {/* Colores de Marca */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Paintbrush className="h-5 w-5 text-muted-foreground" />
          <Label>Colores de tu marca</Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Color Primario */}
          <div className="space-y-2">
            <Label htmlFor="color-primario" className="text-sm">
              Color Principal
            </Label>
            <div className="flex gap-2">
              <div
                className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm"
                style={{ backgroundColor: colorPrimario }}
              />
              <div className="flex-1 space-y-1">
                <Input
                  id="color-primario"
                  type="color"
                  value={colorPrimario}
                  onChange={(e) => setColorPrimario(e.target.value)}
                  className="h-12 cursor-pointer"
                />
                <Input
                  type="text"
                  value={colorPrimario}
                  onChange={(e) => setColorPrimario(e.target.value)}
                  className="h-8 text-xs font-mono"
                  placeholder="#0ea5e9"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Botones, enlaces</p>
          </div>

          {/* Color Secundario */}
          <div className="space-y-2">
            <Label htmlFor="color-secundario" className="text-sm">
              Color Secundario
            </Label>
            <div className="flex gap-2">
              <div
                className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm"
                style={{ backgroundColor: colorSecundario }}
              />
              <div className="flex-1 space-y-1">
                <Input
                  id="color-secundario"
                  type="color"
                  value={colorSecundario}
                  onChange={(e) => setColorSecundario(e.target.value)}
                  className="h-12 cursor-pointer"
                />
                <Input
                  type="text"
                  value={colorSecundario}
                  onChange={(e) => setColorSecundario(e.target.value)}
                  className="h-8 text-xs font-mono"
                  placeholder="#6366f1"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Encabezados, fondos</p>
          </div>

          {/* Color Acento */}
          <div className="space-y-2">
            <Label htmlFor="color-acento" className="text-sm">
              Color de Acento
            </Label>
            <div className="flex gap-2">
              <div
                className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm"
                style={{ backgroundColor: colorAccento }}
              />
              <div className="flex-1 space-y-1">
                <Input
                  id="color-acento"
                  type="color"
                  value={colorAccento}
                  onChange={(e) => setColorAccento(e.target.value)}
                  className="h-12 cursor-pointer"
                />
                <Input
                  type="text"
                  value={colorAccento}
                  onChange={(e) => setColorAccento(e.target.value)}
                  className="h-8 text-xs font-mono"
                  placeholder="#22c55e"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Alertas, badges</p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <Card className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Vista previa:</p>
          <div
            className="p-6 rounded-lg text-white shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${colorPrimario} 0%, ${colorSecundario} 100%)`,
            }}
          >
            <h4 className="text-2xl font-bold mb-2">{nombre || 'Tu Negocio'}</h4>
            <p className="text-sm opacity-90 mb-4">
              ¡Únete a nuestro programa de fidelización y gana recompensas!
            </p>
            <div
              className="inline-block px-4 py-2 rounded-lg font-medium text-sm"
              style={{ backgroundColor: colorAccento }}
            >
              Obtener Puntos
            </div>
          </div>
        </div>
      </Card>

      {/* Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Consejo:</strong> Usa los colores de tu marca existente para que tus
          clientes reconozcan fácilmente tus comunicaciones.
        </p>
      </div>
    </div>
  )
}
