import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      tipo_servicio,
      tipo_horario,
      dia_recurrente,
      fecha_fijo,
      inicio,
      fin,
      mes_horario,
    } = body;

    // Validar campos obligatorios
    if (!tipo_servicio || !tipo_horario || !inicio || !fin || !mes_horario) {
      return NextResponse.json(
        { message: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Validar condiciones específicas
    if (
      (tipo_horario === "recurrente" && !dia_recurrente) ||
      (tipo_horario === "fijo" && !fecha_fijo)
    ) {
      return NextResponse.json(
        { message: "Debe especificar el día según el tipo de horario" },
        { status: 400 }
      );
    }

    // Crear nuevo horario en la base de datos
    const nuevoHorario = await prisma.horarios.create({
      data: {
        tipo_servicio,
        tipo_horario,
        dia_recurrente: tipo_horario === "recurrente" ? dia_recurrente : null,
        fecha_fijo: tipo_horario === "fijo" ? String(fecha_fijo) : null,
        inicio,
        fin,
        mes_horario,
      },
    });

    return NextResponse.json({ message: "Horario creado con éxito", horario: nuevoHorario });
  } catch (error) {
    console.error("Error al crear el horario:", error);
    return NextResponse.json(
      { message: "Error interno del servidor al crear el horario" },
      { status: 500 }
    );
  }
}


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mes = searchParams.get("mes");
    const tipo = searchParams.get("tipo_servicio");

    const horarios = await prisma.horarios.findMany({
      where: {
        ...(mes ? { mes_horario: mes } : {}),
        ...(tipo ? { tipo_servicio: tipo } : {}),
      },
      orderBy: { inicio: "asc" },
    });

    return NextResponse.json({ horarios });
  } catch (error) {
    console.error("Error al obtener los horarios:", error);
    return NextResponse.json(
      { message: "Error interno del servidor al obtener los horarios" },
      { status: 500 }
    );
  }
}

// -----------------------------------------------------------------------------
// PUT  /api/horarios   →  actualizar horario (requiere id en body)
// -----------------------------------------------------------------------------
export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id, // obligatorio
      tipo_servicio,
      tipo_horario,
      dia_recurrente,
      fecha_fijo,
      inicio,
      fin,
      mes_horario,
    } = body;

    if (!id) {
      return NextResponse.json(
        { message: "El id del horario es obligatorio" },
        { status: 400 }
      );
    }

    // Validaciones mínimas (las mismas reglas que el POST)
    if (
      (tipo_horario === "recurrente" && !dia_recurrente) ||
      (tipo_horario === "fijo" && !fecha_fijo)
    ) {
      return NextResponse.json(
        { message: "Datos inconsistentes para el tipo de horario" },
        { status: 400 }
      );
    }

    const horarioActualizado = await prisma.horarios.update({
      where: { id: Number(id) },
      data: {
        ...(tipo_servicio !== undefined && { tipo_servicio }),
        ...(tipo_horario !== undefined && { tipo_horario }),
        dia_recurrente: tipo_horario === "recurrente" ? dia_recurrente : null,
        fecha_fijo: tipo_horario === "fijo" ? String(fecha_fijo) : null,
        ...(inicio !== undefined && { inicio }),
        ...(fin !== undefined && { fin }),
        ...(mes_horario !== undefined && { mes_horario }),
      },
    });

    return NextResponse.json({ message: "Horario actualizado", horario: horarioActualizado });
  } catch (error) {
    console.error("Error al actualizar el horario:", error);
    return NextResponse.json(
      { message: "Error interno del servidor al actualizar el horario" },
      { status: 500 }
    );
  }
}

// -----------------------------------------------------------------------------
// DELETE  /api/horarios?id=123   →  eliminar horario por id
// -----------------------------------------------------------------------------
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "El id del horario es obligatorio" },
        { status: 400 }
      );
    }

    await prisma.horarios.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: "Horario eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar el horario:", error);
    return NextResponse.json(
      { message: "Error interno del servidor al eliminar el horario" },
      { status: 500 }
    );
  }
}