"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { useBrandingContext } from "@/components/BrandingProvider"
import { hexToRgb } from "@/lib/brand-colors"
import { FileText } from "lucide-react"

const registroSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(9, "Teléfono inválido"),
  codigo_postal: z.string().regex(/^\d{5}$/, "Código postal debe tener 5 dígitos").optional().or(z.literal("")),
  fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)").optional().or(z.literal("")),
  genero: z.enum(["masculino", "femenino", "otro", "prefiero_no_decir", ""]).optional(),
  aceptarTerminos: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones",
  }),
})

type RegistroFormData = z.infer<typeof registroSchema>

export function RegistroForm() {
  const { branding } = useBrandingContext()
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aceptaTerminos, setAceptaTerminos] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegistroFormData>({
    resolver: zodResolver(registroSchema),
  })

  const onSubmit = async (data: RegistroFormData) => {
    setIsSubmitting(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

      // Obtener el dominio de la tienda actual
      const host = window.location.host
      const domain = host.split(':')[0].split('.')[0] // Extraer subdomain o primera parte

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
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al registrar')
      }

      const result = await response.json()

      toast({
        title: "¡Cuenta creada!",
        description: "Ahora puedes iniciar sesión con tu email",
      })

      // Redirigir al login para que inicie sesión con código OTP
      router.push(`/login`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear tu cuenta. Inténtalo de nuevo.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Únete al programa</CardTitle>
        <CardDescription>Crea tu QR y comienza a acumular beneficios</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo</Label>
            <Input id="nombre" placeholder="Juan Pérez" {...register("nombre")} />
            {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="juan@ejemplo.com" {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" type="tel" placeholder="612345678" {...register("telefono")} />
            {errors.telefono && <p className="text-sm text-destructive">{errors.telefono.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigo_postal">Código Postal (opcional)</Label>
            <Input id="codigo_postal" type="text" placeholder="28001" {...register("codigo_postal")} maxLength={5} />
            {errors.codigo_postal && <p className="text-sm text-destructive">{errors.codigo_postal.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento (opcional)</Label>
            <Input id="fecha_nacimiento" type="date" {...register("fecha_nacimiento")} />
            {errors.fecha_nacimiento && <p className="text-sm text-destructive">{errors.fecha_nacimiento.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="genero">Género (opcional)</Label>
            <Select onValueChange={(value) => setValue("genero", value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu género" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="femenino">Femenino</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
                <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
              </SelectContent>
            </Select>
            {errors.genero && <p className="text-sm text-destructive">{errors.genero.message}</p>}
          </div>

          {/* Términos y condiciones con checkbox más grande */}
          <div className="space-y-3">
            <div
              className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors"
              style={{ borderColor: aceptaTerminos ? hexToRgb(branding.color_primario) : '#e5e7eb' }}
            >
              <Checkbox
                id="aceptarTerminos"
                checked={aceptaTerminos}
                onCheckedChange={(checked) => {
                  setAceptaTerminos(checked as boolean)
                  setValue("aceptarTerminos", checked as boolean)
                }}
                className="mt-0.5 h-6 w-6"
                style={{
                  borderColor: hexToRgb(branding.color_primario),
                }}
              />
              <div className="flex-1">
                <Label htmlFor="aceptarTerminos" className="text-sm font-normal cursor-pointer leading-relaxed">
                  Acepto los{' '}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="font-medium underline inline-flex items-center gap-1"
                        style={{ color: hexToRgb(branding.color_primario) }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        términos y condiciones
                        <FileText className="h-3 w-3" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Términos y Condiciones del Programa de Fidelización</DialogTitle>
                        <DialogDescription>
                          Última actualización: {new Date().toLocaleDateString('es-ES')}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 text-sm">
                        <section>
                          <h3 className="font-semibold text-base mb-2">1. Aceptación de los Términos</h3>
                          <p className="text-gray-600 leading-relaxed">
                            Al registrarte en nuestro programa de fidelización, aceptas cumplir con estos términos y condiciones.
                            Si no estás de acuerdo con alguno de estos términos, por favor no te registres.
                          </p>
                        </section>

                        <section>
                          <h3 className="font-semibold text-base mb-2">2. Acumulación de Puntos</h3>
                          <p className="text-gray-600 leading-relaxed mb-2">
                            Los puntos se acumulan mediante:
                          </p>
                          <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
                            <li>Compras realizadas en el establecimiento</li>
                            <li>Referidos que se registren con tu código</li>
                            <li>Promociones especiales anunciadas por el establecimiento</li>
                          </ul>
                        </section>

                        <section>
                          <h3 className="font-semibold text-base mb-2">3. Canje de Puntos</h3>
                          <p className="text-gray-600 leading-relaxed">
                            Los puntos pueden canjearse por descuentos, productos o servicios según la disponibilidad.
                            Los puntos no tienen valor en efectivo y no son transferibles a otras personas.
                          </p>
                        </section>

                        <section>
                          <h3 className="font-semibold text-base mb-2">4. Vigencia de los Puntos</h3>
                          <p className="text-gray-600 leading-relaxed">
                            Los puntos no tienen fecha de caducidad mientras la cuenta esté activa. Una cuenta se considera
                            inactiva si no se registra ninguna actividad durante 12 meses consecutivos.
                          </p>
                        </section>

                        <section>
                          <h3 className="font-semibold text-base mb-2">5. Código QR Personal</h3>
                          <p className="text-gray-600 leading-relaxed">
                            Tu código QR es personal e intransferible. Debes mostrarlo en cada compra para acumular puntos.
                            No compartas tu código QR con terceros.
                          </p>
                        </section>

                        <section>
                          <h3 className="font-semibold text-base mb-2">6. Programa de Referidos</h3>
                          <p className="text-gray-600 leading-relaxed">
                            Al compartir tu código de referido, tanto tú como la persona referida recibirán puntos bonus
                            al completar el registro y la primera compra.
                          </p>
                        </section>

                        <section>
                          <h3 className="font-semibold text-base mb-2">7. Protección de Datos</h3>
                          <p className="text-gray-600 leading-relaxed">
                            Tus datos personales serán tratados conforme al Reglamento General de Protección de Datos (RGPD).
                            Utilizaremos tu información únicamente para gestionar tu cuenta y enviarte comunicaciones del programa.
                          </p>
                        </section>

                        <section>
                          <h3 className="font-semibold text-base mb-2">8. Modificaciones del Programa</h3>
                          <p className="text-gray-600 leading-relaxed">
                            Nos reservamos el derecho de modificar las condiciones del programa, incluyendo la cantidad de
                            puntos otorgados y las opciones de canje, con previo aviso de 30 días.
                          </p>
                        </section>

                        <section>
                          <h3 className="font-semibold text-base mb-2">9. Cancelación de Cuenta</h3>
                          <p className="text-gray-600 leading-relaxed">
                            Puedes solicitar la cancelación de tu cuenta en cualquier momento. Los puntos acumulados
                            se perderán al cancelar la cuenta.
                          </p>
                        </section>

                        <section>
                          <h3 className="font-semibold text-base mb-2">10. Contacto</h3>
                          <p className="text-gray-600 leading-relaxed">
                            Para cualquier consulta sobre el programa, puedes contactarnos a través del establecimiento
                            o mediante el correo electrónico proporcionado al momento de tu registro.
                          </p>
                        </section>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {' '}del programa de fidelización y la{' '}
                  <Link
                    href="/politica-cookies"
                    target="_blank"
                    className="font-medium underline"
                    style={{ color: hexToRgb(branding.color_primario) }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    política de cookies
                  </Link>
                </Label>
              </div>
            </div>
            {errors.aceptarTerminos && (
              <p className="text-sm text-destructive pl-2">{errors.aceptarTerminos.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full text-white" style={{ backgroundColor: hexToRgb(branding.color_primario) }} disabled={isSubmitting}>
            {isSubmitting ? "Registrando..." : "Enviar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
