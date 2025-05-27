import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const clienteId = parseInt(searchParams.get("clienteId"))

  if (!clienteId) {
    return NextResponse.json({ message: "clienteId requerido" }, { status: 400 })
  }

  try {
    const cliente = await prisma.clientes.findUnique({
      where: { cliente_id: clienteId },
      select: { tipo_control: true }
    })

    if (!cliente) {
      return NextResponse.json({ message: "Cliente no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ tipo_control: cliente.tipo_control || "desconocido" })
  } catch (error) {
    console.error("Error al verificar control:", error)
    return NextResponse.json({ message: "Error interno" }, { status: 500 })
  }
}


export async function POST(request) {
  try {
    const { clienteId, asesorId } = await request.json()

    if (!clienteId || !asesorId) {
      return NextResponse.json({ message: "clienteId y asesorId son requeridos" }, { status: 400 })
    }

    const cliente = await prisma.clientes.findUnique({
      where: { cliente_id: clienteId },
      select: { tipo_control: true, historial_control:true }
    })

    if (!cliente) {
      return NextResponse.json({ message: "Cliente no encontrado" }, { status: 404 })
    }

    if (cliente.tipo_control === "asesor") {
      return NextResponse.json({ message: "Este cliente ya está en control de un asesor" }, { status: 409 })
    }

    const historialActual = cliente.historial_control || ""
    const idsExistentes = historialActual.split(",").map(id => id.trim()).filter(Boolean)
    const idsActualizados = new Set([...idsExistentes, String(asesorId)])
    const historialNuevo = Array.from(idsActualizados).join(",")

    await prisma.clientes.update({
      where: { cliente_id: clienteId },
      data: {
        tipo_control: "asesor",
        asesor_control_id: asesorId,
        historial_control: historialNuevo
      }
    })

    return NextResponse.json({ message: "Control asignado con éxito" })
  } catch (error) {
    console.error("Error al tomar control:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}