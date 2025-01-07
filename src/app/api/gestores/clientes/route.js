import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request) {
  try {
    const {
      asesor = "",
      fechaInicio = "",
      fechaFin = "",
      accion = "",
      search = "",
      page = "1",
      pageSize = "10",
    } = Object.fromEntries(new URL(request.url).searchParams);

    // Convertir `page` y `pageSize` a números
    const pageNumber = parseInt(page, 10);
    const pageSizeNumber = parseInt(pageSize, 10);

    const estados = ["promesas de pago", "seguimiento", "interesado", "activo", "cita agendada", "no interesado","pendiente de contacto","nuevo"]

    // Calcular el desplazamiento
    const skip = (pageNumber - 1) * pageSizeNumber;

    // Filtro por asesor
    const asesorFilter = asesor
      ? {
          gestor: {
            contains: asesor.trim(), // Búsqueda parcial con el nombre completo del asesor
          },
        }
      : {};

    // Filtro por fecha de creación
    const fechaFilter =
      fechaInicio && fechaFin
        ? {
            fecha_creacion: {
              gte: new Date(fechaInicio), // `gte` = "mayor o igual a"
              lte: new Date(fechaFin), // `lte` = "menor o igual a"
            },
          }
        : {};

    // Filtro por acción
    const accionFilter = accion
      ? {
          acciones: {
            equals: accion, // La acción debe coincidir exactamente
          },
        }
      : {};

    // Filtro por búsqueda general (nombre, apellido, celular)
    const searchFilter = search
      ? {
          OR: [
            { nombre: { contains: search.trim()  } },
            { apellido: { contains: search.trim() } },
            { celular: { contains: search.trim() } },
          ],
        }
      : {};

    // Obtener los clientes filtrados
    const clientes = await prisma.clientes.findMany({
      where: {
        ...asesorFilter,
        ...fechaFilter,
        ...accionFilter,
        ...searchFilter,
        estado: { in: estados },
      },
      skip: skip,
      take: pageSizeNumber,
      orderBy: {
        fecha_creacion: "desc", // Ordenar por fecha de creación descendente
      },
      select: {
        cliente_id: true,
        nombre: true,
        apellido: true,
        celular: true,
        email: true,
        fecha_creacion: true,
        gestor: true,
        acciones: true,
        estado: true,
        observaciones: true,
      },
    });

    // Contar el total de clientes que coinciden con el filtro
    const totalClientes = await prisma.clientes.count({
      where: {
        ...asesorFilter,
        ...fechaFilter,
        ...accionFilter,
        ...searchFilter,
        estado: { in: estados },
      },
    });

    return NextResponse.json({
      clientes,
      totalClientes,
    });
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return NextResponse.json(
      { message: "Error interno del servidor al obtener clientes" },
      { status: 500 }
    );
  }
}
