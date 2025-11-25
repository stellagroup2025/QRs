"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes"
import { useState, useEffect, useCallback } from "react"
import { useBrandingContext } from "@/components/BrandingProvider"
import { hexToRgb } from "@/lib/brand-colors"
import {
  Gift,
  Star,
  Calendar,
  Bell,
  ShoppingBag,
  UserCheck,
  Check,
  ChevronRight,
  Shield,
  Sparkles
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

const registroSchema = z.object({
  nombre: z.string().min(2, "Tu nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Por favor, revisa que tu email sea correcto"),
  telefono: z.string().min(9, "El teléfono debe tener al menos 9 dígitos"),
  codigo_postal: z.string().regex(/^\d{5}$/, "El código postal debe tener 5 dígitos").optional().or(z.literal("")),
  fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido").optional().or(z.literal("")),
  genero: z.enum(["masculino", "femenino", "otro", "prefiero_no_decir", ""]).optional(),
  aceptarTerminos: z.boolean().refine((val) => val === true, {
    message: "Necesitamos que aceptes los términos para continuar",
  }),
  aceptarMarketing: z.boolean().optional(),
})

type RegistroFormData = z.infer<typeof registroSchema>

const beneficios = [
  {
    icon: Star,
    titulo: "Acumula puntos",
    descripcion: "Por cada compra ganas puntos que puedes canjear"
  },
  {
    icon: Gift,
    titulo: "Regalos exclusivos",
    descripcion: "Ofertas y promociones solo para miembros"
  },
  {
    icon: Calendar,
    titulo: "Regalo de cumpleaños",
    descripcion: "Te sorprenderemos en tu día especial"
  },
  {
    icon: ShoppingBag,
    titulo: "Acceso anticipado",
    descripcion: "Sé el primero en enterarte de nuevos productos"
  },
]

export function RegistroFormV2() {
  const { branding } = useBrandingContext()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [codigoReferido, setCodigoReferido] = useState<string | null>(null)
  const [completedFields, setCompletedFields] = useState(0)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegistroFormData>({
    resolver: zodResolver(registroSchema),
    mode: "onChange",
  })

  const watchedFields = watch()

  // Detectar si hay datos sin guardar para advertir antes de salir
  const hasFormData = Boolean(
    watchedFields.nombre ||
    watchedFields.email ||
    watchedFields.telefono
  )
  useUnsavedChanges({
    hasUnsavedChanges: hasFormData && !isSubmitting,
    message: '¿Seguro que quieres salir? Los datos del formulario se perderán.',
  })

  // Persistencia del formulario para evitar pérdida de datos
  const STORAGE_KEY = 'registro_form_draft'

  // Restaurar datos guardados al cargar
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const { data, step, timestamp } = JSON.parse(saved)
        // Solo restaurar si los datos tienen menos de 1 hora
        if (Date.now() - timestamp < 60 * 60 * 1000) {
          if (data.nombre) setValue('nombre', data.nombre)
          if (data.email) setValue('email', data.email)
          if (data.telefono) setValue('telefono', data.telefono)
          if (data.codigo_postal) setValue('codigo_postal', data.codigo_postal)
          if (data.fecha_nacimiento) setValue('fecha_nacimiento', data.fecha_nacimiento)
          if (data.genero) setValue('genero', data.genero)
          if (step) setCurrentStep(step)
        } else {
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    } catch (e) {
      console.error('Error restaurando formulario:', e)
    }
  }, [setValue])

  // Guardar datos automáticamente
  useEffect(() => {
    const data = {
      nombre: watchedFields.nombre,
      email: watchedFields.email,
      telefono: watchedFields.telefono,
      codigo_postal: watchedFields.codigo_postal,
      fecha_nacimiento: watchedFields.fecha_nacimiento,
      genero: watchedFields.genero,
    }
    // Solo guardar si hay algún dato
    if (Object.values(data).some(v => v)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        data,
        step: currentStep,
        timestamp: Date.now()
      }))
    }
  }, [watchedFields.nombre, watchedFields.email, watchedFields.telefono,
      watchedFields.codigo_postal, watchedFields.fecha_nacimiento, watchedFields.genero, currentStep])

  // Limpiar datos guardados después de envío exitoso
  const clearSavedForm = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // Capturar código de referido
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setCodigoReferido(ref)
      console.log('Código de referido detectado:', ref)
    }
  }, [searchParams])

  // Calcular progreso
  useEffect(() => {
    const fields = [watchedFields.nombre, watchedFields.email, watchedFields.telefono]
    const completed = fields.filter(f => f && f.length > 0).length
    setCompletedFields(completed)
  }, [watchedFields.nombre, watchedFields.email, watchedFields.telefono])

  const progreso = (currentStep / 3) * 100

  const avanzarPaso = async () => {
    let camposValidos = false

    if (currentStep === 1) {
      camposValidos = await trigger(["nombre", "email", "telefono"])
    } else if (currentStep === 2) {
      camposValidos = true // Campos opcionales
    }

    if (camposValidos) {
      setCurrentStep(currentStep + 1)
      toast({
        title: "✨ ¡Perfecto!",
        description: "Un paso más para disfrutar de las ventajas exclusivas",
      })
    }
  }

  const retrocederPaso = () => {
    setCurrentStep(currentStep - 1)
  }

  const onSubmit = async (data: RegistroFormData) => {
    setIsSubmitting(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const host = window.location.host
      const domain = host.split(':')[0].split('.')[0]

      const response = await fetch(`${API_URL}/api/clientes/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Domain': domain === 'localhost' ? 'lokeyokiera' : domain,
        },
        body: JSON.stringify({
          nombre: data.nombre,
          email: data.email,
          telefono: data.telefono,
          codigo_postal: data.codigo_postal || undefined,
          fecha_nacimiento: data.fecha_nacimiento || undefined,
          genero: data.genero && data.genero !== "" ? data.genero : undefined,
          codigo_referido: codigoReferido || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al registrar')
      }

      const result = await response.json()

      // El backend ya NO devuelve access_token - el usuario debe validar su email primero
      // Limpiar el borrador guardado
      clearSavedForm()

      if (result.requiere_validacion) {
        // Guardar email para usarlo en la pantalla de validación
        localStorage.setItem('pending_validation_email', data.email)

        toast({
          title: "📧 ¡Registro exitoso!",
          description: result.mensaje || "Revisa tu email para validar tu cuenta antes de poder iniciar sesión.",
          duration: 6000,
        })

        // Redirigir a una página que informe sobre la validación
        router.push(`/validacion-pendiente`)
      } else {
        // Fallback por si el backend devuelve algo diferente
        toast({
          title: "✅ Registro completado",
          description: "Por favor, inicia sesión para continuar.",
        })
        router.push(`/login`)
      }
    } catch (error: any) {
      toast({
        title: "Ups, algo salió mal",
        description: error.message || "No pudimos completar tu registro. ¿Podrías intentarlo de nuevo?",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const colorPrimario = hexToRgb(branding.color_primario)

  return (
    <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
      {/* Columna izquierda: Formulario */}
      <Card className="relative overflow-hidden">
        {/* Banner de referido */}
        {codigoReferido && (
          <div
            className="p-3 flex items-center gap-2 border-b"
            style={{
              backgroundColor: `${colorPrimario}10`,
              borderColor: colorPrimario
            }}
          >
            <UserCheck className="h-5 w-5" style={{ color: colorPrimario }} />
            <p className="text-sm font-medium">
              ¡Registrándote con código de referido! Ganarás puntos bonus 🎁
            </p>
          </div>
        )}

        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-2xl">Únete gratis</CardTitle>
            <span className="text-sm text-gray-500">Paso {currentStep} de 3</span>
          </div>
          <Progress value={progreso} className="h-2 mb-2" />
          <CardDescription>
            En solo 30 segundos estarás dentro y disfrutando de ventajas exclusivas
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* PASO 1: Datos personales */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="text-center mb-6">
                  <Sparkles className="h-12 w-12 mx-auto mb-2" style={{ color: colorPrimario }} />
                  <h3 className="font-semibold text-lg">Empecemos con lo básico</h3>
                  <p className="text-sm text-gray-500">Solo necesitamos conocerte un poquito</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre">¿Cómo te llamas? *</Label>
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Juan Pérez"
                    autoComplete="name"
                    {...register("nombre")}
                    className={errors.nombre ? "border-red-300" : completedFields >= 1 ? "border-green-300" : ""}
                  />
                  {errors.nombre && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      {errors.nombre.message}
                    </p>
                  )}
                  {watchedFields.nombre && watchedFields.nombre.length >= 2 && !errors.nombre && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <Check className="h-4 w-4" /> ¡Perfecto!
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Tu email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    autoComplete="email"
                    inputMode="email"
                    {...register("email")}
                    className={errors.email ? "border-red-300" : completedFields >= 2 ? "border-green-300" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                  {watchedFields.email && !errors.email && watchedFields.email.includes('@') && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <Check className="h-4 w-4" /> ¡Genial!
                    </p>
                  )}
                  <p className="text-xs text-gray-500">📧 Te enviaremos ofertas solo si te interesan</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Tu teléfono *</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="612345678"
                    autoComplete="tel"
                    inputMode="tel"
                    {...register("telefono")}
                    className={errors.telefono ? "border-red-300" : completedFields >= 3 ? "border-green-300" : ""}
                  />
                  {errors.telefono && (
                    <p className="text-sm text-red-500">{errors.telefono.message}</p>
                  )}
                  <p className="text-xs text-gray-500">📱 Solo para ventajas exclusivas, nada de spam</p>
                </div>

                <Button
                  type="button"
                  onClick={avanzarPaso}
                  className="w-full text-white"
                  style={{ backgroundColor: colorPrimario }}
                  disabled={!watchedFields.nombre || !watchedFields.email || !watchedFields.telefono}
                >
                  Continuar
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* PASO 2: Datos opcionales */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="text-center mb-6">
                  <Gift className="h-12 w-12 mx-auto mb-2" style={{ color: colorPrimario }} />
                  <h3 className="font-semibold text-lg">Personaliza tu experiencia</h3>
                  <p className="text-sm text-gray-500">Esto nos ayuda a darte mejores ofertas (opcional)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha_nacimiento" className="flex items-center gap-2">
                    🎂 Tu fecha de nacimiento
                  </Label>
                  <Input
                    id="fecha_nacimiento"
                    type="date"
                    {...register("fecha_nacimiento")}
                  />
                  <p className="text-xs text-green-600">🎁 Te enviaremos un regalo por tu cumpleaños</p>
                  <p className="text-xs text-gray-400">⚠️ Nunca compartiremos tu fecha con terceros</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codigo_postal">Código postal</Label>
                  <Input
                    id="codigo_postal"
                    type="text"
                    placeholder="28001"
                    maxLength={5}
                    inputMode="numeric"
                    {...register("codigo_postal")}
                  />
                  <p className="text-xs text-gray-500">📍 Para mostrarte ofertas de tu zona</p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={retrocederPaso}
                    variant="outline"
                    className="flex-1"
                  >
                    Atrás
                  </Button>
                  <Button
                    type="button"
                    onClick={avanzarPaso}
                    className="flex-1 text-white"
                    style={{ backgroundColor: colorPrimario }}
                  >
                    Continuar
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <button
                  type="button"
                  onClick={avanzarPaso}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Saltar este paso
                </button>
              </div>
            )}

            {/* PASO 3: Confirmaciones */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="text-center mb-6">
                  <Shield className="h-12 w-12 mx-auto mb-2" style={{ color: colorPrimario }} />
                  <h3 className="font-semibold text-lg">Ya casi estás</h3>
                  <p className="text-sm text-gray-500">Solo falta confirmar un par de cositas</p>
                </div>

                {/* Términos obligatorios */}
                <div className="space-y-3">
                  <div
                    className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor: watchedFields.aceptarTerminos ? colorPrimario : '#e5e7eb'
                    }}
                  >
                    <Checkbox
                      id="aceptarTerminos"
                      checked={watchedFields.aceptarTerminos}
                      onCheckedChange={(checked) => setValue("aceptarTerminos", checked as boolean)}
                      className="mt-0.5"
                      style={{ borderColor: colorPrimario }}
                    />
                    <Label htmlFor="aceptarTerminos" className="text-sm cursor-pointer leading-relaxed">
                      Acepto las condiciones para disfrutar del club y recibir mis ventajas.{' '}
                      <Link
                        href="/terminos"
                        target="_blank"
                        className="underline"
                        style={{ color: colorPrimario }}
                      >
                        Ver términos
                      </Link>
                    </Label>
                  </div>
                  {errors.aceptarTerminos && (
                    <p className="text-sm text-red-500">{errors.aceptarTerminos.message}</p>
                  )}
                </div>

                {/* Marketing opcional */}
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox
                    id="aceptarMarketing"
                    checked={watchedFields.aceptarMarketing}
                    onCheckedChange={(checked) => setValue("aceptarMarketing", checked as boolean)}
                    className="mt-0.5"
                  />
                  <div>
                    <Label htmlFor="aceptarMarketing" className="text-sm cursor-pointer font-medium">
                      Sí, quiero recibir ofertas personalizadas
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      No enviaremos spam. Puedes darte de baja cuando quieras.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={retrocederPaso}
                    variant="outline"
                    className="flex-1"
                  >
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 text-white font-semibold"
                    style={{ backgroundColor: colorPrimario }}
                    disabled={isSubmitting || !watchedFields.aceptarTerminos}
                  >
                    {isSubmitting ? "Procesando..." : "🎉 Activar mis ventajas"}
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
                  <Shield className="h-4 w-4" />
                  <span>Tus datos están seguros. Usamos cifrado y nunca los compartimos.</span>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Columna derecha: Beneficios */}
      <div className="hidden lg:block">
        <Card className="sticky top-4 bg-gradient-to-br from-purple-50 to-blue-50 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Star className="h-6 w-6" style={{ color: colorPrimario }} />
              Ventajas del club
            </CardTitle>
            <CardDescription>
              Miles de miembros ya disfrutan de estos beneficios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {beneficios.map((beneficio, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className="p-2 rounded-full"
                  style={{ backgroundColor: `${colorPrimario}15` }}
                >
                  <beneficio.icon className="h-6 w-6" style={{ color: colorPrimario }} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{beneficio.titulo}</h4>
                  <p className="text-sm text-gray-600">{beneficio.descripcion}</p>
                </div>
              </div>
            ))}

            <div className="mt-6 p-4 bg-white rounded-lg border-2" style={{ borderColor: colorPrimario }}>
              <Bell className="h-6 w-6 mb-2" style={{ color: colorPrimario }} />
              <p className="text-sm font-medium text-gray-900">
                ¿Sabías que...?
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Los miembros del club acumulan un promedio de <strong>1,500 puntos</strong> en su primer mes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
