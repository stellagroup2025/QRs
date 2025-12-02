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
import { ArrowLeft, Loader2, Store, CheckCircle, MapPin, User } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function NuevaTiendaPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    nombre: '',
    dominio: '',
    direccion: '',
    telefono: '',
    email: '',
    logo_url: '',
    plan: 'basico',
    // Datos del administrador/responsable
    admin_nombre: '',
    admin_email: '',
    admin_rol: 'propietario',
  })

  // Estado para saber si el usuario ha editado manualmente el dominio
  const [dominioEditadoManualmente, setDominioEditadoManualmente] = useState(false)
  // Estado para la geolocalización
  const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false)

  // Función para generar dominio a partir del nombre
  const generarDominio = (nombre: string): string => {
    return nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
      .trim()
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Eliminar guiones duplicados
  }

  // Handler para el cambio del nombre
  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoNombre = e.target.value
    const nuevosDatos: typeof formData = { ...formData, nombre: nuevoNombre }

    // Solo auto-rellenar dominio si el usuario no lo ha editado manualmente
    if (!dominioEditadoManualmente) {
      nuevosDatos.dominio = generarDominio(nuevoNombre)
    }

    setFormData(nuevosDatos)
  }

  // Handler para el cambio del dominio (marca como editado manualmente)
  const handleDominioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDominioEditadoManualmente(true)
    setFormData({ ...formData, dominio: e.target.value })
  }

  // Función para obtener dirección desde geolocalización
  const obtenerUbicacion = async () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización')
      return
    }

    setObteniendoUbicacion(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          // Usar API de geocodificación inversa (Nominatim - OpenStreetMap)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { 'Accept-Language': 'es' } }
          )
          const data = await response.json()

          if (data.display_name) {
            setFormData({ ...formData, direccion: data.display_name })
          } else {
            setError('No se pudo obtener la dirección')
          }
        } catch (err) {
          setError('Error al obtener la dirección')
        } finally {
          setObteniendoUbicacion(false)
        }
      },
      (err) => {
        setObteniendoUbicacion(false)
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Permiso de ubicación denegado')
            break
          case err.POSITION_UNAVAILABLE:
            setError('Ubicación no disponible')
            break
          case err.TIMEOUT:
            setError('Tiempo de espera agotado')
            break
          default:
            setError('Error al obtener ubicación')
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

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
        direccion: formData.direccion || undefined,
        telefono: formData.telefono || undefined,
        email: formData.email || undefined,
        logo_url: formData.logo_url || undefined,
        plan: formData.plan,
        // Datos del administrador
        admin_nombre: formData.admin_nombre,
        admin_email: formData.admin_email,
        admin_rol: formData.admin_rol,
      }

      const response = await fetch(`${API_URL}/api/superadmin/tiendas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.status === 401) {
        localStorage.removeItem('superadmin_token')
        localStorage.removeItem('superadmin_refresh_token')
        localStorage.removeItem('superadmin_user')
        router.push('/superadmin/login')
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear tienda')
      }

      // Mostrar información sobre usuario admin y email
      if (data.error_usuario) {
        console.error('Error al crear usuario admin:', data.error_usuario)
        setError(`Tienda creada, pero error al crear usuario admin: ${data.error_usuario}`)
      } else if (data.error_email) {
        console.error('Error al enviar email:', data.error_email)
        setError(`Tienda y usuario creados, pero error al enviar email: ${data.error_email}`)
      } else if (data.credenciales_enviadas) {
        console.log('✅ Tienda, usuario y email enviado correctamente')
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
                    onChange={handleNombreChange}
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
                      onChange={handleDominioChange}
                      placeholder="cafeteria-el-sol"
                      required
                      className="rounded-r-none"
                    />
                    <div className="flex items-center px-3 bg-slate-100 dark:bg-slate-800 border border-l-0 rounded-r-md text-sm text-muted-foreground">
                      .qronnect.com
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Solo letras, números y guiones. Se genera automáticamente del nombre.
                  </p>
                </div>
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
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Administrador de la Tienda
              </CardTitle>
              <CardDescription>
                Persona responsable que tendrá acceso al panel de administración
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin_nombre">
                    Nombre completo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="admin_nombre"
                    value={formData.admin_nombre}
                    onChange={(e) => setFormData({ ...formData, admin_nombre: e.target.value })}
                    placeholder="Ej: Juan García López"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin_rol">
                    Rol <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.admin_rol}
                    onValueChange={(value) => setFormData({ ...formData, admin_rol: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="propietario">Propietario</SelectItem>
                      <SelectItem value="gerente">Gerente</SelectItem>
                      <SelectItem value="administrador">Administrador</SelectItem>
                      <SelectItem value="encargado">Encargado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin_email">
                  Email del administrador <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="admin_email"
                  type="email"
                  value={formData.admin_email}
                  onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                  placeholder="juan@cafeteria.com"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Se enviará un email con las credenciales de acceso a esta dirección
                </p>
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={obtenerUbicacion}
                    disabled={obteniendoUbicacion}
                  >
                    {obteniendoUbicacion ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <MapPin className="mr-2 h-4 w-4" />
                    )}
                    {obteniendoUbicacion ? 'Obteniendo...' : 'Usar mi ubicación'}
                  </Button>
                </div>
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
