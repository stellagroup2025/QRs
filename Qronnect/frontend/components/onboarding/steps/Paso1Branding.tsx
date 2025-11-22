'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Paintbrush, Upload, Store } from 'lucide-react'

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
  const [nombre, setNombre] = useState(datosIniciales?.nombre_comercial || '')
  const [colorPrimario, setColorPrimario] = useState(datosIniciales?.color_primario || '#0ea5e9')
  const [colorSecundario, setColorSecundario] = useState(datosIniciales?.color_secundario || '#6366f1')
  const [colorAccento, setColorAccento] = useState(datosIniciales?.color_acento || '#22c55e')

  // Notificar cambios al padre
  useEffect(() => {
    onChange({
      nombre_comercial: nombre,
      color_primario: colorPrimario,
      color_secundario: colorSecundario,
      color_acento: colorAccento,
    })
  }, [nombre, colorPrimario, colorSecundario, colorAccento])

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

      {/* Logo Upload (placeholder) */}
      <div className="space-y-2">
        <Label>Logo (opcional)</Label>
        <Card className="border-2 border-dashed p-8">
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
          💡 Puedes configurar tu logo más tarde desde Configuración → Branding
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
