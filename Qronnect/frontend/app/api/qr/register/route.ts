import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { crearCliente } from "@/lib/dataAdapter"

// Schema de validación (debe coincidir con el del frontend)
const registroSchema = z.object({
  nombre: z.string().min(2, "Tu nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Introduce un email válido"),
  telefono: z.string().min(9, "Teléfono inválido").optional().or(z.literal("")),
  consentimiento: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar el uso de tus datos" }),
  }),
})

export async function POST(request: NextRequest) {
  try {
    // Parse del body
    const body = await request.json()

    // Validar con zod
    const result = registroSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Datos inválidos",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { nombre, email, telefono } = result.data

    // Crear cliente usando el adapter existente
    const cliente = crearCliente({
      nombre,
      email,
      telefono: telefono || undefined,
    })

    // Retornar respuesta exitosa con los datos del cliente
    return NextResponse.json(
      {
        message: "QR creado exitosamente",
        data: {
          id: cliente.id,
          token: cliente.token,
          qrUrl: `/mi-qr?cid=${cliente.id}&t=${cliente.token}`,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[API /qr/register] Error:", error)

    return NextResponse.json(
      {
        message: "Error interno del servidor",
      },
      { status: 500 }
    )
  }
}
