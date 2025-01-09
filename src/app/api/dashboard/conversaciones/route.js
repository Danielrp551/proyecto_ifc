import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const clientPromise = new MongoClient(uri).connect();

export async function GET(request) {
  try {
    const {
      fechaInicio = "",
      fechaFin = "",
      asesor = "",
      estado = "",
      accion = "",
      search = "",
    } = Object.fromEntries(new URL(request.url).searchParams);

    // Validar fechas
    if (!fechaInicio || !fechaFin) {
      return NextResponse.json({ message: "Debe proporcionar fechas válidas" }, { status: 400 });
    }

    const fechaInicioObj = new Date(fechaInicio);
    const fechaFinObj = new Date(fechaFin);
    const estados = ["promesas de pago", "seguimiento", "interesado", "activo", "cita agendada", "no interesado","pendiente de contacto","nuevo","contactado"];

    // Filtro por asesor
    const asesorFilter = asesor
      ? {
          gestor: {
            contains: asesor.trim(), // Búsqueda parcial por nombre del asesor
          },
        }
      : {};

    // Filtro por estado
    const estadoFilter = estado
      ? {
          estado: {
            equals: estado.trim(),
          },
        }
      : {
            estado: {
                in: estados,
            },
      };

    // Filtro por acción
    const accionFilter = accion
      ? {
          acciones: {
            contains: accion.trim(),
          },
        }
      : {};

    // Filtro por búsqueda general (nombre, apellido, celular)
    const searchFilter = search
      ? {
          OR: [
            { nombre: { contains: search.trim() } },
            { apellido: { contains: search.trim() } },
            { celular: { contains: search.trim() } },
          ],
        }
      : {};

    // Obtener los clientes filtrados dentro del rango de fechas
    const clientes = await prisma.clientes.findMany({
      where: {
        fecha_creacion: {
          gte: fechaInicioObj,
          lte: fechaFinObj,
        },
        ...asesorFilter,
        ...estadoFilter,
        ...accionFilter,
        ...searchFilter,
      },
      select: {
        cliente_id: true,
        celular: true,
        fecha_creacion: true,
        estado: true,
        gestor: true,
        acciones: true,
      },
    });

    const celulares = clientes.map((cliente) => cliente.celular);

    // Conectar a MongoDB
    const mongoClient = await clientPromise;
    const db = mongoClient.db(process.env.MONGODB_DB);

    // Consultar interacciones desde la colección "clientes"
    const interacciones = await db.collection("clientes").aggregate([
      {
        $match: {
          "celular": { $in: celulares },
        },
      },
      {
        $unwind: "$conversaciones",
      },
      {
        $unwind: "$conversaciones.interacciones",
      },
      {
        $match: {
          "conversaciones.interacciones.fecha": {
            $gte: fechaInicioObj,
            $lte: fechaFinObj,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalInteracciones: { $sum: 1 },
        },
      },
    ]).toArray();

    const totalInteracciones = interacciones.length > 0 ? interacciones[0].totalInteracciones : 0;

    // 1. Arreglo de objetos con fecha y número de conversaciones (clientes) por fecha
    const clientesPorFecha = clientes.reduce((acc, cliente) => {
      const fecha = new Date(cliente.fecha_creacion).toLocaleDateString("es-PE");
      //const fecha = new Date(cliente.fecha_creacion);
      acc[fecha] = (acc[fecha] || 0) + 1;
      return acc;
    }, {});

    const arregloClientesPorFecha = Object.entries(clientesPorFecha).map(([fecha, numClientes]) => ({
      fecha,
      num_conversaciones: numClientes,
    }));

    // 2. Total de conversaciones (clientes)
    const totalConversaciones = clientes.length;

    // 3. Número de conversaciones gestionadas (clientes con gestor asignado)
    const conversacionesGestionadas = clientes.filter(
      (cliente) => cliente.gestor && cliente.gestor.trim() !== ""
    ).length;

    // 4. Estado de las conversaciones
    const conversacionesPorEstado = clientes.reduce((acc, cliente) => {
      const estadoCliente = cliente.estado || "Sin estado";
      acc[estadoCliente] = (acc[estadoCliente] || 0) + 1;
      return acc;
    }, {});

    // 5. Número de clientes con acción "cita_agendada"
    const numCitaAgendada = clientes.filter(
        (cliente) => cliente.acciones === "cita_agendada"
      ).length;

    return NextResponse.json({
      conversacionesPorFecha: arregloClientesPorFecha,
      totalConversaciones,
      conversacionesGestionadas,
      conversacionesPorEstado,
      numCitaAgendada,
      totalInteracciones,
      clientes,
    });
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
    return NextResponse.json(
      { message: "Error interno del servidor al obtener los clientes" },
      { status: 500 }
    );
  }
}
