import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request) {
  try {
    const { fechaInicio = "", fechaFin = "" } = Object.fromEntries(new URL(request.url).searchParams);

    // If no dates are provided, fetch all records without date limits
    const fechaInicioDate = fechaInicio ? new Date(fechaInicio) : null;
    const fechaFinDate = fechaFin ? new Date(fechaFin) : null;

    if ((fechaInicio && isNaN(fechaInicioDate.getTime())) || (fechaFin && isNaN(fechaFinDate.getTime()))) {
      return NextResponse.json(
        { message: "Formato de fecha inválido. Utiliza YYYY-MM-DD." },
        { status: 400 }
      );
    }

    const whereCondition = fechaInicioDate && fechaFinDate
      ? {
          fecha_cita: {
            gte: fechaInicioDate,
            lte: fechaFinDate,
          },
        }
      : {};

    // Consulta de las citas en el rango de fechas
    const citas = await prisma.citas.findMany({
      where: whereCondition,
      orderBy: {
        fecha_cita: "asc",
      },
      select: {
        cita_id: true,
        cliente_id: true,
        fecha_cita: true,
        estado_cita: true,
        motivo: true,
        fecha_creacion: true,
        duracion: true,
        clientes: {
          select: {
            nombre: true,
            apellido: true,
            celular: true,
            email: true,
          },
        },
      },
    });

    const totalCitas = await prisma.citas.count({
      where: whereCondition,
    });

    if (!citas) {
      return NextResponse.json(
        { message: "No se encontraron citas en el rango especificado.", citas: [] },
        { status: 404 }
      );
    }

    return NextResponse.json({
      citas: citas ?? [],
      totalCitas: totalCitas ?? 0,
    });
  } catch (error) {
    console.error("Error al obtener citas:", error);
    return NextResponse.json(
      { message: `Error interno del servidor al obtener citas: ${error.message}` },
      { status: 500 }
    );
  }
}
