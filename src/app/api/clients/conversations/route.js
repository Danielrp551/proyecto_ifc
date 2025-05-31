import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import prisma from "@/lib/db";

const uri = process.env.MONGODB_URI;
const clientPromise = new MongoClient(uri).connect();

function convertirFecha(fechaMongo) {
  if (typeof fechaMongo === "object" && fechaMongo.$date?.$numberLong) {
    return new Date(parseInt(fechaMongo.$date.$numberLong));
  }
  return new Date(fechaMongo);
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "20");
    const orderBy = url.searchParams.get("orderBy") || "mas_reciente";
    const asesorIdRaw = url.searchParams.get("asesorId");
    const asesorId = asesorIdRaw ? parseInt(asesorIdRaw) : null;

    let celularesFiltrados = null;
    const tipoControlMap = new Map();
    console.log("🔍 Parámetros de consulta:")

    // Paso 1: Consultar clientes en Prisma
    if (asesorId) {
      console.log("🔍 Consultando clientes asignados al asesor:", asesorId);
      try {
        const clientes = await prisma.clientes.findMany({
          where: { asesor_control_id: asesorId },
          select: {
            celular: true,
            tipo_control: true,
          },
          orderBy: {
            fecha_ultima_interaccion: orderBy === "por_vencer" ? "asc" : "desc",
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
        });
        console.log("✅ Clientes obtenidos desde Prisma:", clientes);

        celularesFiltrados = clientes.map((c) => c.celular);
        for (const c of clientes) {
          tipoControlMap.set(c.celular, c.tipo_control || "desconocido");
        }
      } catch (error) {
        console.error("❌ Error en consulta Prisma:", error ?? {});
        return NextResponse.json(
          { message: "Error al consultar clientes en Prisma" },
          { status: 500 }
        );
      }
    }

    // Paso 2: Establecer conexión con Mongo y armar filtro
    let db;
    try {
      const client = await clientPromise;
      db = client.db(process.env.MONGODB_DB);
    } catch (error) {
      console.error("❌ Error al conectar con MongoDB:", error);
      return NextResponse.json(
        { message: "Error al conectar con MongoDB" },
        { status: 500 }
      );
    }

    const mongoFiltro = {
      conversaciones: { $exists: true, $ne: [] },
    };
    if (celularesFiltrados?.length > 0) {
      mongoFiltro.celular = { $in: celularesFiltrados };
    }

    // Paso 3: Calcular total
    let total = 0;
    try {
      if (asesorId) {
        total = await prisma.clientes.count({
          where: {
            asesor_control_id: asesorId,
          },
        });
      } else {
        total = await db.collection("clientes").countDocuments({
          conversaciones: { $exists: true, $ne: [] },
        });
      }
    } catch (error) {
      console.error("❌ Error al contar documentos:", error);
    }

    // Paso 4: Obtener conversaciones desde Mongo
    let clientesMongo;
    try {
      clientesMongo = await db.collection("clientes").aggregate([
        { $match: mongoFiltro },
        {
          $addFields: {
            ultimaConversacion: { $arrayElemAt: ["$conversaciones", -1] },
          },
        },
        {
          $project: {
            nombre: 1,
            apellido: 1,
            celular: 1,
            estado: 1,
            ultimaConversacion: 1,
          },
        },
      ]).toArray();
    } catch (error) {
      console.error("❌ Error en consulta MongoDB:", error);
      return NextResponse.json(
        { message: "Error al obtener datos desde MongoDB" },
        { status: 500 }
      );
    }

    // Paso 5: Adaptar los datos
    const conversacionesAdaptadas = clientesMongo.map((cliente) => {
      const { nombre, apellido = "", celular, ultimaConversacion } = cliente;
      if (!ultimaConversacion) return null;

      const tipo_control = tipoControlMap.get(celular) || "desconocido";
      const interaccionesAdaptadas = (ultimaConversacion.interacciones || []).map(
        (i) => ({
          _id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          fecha: convertirFecha(i.fecha).toISOString(),
          mensaje_cliente: i.mensaje_cliente || null,
          mensaje_chatbot: i.mensaje_chatbot || null,
        })
      );

      const ultimaFecha = convertirFecha(ultimaConversacion.ultima_interaccion);

      return {
        conversacion_id: ultimaConversacion.conversacion_id,
        cliente: {
          nombre,
          apellido,
          celular,
          estado: cliente.estado || "desconocido",
        },
        ultima_interaccion: ultimaFecha.toISOString(),
        fecha_obj: ultimaFecha,
        mensajes_no_leidos: 0,
        estado_conversacion: ultimaConversacion.estado || "activa",
        tipo_control,
        interacciones: interaccionesAdaptadas,
      };
    });

    const resultadoFinal = conversacionesAdaptadas
      .filter((conv) => conv !== null)
      .map(({ fecha_obj, ...rest }) => rest);

    return NextResponse.json({
      conversaciones: resultadoFinal,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("❌ Error general:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
