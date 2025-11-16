"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useStaffAuth } from "@/stores/useStaffAuth"

const pinSchema = z.object({
  pin: z.string().min(4, "El PIN debe tener al menos 4 caracteres"),
})

type PinFormData = z.infer<typeof pinSchema>

interface PINDialogProps {
  open: boolean
  onSuccess: () => void
}

export function PINDialog({ open, onSuccess }: PINDialogProps) {
  const { toast } = useToast()
  const loginWithPin = useStaffAuth((s) => s.loginWithPin)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PinFormData>({
    resolver: zodResolver(pinSchema),
  })

  const onSubmit = (data: PinFormData) => {
    const role = loginWithPin(data.pin.trim())

    if (role) {
      toast({
        title: "Acceso concedido",
        description: `Bienvenido como ${role === "admin" ? "Administrador" : "Comercial"}`,
      })
      reset()
      onSuccess()
    } else {
      toast({
        title: "PIN incorrecto",
        description: "El PIN ingresado no es válido",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Acceso de Staff</DialogTitle>
          <DialogDescription>Ingresa el PIN de acceso para continuar</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin">PIN de acceso</Label>
            <Input id="pin" type="password" placeholder="••••" autoFocus {...register("pin")} />
            {errors.pin && <p className="text-sm text-destructive">{errors.pin.message}</p>}
          </div>
          <Button type="submit" className="w-full">
            Acceder
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
