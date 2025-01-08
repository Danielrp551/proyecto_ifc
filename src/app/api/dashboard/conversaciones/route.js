import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request) {
  try {
    const { fechaInicio = "", fechaFin = "" } = Object.fromEntries(new URL(request.url).searchParams);

    // Validar fechas
    if (!fechaInicio || !fechaFin) {
      return NextResponse.json({ message: "Debe proporcionar fechas válidas" }, { status: 400 });
    }

    const fechaInicioObj = new Date(fechaInicio);
    const fechaFinObj = new Date(fechaFin);

    // Obtener los clientes creados dentro del rango de fechas
    const clientes = await prisma.clientes.findMany({
      where: {
        fecha_creacion: {
          gte: fechaInicioObj,
          lte: fechaFinObj,
        },
      },
      select: {
        cliente_id: true,
        fecha_creacion: true,
        estado: true,
        gestor: true, // Si hay un gestor, es una conversación gestionada
      },
    });

    // 1. Arreglo de objetos con fecha y número de conversaciones (clientes) por fecha
    const clientesPorFecha = clientes.reduce((acc, cliente) => {
        const fecha = new Date(cliente.fecha_creacion).toLocaleDateString("es-PE");
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
      const estado = cliente.estado || "Sin estado";
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      conversacionesPorFecha: arregloClientesPorFecha,
      totalConversaciones,
      conversacionesGestionadas,
      conversacionesPorEstado,
    });
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
    return NextResponse.json(
      { message: "Error interno del servidor al obtener los clientes" },
      { status: 500 }
    );
  }
}
