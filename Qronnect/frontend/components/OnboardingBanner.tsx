'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AlertTriangle, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface OnboardingProgress {
  completado: boolean
  porcentaje_completado: number
  pasos_pendientes: string[]
}

export function OnboardingBanner() {
  const pathname = usePathname()
  const [progress, setProgress] = useState<OnboardingProgress | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(true)

  // No mostrar en la página de onboarding
  const isOnboardingPage = pathname === '/admin/onboarding'

  useEffect(() => {
    // Verificar si el banner fue cerrado en esta sesión
    const wasDismissed = sessionStorage.getItem('onboarding_banner_dismissed')
    if (wasDismissed === 'true') {
      setDismissed(true)
      setLoading(false)
      return
    }

    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('admin_token')
        const tenantDomain = localStorage.getItem('tenant_domain')

        if (!token || !tenantDomain) {
          setLoading(false)
          return
        }

        const response = await fetch(`${API_URL}/api/onboarding/progreso`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Tenant-Domain': tenantDomain,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setProgress(data)
        }
      } catch (error) {
        console.error('Error al obtener progreso del onboarding:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('onboarding_banner_dismissed', 'true')
  }

  // No mostrar si: está cargando, está completo, fue cerrado, o estamos en la página de onboarding
  if (loading || progress?.completado || dismissed || isOnboardingPage) {
    return null
  }

  // Si no hay progreso, asumimos que no ha empezado
  if (!progress) {
    return null
  }

  const pasosRestantes = progress.pasos_pendientes?.length || 0

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 p-2 bg-amber-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800">
                Configuraci&oacute;n inicial incompleta
              </p>
              <p className="text-xs text-amber-600 truncate">
                {pasosRestantes > 0
                  ? `Te faltan ${pasosRestantes} paso${pasosRestantes > 1 ? 's' : ''} para completar la configuraci\u00f3n`
                  : `Progreso: ${progress.porcentaje_completado}%`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/admin/onboarding">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                <Sparkles className="h-4 w-4 mr-2" />
                Completar
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-amber-600 hover:text-amber-800 hover:bg-amber-100"
              onClick={handleDismiss}
              aria-label="Cerrar aviso"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
