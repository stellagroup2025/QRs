'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

import { Coins, TrendingUp, Save, Loader2 } from 'lucide-react'

interface PuntosConfig {
  puntos_por_euro: number
  puntos_bienvenida: number
}

export default function ConfiguracionPuntosPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<PuntosConfig>({
    puntos_por_euro: 10,
    puntos_bienvenida: 100,
  })

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const token = localStorage.getItem('admin_token')
      const domain = window.location.hostname.split('.')[0]

      const response = await fetch(`${API_URL}/api/tiendas/config/puntos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': domain === 'localhost' ? 'visionplus' : domain,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setConfig({
          puntos_por_euro: data.puntos_por_euro || 10,
          puntos_bienvenida: data.puntos_bienvenida || 100,
        })
      }
    } catch (error) {
      console.error('Error cargando configuración de puntos:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cargar la configuración de puntos',
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

      const response = await fetch(`${API_URL}/api/tiendas/config/puntos`, {
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
          description: 'Configuración de puntos actualizada correctamente',
        })
      } else {
        throw new Error('Error al guardar')
      }
    } catch (error) {
      console.error('Error guardando configuración:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo guardar la configuración',
      })
    } finally {
      setSaving(false)
    }
  }

  // Cálculos de ejemplo
  const compra20Euros = config.puntos_por_euro * 20
  const compra50Euros = config.puntos_por_euro * 50
  const compra100Euros = config.puntos_por_euro * 100

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
            <h1 className="text-2xl font-bold tracking-tight">Sistema de Puntos</h1>
            <p className="text-muted-foreground text-sm">
              Configura cómo los clientes ganan puntos en tu programa de fidelización
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  Configuración de Puntos
                </CardTitle>
                <CardDescription>
                  Define cuántos puntos ganan tus clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Puntos por Euro */}
                <div className="space-y-2">
                  <Label htmlFor="puntos-euro">Puntos por cada € gastado</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="puntos-euro"
                      type="number"
                      min="1"
                      max="100"
                      value={config.puntos_por_euro}
                      onChange={(e) => setConfig({ ...config, puntos_por_euro: Number(e.target.value) })}
                      className="text-lg font-semibold"
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">puntos / €</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recomendado: 5-20 puntos por euro
                  </p>
                </div>

                {/* Puntos de Bienvenida */}
                <div className="space-y-2">
                  <Label htmlFor="puntos-bienvenida">Puntos de bienvenida (regalo inicial)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="puntos-bienvenida"
                      type="number"
                      min="0"
                      step="50"
                      value={config.puntos_bienvenida}
                      onChange={(e) => setConfig({ ...config, puntos_bienvenida: Number(e.target.value) })}
                      className="text-lg font-semibold"
                    />
                    <span className="text-sm text-muted-foreground">puntos</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Puntos que reciben los clientes al registrarse
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>💡 Consejo:</strong> Un buen sistema de puntos motiva a los clientes a
                volver. Lo ideal es que con 5-10 visitas puedan obtener una recompensa significativa.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-900">
                <strong>⚠️ Importante:</strong> Los cambios en el sistema de puntos solo afectarán
                a nuevas compras. Los puntos ya otorgados no se modificarán.
              </p>
            </div>
          </div>

          {/* Ejemplos y Preview */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <TrendingUp className="h-5 w-5" />
                  Ejemplos con tu configuración
                </CardTitle>
                <CardDescription className="text-green-700">
                  Así ganarán puntos tus clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-700">Cliente nuevo se registra:</span>
                  <span className="font-bold text-green-600">+{config.puntos_bienvenida} pts</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-700">Compra de 20€:</span>
                  <span className="font-bold text-green-600">+{compra20Euros} pts</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-700">Compra de 50€:</span>
                  <span className="font-bold text-green-600">+{compra50Euros} pts</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-gray-700">Compra de 100€:</span>
                  <span className="font-bold text-green-600">+{compra100Euros} pts</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Simulador de Cliente</CardTitle>
                <CardDescription>
                  Ejemplo de acumulación de puntos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Registro inicial</p>
                      <p className="text-xs text-muted-foreground">Día 1</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">+{config.puntos_bienvenida}</p>
                      <p className="text-xs text-muted-foreground">Total: {config.puntos_bienvenida}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Primera compra (25€)</p>
                      <p className="text-xs text-muted-foreground">Día 3</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">+{config.puntos_por_euro * 25}</p>
                      <p className="text-xs text-muted-foreground">Total: {config.puntos_bienvenida + (config.puntos_por_euro * 25)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Segunda compra (40€)</p>
                      <p className="text-xs text-muted-foreground">Día 10</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">+{config.puntos_por_euro * 40}</p>
                      <p className="text-xs text-muted-foreground">Total: {config.puntos_bienvenida + (config.puntos_por_euro * 65)}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg">
                    <p className="text-xs font-medium opacity-90">Balance total acumulado:</p>
                    <p className="text-2xl font-bold">{config.puntos_bienvenida + (config.puntos_por_euro * 65)} puntos</p>
                    <p className="text-xs opacity-75 mt-1">En 3 interacciones</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
