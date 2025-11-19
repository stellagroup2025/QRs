'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCookieConsent } from '@/components/CookieConsentProvider'
import { useBrandingContext } from '@/components/BrandingProvider'
import { hexToRgb } from '@/lib/brand-colors'
import { Cookie, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PoliticaCookiesPage() {
  const { resetConsent } = useCookieConsent()
  const { branding } = useBrandingContext()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Cookie className="h-8 w-8" style={{ color: hexToRgb(branding.color_primario) }} />
            <h1 className="text-4xl font-bold" style={{ color: hexToRgb(branding.color_primario) }}>
              Política de Cookies
            </h1>
          </div>
          <p className="text-gray-600">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Gestionar cookies */}
        <Card className="mb-6 border-2" style={{ borderColor: hexToRgb(branding.color_primario) }}>
          <CardHeader>
            <CardTitle>Gestiona tus preferencias</CardTitle>
            <CardDescription>
              Puedes cambiar tu consentimiento en cualquier momento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={resetConsent}
              className="text-white"
              style={{ backgroundColor: hexToRgb(branding.color_primario) }}
            >
              Modificar Preferencias de Cookies
            </Button>
          </CardContent>
        </Card>

        {/* Contenido */}
        <div className="space-y-6">
          {/* ¿Qué son las cookies? */}
          <Card>
            <CardHeader>
              <CardTitle>1. ¿Qué son las cookies?</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo (ordenador, tablet o móvil)
                cuando visitas una página web. Las cookies permiten que el sitio web reconozca tu dispositivo y recuerde
                información sobre tu visita, como tu idioma preferido y otras configuraciones.
              </p>
            </CardContent>
          </Card>

          {/* ¿Para qué usamos las cookies? */}
          <Card>
            <CardHeader>
              <CardTitle>2. ¿Para qué usamos las cookies?</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Utilizamos cookies para diferentes finalidades:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Funcionamiento esencial:</strong> Permitir el acceso a áreas seguras y funciones básicas</li>
                <li><strong>Mejora de la experiencia:</strong> Recordar tus preferencias y configuración</li>
                <li><strong>Análisis y rendimiento:</strong> Entender cómo usas nuestra web para mejorarla</li>
                <li><strong>Personalización:</strong> Mostrar contenido relevante según tus intereses</li>
              </ul>
            </CardContent>
          </Card>

          {/* Tipos de cookies que utilizamos */}
          <Card>
            <CardHeader>
              <CardTitle>3. Tipos de cookies que utilizamos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Cookies Necesarias */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    Cookies Necesarias (No se pueden desactivar)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="border p-2 text-left">Nombre</th>
                          <th className="border p-2 text-left">Propósito</th>
                          <th className="border p-2 text-left">Duración</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border p-2 font-mono text-xs">admin_token</td>
                          <td className="border p-2">Token de autenticación del administrador</td>
                          <td className="border p-2">Sesión</td>
                        </tr>
                        <tr>
                          <td className="border p-2 font-mono text-xs">client_token</td>
                          <td className="border p-2">Token de autenticación del cliente</td>
                          <td className="border p-2">Sesión</td>
                        </tr>
                        <tr>
                          <td className="border p-2 font-mono text-xs">tenant_domain</td>
                          <td className="border p-2">Identificador de la tienda actual</td>
                          <td className="border p-2">Sesión</td>
                        </tr>
                        <tr>
                          <td className="border p-2 font-mono text-xs">cookie_consent</td>
                          <td className="border p-2">Almacena tus preferencias de cookies</td>
                          <td className="border p-2">1 año</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Cookies de Preferencias */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    Cookies de Preferencias
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="border p-2 text-left">Nombre</th>
                          <th className="border p-2 text-left">Propósito</th>
                          <th className="border p-2 text-left">Duración</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border p-2 font-mono text-xs">branding_preferences</td>
                          <td className="border p-2">Guarda configuración de colores y branding</td>
                          <td className="border p-2">30 días</td>
                        </tr>
                        <tr>
                          <td className="border p-2 font-mono text-xs">language</td>
                          <td className="border p-2">Idioma preferido del usuario</td>
                          <td className="border p-2">1 año</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Cookies Analíticas */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                    Cookies Analíticas
                  </h3>
                  <p className="text-gray-700 text-sm mb-3">
                    Estas cookies nos ayudan a entender cómo los visitantes interactúan con nuestra web,
                    recopilando información de forma anónima.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="border p-2 text-left">Proveedor</th>
                          <th className="border p-2 text-left">Propósito</th>
                          <th className="border p-2 text-left">Más información</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border p-2">Google Analytics</td>
                          <td className="border p-2">Estadísticas de uso y rendimiento del sitio</td>
                          <td className="border p-2">
                            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                              Política de Google
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Cookies de Marketing */}
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                    Cookies de Marketing
                  </h3>
                  <p className="text-gray-700 text-sm mb-3">
                    Se utilizan para rastrear a los visitantes en las webs y mostrar anuncios relevantes y atractivos.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="border p-2 text-left">Proveedor</th>
                          <th className="border p-2 text-left">Propósito</th>
                          <th className="border p-2 text-left">Más información</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border p-2">Meta Pixel</td>
                          <td className="border p-2">Publicidad personalizada en Facebook e Instagram</td>
                          <td className="border p-2">
                            <a href="https://www.facebook.com/privacy/explanation" target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                              Política de Meta
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cómo gestionar las cookies */}
          <Card>
            <CardHeader>
              <CardTitle>4. Cómo gestionar o eliminar las cookies</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Puedes gestionar tus preferencias de cookies en cualquier momento:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <strong>En este sitio web:</strong> Usa el botón "Modificar Preferencias" al inicio de esta página
                </li>
                <li>
                  <strong>En tu navegador:</strong> La mayoría de navegadores te permiten controlar las cookies a través de sus ajustes
                </li>
              </ul>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Importante:</strong> Si desactivas ciertas cookies, algunas funcionalidades del sitio pueden no funcionar correctamente.
                </p>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-3">Instrucciones por navegador:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>
                    <strong>Chrome:</strong>{' '}
                    <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                      Gestionar cookies en Chrome
                    </a>
                  </li>
                  <li>
                    <strong>Firefox:</strong>{' '}
                    <a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                      Gestionar cookies en Firefox
                    </a>
                  </li>
                  <li>
                    <strong>Safari:</strong>{' '}
                    <a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                      Gestionar cookies en Safari
                    </a>
                  </li>
                  <li>
                    <strong>Edge:</strong>{' '}
                    <a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                      Gestionar cookies en Edge
                    </a>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Actualizaciones */}
          <Card>
            <CardHeader>
              <CardTitle>5. Actualizaciones de esta política</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                Podemos actualizar esta Política de Cookies ocasionalmente para reflejar cambios en las cookies que utilizamos
                o por otras razones operativas, legales o regulatorias. Te recomendamos que revises esta página periódicamente
                para estar informado sobre nuestro uso de cookies.
              </p>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card>
            <CardHeader>
              <CardTitle>6. Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                Si tienes preguntas sobre nuestra Política de Cookies, puedes contactarnos a través de:
              </p>
              <ul className="mt-3 space-y-1 text-gray-700">
                <li>Email: {branding.email_contacto || 'info@tutienda.com'}</li>
                <li>Teléfono: {branding.telefono_contacto || '+34 XXX XXX XXX'}</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
