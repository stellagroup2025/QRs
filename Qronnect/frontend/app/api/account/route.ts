import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { eliminarCliente } from "@/lib/dataAdapter"

// Schema de validación para eliminación
const deleteSchema = z.object({
  clienteId: z.string().min(1, "ID de cliente requerido"),
  token: z.string().min(1, "Token requerido"),
})

// RGPD: Eliminación de datos (derecho de supresión)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar con zod
    const result = deleteSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          message: "Datos inválidos",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { clienteId, token } = result.data

    // Intentar eliminar el cliente
    const eliminado = eliminarCliente(clienteId, token)

    if (!eliminado) {
      return NextResponse.json(
        {
          message: "Cliente no encontrado o token inválido",
        },
        { status: 404 }
      )
    }

    // Éxito
    return NextResponse.json(
      {
        message: "Tus datos han sido eliminados correctamente",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[API /account DELETE] Error:", error)

    return NextResponse.json(
      {
        message: "Error interno del servidor",
      },
      { status: 500 }
    )
  }
}
