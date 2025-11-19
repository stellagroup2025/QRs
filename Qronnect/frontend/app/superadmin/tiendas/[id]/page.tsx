'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { SenderIDForm } from '@/components/superadmin/SenderIDForm'
import { SMSConfigForm } from '@/components/superadmin/SMSConfigForm'
import { IAConfigForm } from '@/components/superadmin/IAConfigForm'
import { UsuariosTiendaManager } from '@/components/superadmin/UsuariosTiendaManager'
import {
  ArrowLeft,
  Store,
  Users,
  ShoppingCart,
  Euro,
  QrCode,
  ExternalLink,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Globe,
  Palette,
  Save,
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Tienda {
  id: string
  nombre: string
  dominio: string
  dominio_personalizado?: string
  plan: string
  activo: boolean
  creado_en: string
  direccion?: string
  telefono?: string
  email?: string
  logo_url?: string
  color_primario?: string
  color_secundario?: string
  color_acento?: string
  nombre_comercial?: string
  configuracion: {
    puntos_por_euro: number
    moneda: string
  }
  total_clientes: number
  total_compras: number
  total_facturado: number
}

export default function TiendaDetallePage() {
  const router = useRouter()
  const params = useParams()
  const tiendaId = params.id as string

  const [tienda, setTienda] = useState<Tienda | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrUrl, setQrUrl] = useState('')
  const [saving, setSaving] = useState(false)

  // Estados para branding
  const [colorPrimario, setColorPrimario] = useState('')
  const [colorSecundario, setColorSecundario] = useState('')
  const [colorAcento, setColorAcento] = useState('')
  const [nombreComercial, setNombreComercial] = useState('')

  // Estados para información de contacto
  const [direccion, setDireccion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [savingInfo, setSavingInfo] = useState(false)

  // Estados para datos básicos editables
  const [logoUrl, setLogoUrl] = useState('')
  const [plan, setPlan] = useState<'basico' | 'profesional' | 'enterprise'>('basico')
  const [dominio, setDominio] = useState('')
  const [dominioPersonalizado, setDominioPersonalizado] = useState('')
  const [activo, setActivo] = useState(true)
  const [savingBasicInfo, setSavingBasicInfo] = useState(false)

  // Estados para configuración de fidelización
  const [puntosEuro, setPuntosEuro] = useState(1)
  const [moneda, setMoneda] = useState('EUR')
  const [savingFidelizacion, setSavingFidelizacion] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('superadmin_token')
    if (!token) {
      router.push('/superadmin/login')
      return
    }

    fetchTienda(token)
  }, [tiendaId, router])

  const fetchTienda = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/superadmin/tiendas/${tiendaId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (!response.ok) throw new Error('Error al cargar tienda')

      const data = await response.json()

      // El backend devuelve: { tienda: {...}, estadisticas: {...}, ... }
      const tiendaData = data.tienda || data
      const stats = data.estadisticas || {}

      // Combinar tienda con estadísticas
      const tiendaCompleta = {
        ...tiendaData,
        total_clientes: stats.total_clientes || 0,
        total_compras: stats.total_compras || 0,
        total_facturado: stats.facturacion_total || 0,
      }

      setTienda(tiendaCompleta)

      // Inicializar estados de branding
      setColorPrimario(tiendaData.color_primario || '#000000')
      setColorSecundario(tiendaData.color_secundario || '#666666')
      setColorAcento(tiendaData.color_acento || '#0066cc')
      setNombreComercial(tiendaData.nombre_comercial || tiendaData.nombre)

      // Inicializar estados de información de contacto
      setDireccion(tiendaData.direccion || '')
      setTelefono(tiendaData.telefono || '')
      setEmail(tiendaData.email || '')

      // Inicializar estados de datos básicos
      setLogoUrl(tiendaData.logo_url || '')
      setPlan(tiendaData.plan || 'basico')
      setDominio(tiendaData.dominio || '')
      setDominioPersonalizado(tiendaData.dominio_personalizado || '')
      setActivo(tiendaData.activo ?? true)

      // Inicializar configuración de fidelización
      setPuntosEuro(tiendaData.configuracion?.puntos_por_euro || 1)
      setMoneda(tiendaData.configuracion?.moneda || 'EUR')

      // Generar URL del QR de registro
      const registroUrl = `http://localhost:3000/registro?tienda=${tiendaData.dominio}`
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(registroUrl)}`)
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cargar la tienda')
      router.push('/superadmin/tiendas')
    } finally {
      setLoading(false)
    }
  }

  const saveBranding = async () => {
    const token = localStorage.getItem('superadmin_token')
    if (!token) return

    setSaving(true)
    try {
      const response = await fetch(`${API_URL}/api/superadmin/tiendas/${tiendaId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          color_primario: colorPrimario,
          color_secundario: colorSecundario,
          color_acento: colorAcento,
          nombre_comercial: nombreComercial,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
        console.error('❌ Error del backend:', errorData)
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Actualizar tienda manteniendo las estadísticas
      setTienda(prev => ({
        ...prev!,
        ...data,
      }))

      alert('✅ Personalización guardada exitosamente')
    } catch (error: any) {
      console.error('Error:', error)
      alert(`❌ Error al guardar la personalización: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const saveContactInfo = async () => {
    const token = localStorage.getItem('superadmin_token')
    if (!token) return

    setSavingInfo(true)
    try {
      const response = await fetch(`${API_URL}/api/superadmin/tiendas/${tiendaId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          direccion: direccion || null,
          telefono: telefono || null,
          email: email || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
        console.error('❌ Error del backend:', errorData)
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Actualizar tienda manteniendo las estadísticas
      setTienda(prev => ({
        ...prev!,
        ...data,
      }))

      alert('✅ Información de contacto guardada exitosamente')
    } catch (error: any) {
      console.error('Error:', error)
      alert(`❌ Error al guardar la información: ${error.message}`)
    } finally {
      setSavingInfo(false)
    }
  }

  const saveBasicInfo = async () => {
    const token = localStorage.getItem('superadmin_token')
    if (!token) return

    // Validar dominio
    if (!dominio || dominio.trim() === '') {
      alert('❌ El dominio es obligatorio')
      return
    }

    setSavingBasicInfo(true)
    try {
      const response = await fetch(`${API_URL}/api/superadmin/tiendas/${tiendaId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          logo_url: logoUrl || null,
          plan: plan,
          dominio: dominio,
          dominio_personalizado: dominioPersonalizado || null,
          activo: activo,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
        console.error('❌ Error del backend:', errorData)
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Actualizar tienda manteniendo las estadísticas
      setTienda(prev => ({
        ...prev!,
        ...data,
      }))

      alert('✅ Datos básicos guardados exitosamente')

      // Si cambió el dominio, actualizar el QR
      const registroUrl = `http://localhost:3000/registro?tienda=${dominio}`
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(registroUrl)}`)
    } catch (error: any) {
      console.error('Error:', error)
      alert(`❌ Error al guardar los datos: ${error.message}`)
    } finally {
      setSavingBasicInfo(false)
    }
  }

  const saveFidelizacion = async () => {
    const token = localStorage.getItem('superadmin_token')
    if (!token) return

    // Validar puntos por euro
    if (puntosEuro < 1) {
      alert('❌ Los puntos por euro deben ser al menos 1')
      return
    }

    setSavingFidelizacion(true)
    try {
      const response = await fetch(`${API_URL}/api/superadmin/tiendas/${tiendaId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          configuracion: {
            puntos_por_euro: puntosEuro,
            moneda: moneda,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
        console.error('❌ Error del backend:', errorData)
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Actualizar tienda manteniendo las estadísticas
      setTienda(prev => ({
        ...prev!,
        ...data,
      }))

      alert('✅ Configuración de fidelización guardada exitosamente')
    } catch (error: any) {
      console.error('Error:', error)
      alert(`❌ Error al guardar la configuración: ${error.message}`)
    } finally {
      setSavingFidelizacion(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (!tienda) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Tienda no encontrada</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/superadmin/tiendas')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{tienda.nombre}</h1>
                <p className="text-sm text-muted-foreground">
                  {tienda.dominio}.qronnect.com
                </p>
              </div>
            </div>
            <Badge variant={tienda.activo ? 'default' : 'destructive'}>
              {tienda.activo ? 'Activa' : 'Inactiva'}
            </Badge>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tienda.total_clientes || 0}</div>
              <p className="text-xs text-muted-foreground">Registrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compras</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tienda.total_compras || 0}</div>
              <p className="text-xs text-muted-foreground">Total realizadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facturación</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                €{(tienda.total_facturado || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList>
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="branding">Personalización</TabsTrigger>
            <TabsTrigger value="qr">QR de Registro</TabsTrigger>
            <TabsTrigger value="config">Configuración SMS</TabsTrigger>
            <TabsTrigger value="ia">Configuración IA</TabsTrigger>
          </TabsList>

          {/* Información General */}
          <TabsContent value="info" className="space-y-6">
            {/* Datos Básicos - EDITABLE */}
            <Card>
              <CardHeader>
                <CardTitle>Datos Básicos</CardTitle>
                <CardDescription>Logo, plan y dominios de la tienda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo URL */}
                <div className="space-y-2">
                  <Label htmlFor="logo_url">URL del Logo</Label>
                  <Input
                    id="logo_url"
                    placeholder="https://ejemplo.com/logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    URL de la imagen del logo de la tienda
                  </p>
                  {logoUrl && (
                    <div className="mt-2">
                      <p className="text-xs font-medium mb-1">Vista previa:</p>
                      <img
                        src={logoUrl}
                        alt="Logo preview"
                        className="h-16 w-auto object-contain border rounded p-2"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Plan y Estado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan">Plan</Label>
                    <Select value={plan} onValueChange={(value: any) => setPlan(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un plan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basico">Básico</SelectItem>
                        <SelectItem value="profesional">Profesional</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Nivel del plan de suscripción
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="activo">Estado de la Tienda</Label>
                    <div className="flex items-center space-x-4 pt-2">
                      <Switch
                        id="activo"
                        checked={activo}
                        onCheckedChange={setActivo}
                      />
                      <div className="flex items-center space-x-2">
                        <Badge variant={activo ? 'default' : 'destructive'}>
                          {activo ? 'Activa' : 'Inactiva'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {activo ? 'La tienda está operativa' : 'La tienda está desactivada'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Las tiendas inactivas no pueden registrar clientes ni compras
                    </p>
                  </div>
                </div>

                {/* Dominios */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dominio" className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      Dominio Principal
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="dominio"
                        placeholder="mitienda"
                        value={dominio}
                        onChange={(e) => setDominio(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground">.qronnect.com</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Subdominio de la tienda (solo letras, números y guiones)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dominio_personalizado">Dominio Personalizado</Label>
                    <Input
                      id="dominio_personalizado"
                      placeholder="www.mitienda.com"
                      value={dominioPersonalizado}
                      onChange={(e) => setDominioPersonalizado(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Dominio personalizado (opcional)
                    </p>
                  </div>
                </div>

                {/* Fecha de creación (Solo lectura) */}
                <div className="space-y-2 pt-4 border-t">
                  <label className="text-sm font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Fecha de creación
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(tienda.creado_en).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                {/* Botón Guardar */}
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={saveBasicInfo}
                    disabled={savingBasicInfo}
                    size="lg"
                  >
                    {savingBasicInfo ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Datos Básicos
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Información de Contacto - EDITABLE */}
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
                <CardDescription>Datos de contacto de la tienda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dirección */}
                <div className="space-y-2">
                  <Label htmlFor="direccion" className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Dirección
                  </Label>
                  <Input
                    id="direccion"
                    placeholder="Calle Principal 123, Madrid"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                  />
                </div>

                {/* Teléfono y Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefono" className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Teléfono
                    </Label>
                    <Input
                      id="telefono"
                      placeholder="+34 912 345 678"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contacto@tienda.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Botón Guardar */}
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={saveContactInfo}
                    disabled={savingInfo}
                    size="lg"
                  >
                    {savingInfo ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Información
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Configuración de Fidelización - EDITABLE */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Programa de Fidelización</CardTitle>
                <CardDescription>Parámetros del sistema de puntos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Puntos por Euro */}
                  <div className="space-y-2">
                    <Label htmlFor="puntos_euro">Puntos por Euro</Label>
                    <Input
                      id="puntos_euro"
                      type="number"
                      min="1"
                      value={puntosEuro}
                      onChange={(e) => setPuntosEuro(parseInt(e.target.value) || 1)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Por cada euro gastado, el cliente recibe {puntosEuro} punto(s)
                    </p>
                  </div>

                  {/* Moneda */}
                  <div className="space-y-2">
                    <Label htmlFor="moneda">Moneda</Label>
                    <Select value={moneda} onValueChange={setMoneda}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona moneda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Moneda utilizada en la tienda
                    </p>
                  </div>
                </div>

                {/* Ejemplo de cálculo */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 text-sm">Ejemplo de cálculo</h4>
                  <p className="text-sm text-muted-foreground">
                    Si un cliente gasta <strong>50{moneda === 'EUR' ? '€' : moneda === 'USD' ? '$' : '£'}</strong>,
                    recibirá <strong>{50 * puntosEuro} puntos</strong>
                  </p>
                </div>

                {/* Botón Guardar */}
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={saveFidelizacion}
                    disabled={savingFidelizacion}
                    size="lg"
                  >
                    {savingFidelizacion ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Configuración
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Usuarios de la Tienda */}
          <TabsContent value="usuarios" className="space-y-6">
            <UsuariosTiendaManager tiendaId={tiendaId} />
          </TabsContent>

          {/* Personalización de Marca */}
          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Personalización de Marca
                </CardTitle>
                <CardDescription>
                  Configura la identidad visual de tu tienda (colores y nombre comercial)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nombre Comercial */}
                <div className="space-y-2">
                  <Label htmlFor="nombre_comercial">Nombre Comercial</Label>
                  <Input
                    id="nombre_comercial"
                    placeholder="Ej: Mi Tienda Premium"
                    value={nombreComercial}
                    onChange={(e) => setNombreComercial(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Este es el nombre que verán tus clientes en la app
                  </p>
                </div>

                {/* Colores */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Colores de Marca</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Color Primario */}
                    <div className="space-y-2">
                      <Label htmlFor="color_primario">Color Primario</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="color_primario"
                          type="color"
                          value={colorPrimario}
                          onChange={(e) => setColorPrimario(e.target.value)}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={colorPrimario}
                          onChange={(e) => setColorPrimario(e.target.value)}
                          placeholder="#000000"
                          className="flex-1"
                          pattern="^#[0-9A-Fa-f]{6}$"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Color principal de la marca
                      </p>
                    </div>

                    {/* Color Secundario */}
                    <div className="space-y-2">
                      <Label htmlFor="color_secundario">Color Secundario</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="color_secundario"
                          type="color"
                          value={colorSecundario}
                          onChange={(e) => setColorSecundario(e.target.value)}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={colorSecundario}
                          onChange={(e) => setColorSecundario(e.target.value)}
                          placeholder="#666666"
                          className="flex-1"
                          pattern="^#[0-9A-Fa-f]{6}$"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Color secundario
                      </p>
                    </div>

                    {/* Color de Acento */}
                    <div className="space-y-2">
                      <Label htmlFor="color_acento">Color de Acento</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="color_acento"
                          type="color"
                          value={colorAcento}
                          onChange={(e) => setColorAcento(e.target.value)}
                          className="w-20 h-10 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={colorAcento}
                          onChange={(e) => setColorAcento(e.target.value)}
                          placeholder="#0066cc"
                          className="flex-1"
                          pattern="^#[0-9A-Fa-f]{6}$"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Color para acentos y botones
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Vista Previa</h3>
                  <div className="border rounded-lg p-6 space-y-4" style={{ backgroundColor: '#f8f9fa' }}>
                    {/* Header Preview */}
                    <div
                      className="p-4 rounded-lg text-white"
                      style={{ backgroundColor: colorPrimario }}
                    >
                      <h2 className="text-xl font-bold">{nombreComercial || 'Nombre de la Tienda'}</h2>
                      <p className="text-sm opacity-90">Tu programa de fidelización</p>
                    </div>

                    {/* Button Preview */}
                    <div className="flex space-x-2">
                      <button
                        className="px-4 py-2 rounded-lg text-white font-medium"
                        style={{ backgroundColor: colorAcento }}
                      >
                        Botón Principal
                      </button>
                      <button
                        className="px-4 py-2 rounded-lg text-white font-medium"
                        style={{ backgroundColor: colorSecundario }}
                      >
                        Botón Secundario
                      </button>
                    </div>

                    {/* Card Preview */}
                    <div className="bg-white rounded-lg p-4 border-l-4" style={{ borderColor: colorAcento }}>
                      <h3 className="font-semibold" style={{ color: colorPrimario }}>
                        Tarjeta de Ejemplo
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Así se verán los colores en tu aplicación de clientes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botón Guardar */}
                <div className="flex justify-end">
                  <Button
                    onClick={saveBranding}
                    disabled={saving}
                    size="lg"
                  >
                    {saving ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Personalización
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* QR de Registro */}
          <TabsContent value="qr" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>QR de Registro de Clientes</CardTitle>
                <CardDescription>
                  Los clientes escanean este QR para registrarse en el programa de fidelización
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  {/* QR Code */}
                  <div className="p-6 bg-white rounded-lg border-2 border-dashed">
                    <img
                      src={qrUrl}
                      alt="QR de registro"
                      className="w-64 h-64"
                    />
                  </div>

                  {/* URL de registro */}
                  <div className="w-full space-y-2">
                    <label className="text-sm font-medium">URL de registro</label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 text-sm bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded">
                        http://localhost:3000/registro?tienda={tienda.dominio}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`http://localhost:3000/registro?tienda=${tienda.dominio}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = qrUrl
                        link.download = `qr-${tienda.dominio}.png`
                        link.click()
                      }}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Descargar QR
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.print()}
                    >
                      Imprimir
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center">
                    <QrCode className="h-4 w-4 mr-2" />
                    Cómo usar este QR
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Imprime el QR y colócalo en tu establecimiento</li>
                    <li>• Los clientes lo escanean con su móvil</li>
                    <li>• Se abre el formulario de registro automáticamente</li>
                    <li>• Una vez registrados, acumulan puntos con cada compra</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuración SMS */}
          <TabsContent value="config" className="space-y-6">
            {/* SMS Configuration */}
            <SMSConfigForm
              tiendaId={tiendaId}
              tiendaNombre={tienda.nombre}
              onSuccess={() => {
                const token = localStorage.getItem('superadmin_token')
                if (token) fetchTienda(token)
              }}
            />

            {/* Sender ID Configuration */}
            <SenderIDForm
              tiendaId={tiendaId}
              tiendaNombre={tienda.nombre}
              onSuccess={() => {
                const token = localStorage.getItem('superadmin_token')
                if (token) fetchTienda(token)
              }}
            />
          </TabsContent>

          {/* Configuración IA */}
          <TabsContent value="ia" className="space-y-6">
            <IAConfigForm tiendaId={tiendaId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
