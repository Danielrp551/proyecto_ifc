import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import prisma from "@/lib/db"

const uri = process.env.MONGODB_URI
const clientPromise = new MongoClient(uri).connect()

function convertirFecha(fechaMongo) {
  if (typeof fechaMongo === "object" && fechaMongo.$date?.$numberLong) {
    return new Date(parseInt(fechaMongo.$date.$numberLong))
  }
  return new Date(fechaMongo)
}

export async function GET(request) {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get("page") || "1")
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20")
    const orderBy = url.searchParams.get("orderBy") || "mas_reciente"
    const asesorId = url.searchParams.get("asesorId") || null

    let celularesFiltrados = null
    const tipoControlMap = new Map()

    if (asesorId) {
      const clientes = await prisma.clientes.findMany({
        where: {
          asesor_control_id: parseInt(asesorId),
        },
        select: {
          celular: true,
          tipo_control: true,
        },
      })

      celularesFiltrados = clientes.map((c) => c.celular)
      for (const c of clientes) {
        tipoControlMap.set(c.celular, c.tipo_control || "desconocido")
      }
    }

    // Filtro para MongoDB
    const mongoFiltro = {
      conversaciones: { $exists: true, $ne: [] },
    }
    if (celularesFiltrados && celularesFiltrados.length > 0) {
      mongoFiltro.celular = { $in: celularesFiltrados }
    }

    // Total real (para paginación)
    const total = await db.collection("clientes").countDocuments(mongoFiltro)

    // Consulta paginada
    const clientesMongo = await db.collection("clientes").aggregate([
      { $match: mongoFiltro },
      {
        $addFields: {
          ultimaConversacion: { $arrayElemAt: ["$conversaciones", -1] },
        },
      },
      {
        $sort: {
          "ultimaConversacion.ultima_interaccion":
            orderBy === "por_vencer" ? 1 : -1,
        },
      },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
      {
        $project: {
          nombre: 1,
          apellido: 1,
          celular: 1,
          estado: 1,
          ultimaConversacion: 1,
        },
      },
    ]).toArray()

    const conversacionesAdaptadas = clientesMongo.map((cliente) => {
      const { nombre, apellido = "", celular, ultimaConversacion } = cliente
      const conversacion = ultimaConversacion
      if (!conversacion) return null

      const tipo_control = tipoControlMap.get(celular) || "desconocido"
      const interaccionesAdaptadas = (conversacion.interacciones || []).map(
        (i) => ({
          _id: `int_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 5)}`,
          fecha: convertirFecha(i.fecha).toISOString(),
          mensaje_cliente: i.mensaje_cliente || null,
          mensaje_chatbot: i.mensaje_chatbot || null,
        })
      )

      const ultimaFecha = convertirFecha(conversacion.ultima_interaccion)

      return {
        conversacion_id: conversacion.conversacion_id,
        cliente: {
          nombre,
          apellido,
          celular,
          estado: cliente.estado || "desconocido",
        },
        ultima_interaccion: ultimaFecha.toISOString(),
        fecha_obj: ultimaFecha,
        mensajes_no_leidos: 0,
        estado_conversacion: conversacion.estado || "activa",
        tipo_control,
        interacciones: interaccionesAdaptadas,
      }
    })

    // Eliminar los que quedaron null
    const resultadoFinal = conversacionesAdaptadas
      .filter((conv) => conv !== null)
      .map(({ fecha_obj, ...rest }) => rest)

    return NextResponse.json({
      conversaciones: resultadoFinal,
      total,
      page,
      pageSize,
    })
  } catch (error) {
    console.error("Error al obtener conversaciones:", error)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
