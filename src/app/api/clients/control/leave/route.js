import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function POST(request) {
  try {
    const { celular, asesorId } = await request.json()

    // Validación básica
    if (!celular || !asesorId) {
      return NextResponse.json(
        { message: "celular del cliente y asesorId son requeridos" },
        { status: 400 }
      )
    }

    // Opcional: Validar si realmente el asesor es quien tiene el control
    const cliente = await prisma.clientes.findFirst({
      where: { celular: celular },
      select: { asesor_control_id: true, tipo_control: true }
    })

    if (!cliente) {
      return NextResponse.json(
        { message: "Cliente no encontrado" },
        { status: 404 }
      )
    }

    if (cliente.asesor_control_id !== parseInt(asesorId)) {
      return NextResponse.json(
        { message: "El asesor no tiene el control de este cliente" },
        { status: 403 }
      )
    }

    // Aquí hacemos el update: liberamos el control
    await prisma.clientes.updateMany({
      where: { celular: celular },
      data: {
        asesor_control_id: null,
        tipo_control: "bot" // o el valor por defecto, puede ser null si prefieres
      }
    })

    return NextResponse.json({ message: "Control liberado exitosamente" })
  } catch (error) {
    console.error("Error al dejar control:", error)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
