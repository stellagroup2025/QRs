'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Loader2, Store, CheckCircle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function NuevaTiendaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    nombre: '',
    dominio: '',
    dominio_personalizado: '',
    direccion: '',
    telefono: '',
    email: '',
    logo_url: '',
    plan: 'basico',
    puntos_por_euro: '1',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const token = localStorage.getItem('superadmin_token')
    if (!token) {
      router.push('/superadmin/login')
      return
    }

    try {
      const payload = {
        nombre: formData.nombre,
        dominio: formData.dominio.toLowerCase().replace(/\s+/g, '-'),
        dominio_personalizado: formData.dominio_personalizado || undefined,
        direccion: formData.direccion || undefined,
        telefono: formData.telefono || undefined,
        email: formData.email || undefined,
        logo_url: formData.logo_url || undefined,
        plan: formData.plan,
        configuracion: {
          puntos_por_euro: parseFloat(formData.puntos_por_euro) || 1,
          moneda: 'EUR',
        },
      }

      const response = await fetch(`${API_URL}/api/superadmin/tiendas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear tienda')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/superadmin/tiendas')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Error al crear tienda')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/superadmin/tiendas')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Crear Nueva Tienda</h1>
              <p className="text-sm text-muted-foreground">
                Añadir un nuevo comercio al sistema
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              ¡Tienda creada correctamente! Redirigiendo...
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>
                Datos principales del comercio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">
                    Nombre de la tienda <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Cafetería El Sol"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dominio">
                    Dominio <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex">
                    <Input
                      id="dominio"
                      value={formData.dominio}
                      onChange={(e) => setFormData({ ...formData, dominio: e.target.value })}
                      placeholder="cafeteria-el-sol"
                      required
                      className="rounded-r-none"
                    />
                    <div className="flex items-center px-3 bg-slate-100 dark:bg-slate-800 border border-l-0 rounded-r-md text-sm text-muted-foreground">
                      .qronnect.com
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Solo letras, números y guiones
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dominio_personalizado">
                  Dominio Personalizado (opcional)
                </Label>
                <Input
                  id="dominio_personalizado"
                  value={formData.dominio_personalizado}
                  onChange={(e) => setFormData({ ...formData, dominio_personalizado: e.target.value })}
                  placeholder="www.cafeteriaelsol.com"
                />
                <p className="text-xs text-muted-foreground">
                  Dominio propio del cliente (requiere configuración DNS)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan">
                  Plan <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.plan} onValueChange={(value) => setFormData({ ...formData, plan: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basico">Básico</SelectItem>
                    <SelectItem value="profesional">Profesional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
              <CardDescription>
                Datos opcionales del comercio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Textarea
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Calle Mayor 123, Madrid"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="+34 912 345 678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="info@cafeteria.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo_url">URL del Logo</Label>
                <Input
                  id="logo_url"
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://ejemplo.com/logo.png"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
              <CardDescription>
                Parámetros del programa de fidelización
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="puntos_por_euro">
                  Puntos por Euro
                </Label>
                <Input
                  id="puntos_por_euro"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.puntos_por_euro}
                  onChange={(e) => setFormData({ ...formData, puntos_por_euro: e.target.value })}
                  placeholder="1"
                />
                <p className="text-xs text-muted-foreground">
                  Cuántos puntos se otorgan por cada euro gastado
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/superadmin/tiendas')}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Store className="mr-2 h-4 w-4" />
                  Crear Tienda
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
