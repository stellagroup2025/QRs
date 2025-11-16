'use client'

import { useState } from 'react'
import { useCookieConsent } from './CookieConsentProvider'
import { useBrandingContext } from './BrandingProvider'
import { hexToRgb } from '@/lib/brand-colors'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Switch } from './ui/switch'
import { Label } from './ui/label'
import { Cookie, Settings, X } from 'lucide-react'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

export function CookieBanner() {
  const { showBanner, acceptAll, rejectAll, setConsent } = useCookieConsent()
  const { branding } = useBrandingContext()
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true, // Siempre true, deshabilitado
    analytics: true,
    marketing: false,
    preferences: true,
  })

  if (!showBanner) return null

  const handleSavePreferences = () => {
    setConsent(preferences)
    setShowSettings(false)
  }

  return (
    <>
      {/* Banner principal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t-2 shadow-2xl animate-in slide-in-from-bottom">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Icono y texto */}
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="h-6 w-6 mt-1 flex-shrink-0" style={{ color: hexToRgb(branding.color_primario) }} />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">🍪 Usamos cookies</h3>
                <p className="text-sm text-gray-600">
                  Utilizamos cookies propias y de terceros para mejorar tu experiencia, personalizar contenido y analizar el uso de nuestra web.{' '}
                  <Link href="/politica-cookies" className="underline font-medium" style={{ color: hexToRgb(branding.color_primario) }}>
                    Más información
                  </Link>
                </p>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Configurar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={rejectAll}
              >
                Rechazar
              </Button>
              <Button
                size="sm"
                onClick={acceptAll}
                className="text-white"
                style={{ backgroundColor: hexToRgb(branding.color_primario) }}
              >
                Aceptar todas
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de configuración */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              Configuración de Cookies
            </DialogTitle>
            <DialogDescription>
              Gestiona tus preferencias de cookies. Las cookies necesarias no se pueden desactivar ya que son esenciales para el funcionamiento del sitio.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Cookies Necesarias */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Cookies Necesarias</CardTitle>
                    <CardDescription className="text-sm">
                      Esenciales para el funcionamiento del sitio
                    </CardDescription>
                  </div>
                  <Switch
                    checked={true}
                    disabled
                    className="opacity-50"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Estas cookies son necesarias para que el sitio web funcione y no se pueden desactivar.
                  Se utilizan para autenticación, seguridad y preferencias básicas.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Ejemplos: tokens de sesión, preferencias de idioma, carrito de compra
                </p>
              </CardContent>
            </Card>

            {/* Cookies de Preferencias */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Cookies de Preferencias</CardTitle>
                    <CardDescription className="text-sm">
                      Recordar tus preferencias y configuraciones
                    </CardDescription>
                  </div>
                  <Switch
                    checked={preferences.preferences}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, preferences: checked })
                    }
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Estas cookies permiten que el sitio web recuerde tus preferencias como el idioma,
                  región o diseño personalizado.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Ejemplos: tema de colores, configuración de branding
                </p>
              </CardContent>
            </Card>

            {/* Cookies Analíticas */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Cookies Analíticas</CardTitle>
                    <CardDescription className="text-sm">
                      Nos ayudan a entender cómo usas el sitio
                    </CardDescription>
                  </div>
                  <Switch
                    checked={preferences.analytics}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, analytics: checked })
                    }
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Estas cookies nos permiten analizar el uso del sitio web para poder medir y mejorar
                  el rendimiento. Toda la información recopilada es anónima.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Ejemplos: Google Analytics, estadísticas de uso
                </p>
              </CardContent>
            </Card>

            {/* Cookies de Marketing */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Cookies de Marketing</CardTitle>
                    <CardDescription className="text-sm">
                      Personalizar anuncios y contenido
                    </CardDescription>
                  </div>
                  <Switch
                    checked={preferences.marketing}
                    onCheckedChange={(checked) =>
                      setPreferences({ ...preferences, marketing: checked })
                    }
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Estas cookies pueden ser establecidas por nuestros socios publicitarios para
                  construir un perfil de tus intereses y mostrarte anuncios relevantes.
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Ejemplos: Facebook Pixel, Google Ads
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Botones del dialog */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSavePreferences}
              className="text-white"
              style={{ backgroundColor: hexToRgb(branding.color_primario) }}
            >
              Guardar Preferencias
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
