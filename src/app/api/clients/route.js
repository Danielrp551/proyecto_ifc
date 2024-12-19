import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page"), 10) || 1;
    const pageSize = parseInt(url.searchParams.get("pageSize"), 10) || 10;

    const estados = ["promesas de pago", "seguimiento", "interesado", "activo", "cita agendada", "no interesado","pendiente de contacto","nuevo"]

    // Nuevos parámetros de filtro
    const estado = url.searchParams.get("estado"); // Filtrar por estado
    const fechaInicio = url.searchParams.get("fechaInicio"); // Fecha inicial para la última interacción
    const fechaFin = url.searchParams.get("fechaFin"); // Fecha final para la última interacción
    const search = url.searchParams.get("search")?.trim(); // Buscar por nombre, celular, o email
    const bound = url.searchParams.get("bound"); // Filtrar por bound


    // Construir condiciones dinámicas
    const whereConditions = {
        estado: estado ? { in: [estado] } : { in: estados },
      };

    if (fechaInicio && fechaFin) {
    whereConditions.fecha_ultima_interaccion = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
    };
    }

    if (search && search.length > 0) {
      whereConditions.AND = [
        {
            OR: [
                { nombre: { contains: search} },
                { celular: { contains: search} },
                { email: { contains: search} },
            ],
        },
    ];
  }

    if (bound !== null) {
    whereConditions.bound = bound === "true";
    }

    console.log("whereConditions", whereConditions);
    // Contar total de clientes
    const totalClientes = await prisma.clientes.count({where: whereConditions,});

    if (totalClientes === null || typeof totalClientes !== "number") {
      throw new Error("Error al contar los clientes");
    }

    // Obtener clientes paginados
    const clientes = await prisma.clientes.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: whereConditions,
    });

    return NextResponse.json({
      clientes,
      totalClientes, // Total de clientes para el frontend
    });
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
