'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2, Sparkles, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Paso1Branding } from './steps/Paso1Branding'
import { Paso2Puntos } from './steps/Paso2Puntos'
import { Paso3Regalo } from './steps/Paso3Regalo'
import { Paso4Referidos } from './steps/Paso4Referidos'
import { Paso5QR } from './steps/Paso5QR'

// Tipos
interface ProgresoOnboarding {
  id: string
  id_tienda: string
  completado: boolean
  paso_actual: number
  porcentaje_completado: number
  paso_1_branding: boolean
  paso_2_puntos: boolean
  paso_3_regalo: boolean
  paso_4_referidos: boolean
  paso_5_qr: boolean
  wizard_data: Record<string, any>
  fecha_inicio: string
  fecha_completado: string | null
  tiempo_total_segundos: number | null
  pasos_omitidos: string[]
  // Datos de la tienda
  nombre_tienda?: string
}

interface PasoWizard {
  numero: number
  titulo: string
  descripcion: string
  icono: React.ReactNode
  completado: boolean
}

interface OnboardingWizardProps {
  onCompleted?: () => void
}

export function OnboardingWizard({ onCompleted }: OnboardingWizardProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [progreso, setProgreso] = useState<ProgresoOnboarding | null>(null)
  const [pasoActual, setPasoActual] = useState(1)
  const [guardando, setGuardando] = useState(false)
  const [mostrarCelebracion, setMostrarCelebracion] = useState(false)

  // Datos de cada paso
  const [datosPaso, setDatosPaso] = useState<Record<string, any>>({})

  const handlePasoChange = (data: any) => {
    setDatosPaso((prev) => ({ ...prev, ...data }))
  }

  // Configuración de pasos (5 pasos en total)
  const pasos: PasoWizard[] = [
    {
      numero: 1,
      titulo: 'Branding',
      descripcion: 'Logo, colores y nombre',
      icono: <Sparkles className="h-6 w-6" />,
      completado: progreso?.paso_1_branding || false,
    },
    {
      numero: 2,
      titulo: 'Puntos',
      descripcion: 'Sistema de fidelización',
      icono: <Sparkles className="h-6 w-6" />,
      completado: progreso?.paso_2_puntos || false,
    },
    {
      numero: 3,
      titulo: 'Regalo',
      descripcion: 'Regalo de bienvenida',
      icono: <Sparkles className="h-6 w-6" />,
      completado: progreso?.paso_3_regalo || false,
    },
    {
      numero: 4,
      titulo: 'Referidos',
      descripcion: 'Programa de referidos',
      icono: <Sparkles className="h-6 w-6" />,
      completado: progreso?.paso_4_referidos || false,
    },
    {
      numero: 5,
      titulo: 'QR',
      descripcion: 'Descarga tu código',
      icono: <Sparkles className="h-6 w-6" />,
      completado: progreso?.paso_5_qr || false,
    },
  ]

  // Cargar progreso al montar
  useEffect(() => {
    cargarProgreso()
  }, [])

  const cargarProgreso = async () => {
    setLoading(true)
    try {
      const domain = window.location.hostname.split('.')[0]
      const token = localStorage.getItem(`admin_token_${domain}`) || localStorage.getItem('admin_token')

      if (!token) {
        toast({
          title: 'Error de autenticación',
          description: 'Por favor, inicia sesión nuevamente',
          variant: 'destructive',
        })
        return
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_URL}/api/onboarding/progreso`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': domain,
        },
      })

      if (!response.ok) {
        throw new Error('Error al cargar el progreso')
      }

      const data = await response.json()
      setProgreso(data)
      setPasoActual(data.completado ? 5 : data.paso_actual)

      // Mostrar celebración si está completado
      if (data.completado && !mostrarCelebracion) {
        setMostrarCelebracion(true)
      }
    } catch (error) {
      console.error('Error cargando progreso:', error)
      toast({
        title: 'Error',
        description: 'No pudimos cargar tu progreso. Por favor, recarga la página.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const guardarPaso = async (paso: number, data: Record<string, any> = {}) => {
    setGuardando(true)
    try {
      const domain = window.location.hostname.split('.')[0]
      const token = localStorage.getItem(`admin_token_${domain}`) || localStorage.getItem('admin_token')

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_URL}/api/onboarding/progreso`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': domain,
        },
        body: JSON.stringify({ paso, data }),
      })

      if (!response.ok) {
        throw new Error('Error al guardar el paso')
      }

      const resultado = await response.json()

      // Actualizar progreso localmente (sin recargar para evitar loop)
      if (progreso) {
        const camposPaso = ['paso_1_branding', 'paso_2_puntos', 'paso_3_regalo', 'paso_4_referidos', 'paso_5_qr']
        const progresoActualizado: ProgresoOnboarding = {
          ...progreso,
          paso_actual: resultado.paso_actual,
          porcentaje_completado: resultado.porcentaje_completado,
          completado: resultado.completado,
          [camposPaso[paso - 1]]: true,
        }
        setProgreso(progresoActualizado)
      }

      // Si completó todos los pasos
      if (resultado.completado) {
        setMostrarCelebracion(true)
        toast({
          title: '🎉 ¡Felicitaciones!',
          description: 'Has completado la configuración inicial de tu tienda',
        })
        setTimeout(() => {
          onCompleted?.()
        }, 3000)
      } else {
        // Avanzar al siguiente paso
        setPasoActual(resultado.paso_actual)
        toast({
          title: '✅ Paso guardado',
          description: `Paso ${paso} completado correctamente`,
        })
      }
    } catch (error) {
      console.error('Error guardando paso:', error)
      toast({
        title: 'Error',
        description: 'No pudimos guardar tu progreso. Por favor, intenta nuevamente.',
        variant: 'destructive',
      })
    } finally {
      setGuardando(false)
    }
  }

  const omitirPaso = async (paso: number) => {
    try {
      const domain = window.location.hostname.split('.')[0]
      const token = localStorage.getItem(`admin_token_${domain}`) || localStorage.getItem('admin_token')

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      await fetch(`${API_URL}/api/onboarding/progreso/omitir`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Tenant-Domain': domain,
        },
        body: JSON.stringify({ paso }),
      })

      // Avanzar al siguiente paso sin marcar como completado
      setPasoActual(Math.min(paso + 1, 5))

      // Actualizar progreso localmente
      if (progreso) {
        setProgreso({
          ...progreso,
          paso_actual: Math.min(paso + 1, 5),
          pasos_omitidos: [...(progreso.pasos_omitidos || []), `paso_${paso}`],
        })
      }

      toast({
        title: 'Paso omitido',
        description: 'Puedes completarlo más tarde desde el panel de configuración',
      })
    } catch (error) {
      console.error('Error omitiendo paso:', error)
    }
  }

  const irAPaso = (paso: number) => {
    // Solo permitir ir a pasos anteriores o al paso actual
    if (paso <= pasoActual) {
      setPasoActual(paso)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando tu progreso...</p>
        </div>
      </div>
    )
  }

  if (mostrarCelebracion) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-50"
      >
        <Card className="max-w-2xl w-full shadow-xl">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto mb-4" />
            </motion.div>
            <CardTitle className="text-3xl">¡Felicitaciones! 🎉</CardTitle>
            <CardDescription className="text-lg mt-2">
              Has completado la configuración inicial de tu tienda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-2">¿Qué sigue ahora?</h3>
              <ul className="space-y-2 text-sm text-green-800">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Tu tienda ya está lista para recibir clientes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Puedes empezar a promocionar tu QR en redes sociales</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Explora el panel de admin para crear más campañas</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => window.location.href = '/admin/dashboard'}
                className="flex-1"
              >
                Ir al Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/admin/campanas'}
                className="flex-1"
              >
                Crear Campaña
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative text-center space-y-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.location.href = '/admin/dashboard'}
            className="absolute left-0 top-0 hover:bg-gray-200"
            title="Salir del onboarding"
          >
            <X className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Configuración Inicial</h1>
          <p className="text-muted-foreground">
            Completa estos 5 pasos para empezar a usar tu programa de fidelización (3-4 min)
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progreso general</span>
            <span className="text-muted-foreground">{progreso?.porcentaje_completado || 0}%</span>
          </div>
          <Progress value={progreso?.porcentaje_completado || 0} className="h-2" />
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-between">
          {pasos.map((paso, index) => (
            <div key={paso.numero} className="flex items-center">
              <button
                onClick={() => irAPaso(paso.numero)}
                disabled={paso.numero > pasoActual}
                className={`flex flex-col items-center gap-2 group ${
                  paso.numero > pasoActual ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    paso.completado
                      ? 'bg-green-500 text-white'
                      : paso.numero === pasoActual
                      ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                      : 'bg-gray-200 text-gray-400'
                  } ${
                    paso.numero <= pasoActual && !paso.completado
                      ? 'group-hover:bg-primary/80'
                      : ''
                  }`}
                >
                  {paso.completado ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <span className="text-lg font-bold">{paso.numero}</span>
                  )}
                </div>
                <div className="text-center hidden sm:block">
                  <p className="text-xs font-medium">{paso.titulo}</p>
                  <p className="text-xs text-muted-foreground max-w-[100px]">
                    {paso.descripcion}
                  </p>
                </div>
              </button>
              {index < pasos.length - 1 && (
                <div
                  className={`h-1 w-8 md:w-16 mx-2 transition-colors ${
                    paso.completado ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Paso {pasoActual}: {pasos[pasoActual - 1].titulo}</CardTitle>
                <CardDescription>{pasos[pasoActual - 1].descripcion}</CardDescription>
              </div>
              <div className="text-sm text-muted-foreground">
                {pasoActual} de {pasos.length}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={pasoActual}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {pasoActual === 1 && (
                  <Paso1Branding
                    datosIniciales={progreso?.wizard_data}
                    nombreTienda={progreso?.nombre_tienda}
                    onChange={handlePasoChange}
                  />
                )}
                {pasoActual === 2 && (
                  <Paso2Puntos
                    datosIniciales={progreso?.wizard_data}
                    onChange={handlePasoChange}
                  />
                )}
                {pasoActual === 3 && (
                  <Paso3Regalo
                    datosIniciales={progreso?.wizard_data}
                    onChange={handlePasoChange}
                  />
                )}
                {pasoActual === 4 && (
                  <Paso4Referidos
                    datosIniciales={progreso?.wizard_data}
                    onChange={handlePasoChange}
                  />
                )}
                {pasoActual === 5 && (
                  <Paso5QR onChange={handlePasoChange} />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setPasoActual(Math.max(1, pasoActual - 1))}
                disabled={pasoActual === 1 || guardando}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              {!pasos[pasoActual - 1].completado && (
                <Button
                  variant="ghost"
                  onClick={() => omitirPaso(pasoActual)}
                  disabled={guardando}
                >
                  Omitir por ahora
                </Button>
              )}

              <Button
                onClick={() => {
                  if (pasos[pasoActual - 1].completado) {
                    // Si ya está completado, solo avanzar al siguiente paso
                    setPasoActual(Math.min(pasoActual + 1, 5))
                  } else {
                    // Si no está completado, guardar
                    guardarPaso(pasoActual, datosPaso)
                  }
                }}
                disabled={guardando}
              >
                {guardando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    {pasoActual === 5 ? 'Finalizar' : 'Siguiente'}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
