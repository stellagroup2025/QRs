"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Promocion } from "@/types/promo"

const formSchema = z.object({
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  subtitulo: z.string().optional(),
  descripcion: z.string().optional(),
  imagenUrl: z.string().url("URL inválida").or(z.literal("")),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  placement: z.enum(["hero", "banner", "card"]),
  prioridad: z.number().min(1).max(100),
  inicio: z.string().optional(),
  fin: z.string().optional(),
  estado: z.enum(["borrador", "programada", "publicada", "expirada"]),
  etiquetas: z.string().optional(),
  utm: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface PromoEditorProps {
  promo?: Promocion
  onSave: (data: Partial<Promocion>) => void
  onCancel: () => void
}

export function PromoEditor({ promo, onSave, onCancel }: PromoEditorProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: promo?.titulo || "",
      subtitulo: promo?.subtitulo || "",
      descripcion: promo?.descripcion || "",
      imagenUrl: promo?.imagenUrl || "",
      ctaLabel: promo?.ctaLabel || "Ver más",
      ctaHref: promo?.ctaHref || "/registro",
      placement: promo?.placement || "card",
      prioridad: promo?.prioridad || 50,
      inicio: promo?.inicio ? promo.inicio.slice(0, 16) : "",
      fin: promo?.fin ? promo.fin.slice(0, 16) : "",
      estado: promo?.estado || "borrador",
      etiquetas: promo?.etiquetas?.join(", ") || "",
      utm: promo?.utm || "",
    },
  })

  const onSubmit = (data: FormValues) => {
    const payload: Partial<Promocion> = {
      ...data,
      inicio: data.inicio ? new Date(data.inicio).toISOString() : undefined,
      fin: data.fin ? new Date(data.fin).toISOString() : undefined,
      etiquetas: data.etiquetas
        ? data.etiquetas
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    }
    onSave(payload)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input {...field} placeholder="¡Oferta especial!" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subtitulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtítulo (opcional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Aprovecha esta oportunidad" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Detalles de la promoción..." rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imagenUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de imagen (opcional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="https://example.com/image.jpg" />
              </FormControl>
              <FormDescription>Imagen para la promoción</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ctaLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Texto del botón (opcional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Obtener mi QR" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ctaHref"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enlace del botón (opcional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="/registro" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="placement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicación</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="hero">Hero (principal)</SelectItem>
                    <SelectItem value="banner">Banner (superior)</SelectItem>
                    <SelectItem value="card">Tarjeta (grid)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prioridad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridad (1-100)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Mayor número = mayor prioridad</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="inicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha inicio (opcional)</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha fin (opcional)</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="estado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="borrador">Borrador</SelectItem>
                  <SelectItem value="programada">Programada</SelectItem>
                  <SelectItem value="publicada">Publicada</SelectItem>
                  <SelectItem value="expirada">Expirada</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="etiquetas"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Etiquetas (opcional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="perfumes, rebajas, verano" />
              </FormControl>
              <FormDescription>Separadas por comas</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="utm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parámetros UTM (opcional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="utm_source=web&utm_campaign=promo" />
              </FormControl>
              <FormDescription>Para tracking de campañas</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </Form>
  )
}
