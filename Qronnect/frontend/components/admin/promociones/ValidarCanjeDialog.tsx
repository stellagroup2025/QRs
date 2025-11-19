'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { useBrandingContext } from '@/components/BrandingProvider'
import { hexToRgb } from '@/lib/brand-colors'

interface ValidarCanjeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  adminToken: string
  tenantDomain: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function ValidarCanjeDialog({
  open,
  onOpenChange,
  adminToken,
  tenantDomain,
}: ValidarCanjeDialogProps) {
  const { branding } = useBrandingContext()
  const [codigo, setCodigo] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)
  const [error, setError] = useState('')

  const handleValidar = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResultado(null)

    try {
      const response = await fetch(`${API_URL}/api/admin/canjes/validar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
          'X-Tenant-Domain': tenantDomain,
        },
        body: JSON.stringify({
          codigo_canje: codigo.toUpperCase().trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al validar canje')
      }

      setResultado(data)
      setCodigo('')
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message || 'Error al validar canje')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setCodigo('')
    setResultado(null)
    setError('')
    onOpenChange(false)
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'descuento_fijo': return 'Descuento Fijo'
      case 'descuento_porcentaje': return 'Descuento'
      case 'producto_gratis': return 'Producto Gratis'
      default: return tipo
    }
  }

  const getValorLabel = (tipo: string, valor: number) => {
    switch (tipo) {
      case 'descuento_fijo': return `€${valor.toFixed(2)}`
      case 'descuento_porcentaje': return `${valor}%`
      case 'producto_gratis': return 'Gratis'
      default: return valor.toString()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Validar Cupón</DialogTitle>
          <DialogDescription>
            Introduce el código del cupón para validarlo y marcarlo como usado
          </DialogDescription>
        </DialogHeader>

        {!resultado && !error && (
          <form onSubmit={handleValidar} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código del Cupón</Label>
              <Input
                id="codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX-XXXX"
                maxLength={14}
                className="text-center text-lg font-mono"
                autoFocus
                required
              />
              <p className="text-xs text-muted-foreground text-center">
                Formato: XXXX-XXXX-XXXX
              </p>
            </div>

            <Button
              type="submit"
              className="w-full text-white"
              style={{ backgroundColor: hexToRgb(branding.color_primario) }}
              disabled={loading || codigo.length < 12}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                'Validar Cupón'
              )}
            </Button>
          </form>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Error al Validar</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => {
                  setError('')
                  setCodigo('')
                }}
              >
                Intentar de Nuevo
              </Button>
            </CardContent>
          </Card>
        )}

        {resultado && (
          <div className="space-y-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-bold text-green-900 text-lg">¡Cupón Validado!</h3>
                    <p className="text-sm text-green-700">{resultado.mensaje}</p>
                  </div>
                </div>

                {/* Info del cliente */}
                <div className="space-y-2 border-t border-green-200 pt-4">
                  <div>
                    <p className="text-xs text-green-700 font-medium">Cliente</p>
                    <p className="font-semibold text-green-900">{resultado.cliente.nombre}</p>
                    <p className="text-sm text-green-700">{resultado.cliente.email}</p>
                  </div>

                  {/* Info de la promoción */}
                  <div>
                    <p className="text-xs text-green-700 font-medium">Promoción</p>
                    <p className="font-semibold text-green-900">{resultado.promocion.titulo}</p>
                    <p className="text-sm text-green-700">{resultado.promocion.descripcion}</p>
                  </div>

                  {/* Beneficio */}
                  <div className="flex items-center justify-between bg-white rounded p-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Beneficio</p>
                      <p className="font-medium">{getTipoLabel(resultado.promocion.tipo)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: hexToRgb(branding.color_primario) }}>
                        {getValorLabel(resultado.promocion.tipo, resultado.promocion.valor)}
                      </p>
                    </div>
                  </div>

                  {/* Puntos */}
                  <div className="text-sm text-green-700">
                    <p>Puntos usados: <span className="font-semibold">{resultado.puntos_usados}</span></p>
                    <p>Fecha de canje: {new Date(resultado.fecha_canje).toLocaleString('es-ES')}</p>
                    <p>Validado: {new Date(resultado.fecha_uso).toLocaleString('es-ES')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button
                onClick={handleClose}
                className="w-full text-white"
                style={{ backgroundColor: hexToRgb(branding.color_primario) }}
              >
                Cerrar
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
