import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  const { id } = params; // ID de la cita desde la URL
  const body = await request.json();
  const { fecha_cita, motivo, estado_cita, notas, asesorId } = body;

  // Validar datos requeridos
  if (!id || !notas || !asesorId) {
    return NextResponse.json(
      { error: "ID de cita, notas y asesorId son obligatorios" },
      { status: 400 }
    );
  }

  try {
    // Actualizar la cita
    const updatedCita = await prisma.citas.update({
      where: { cita_id: parseInt(id) },
      data: {
        fecha_cita: new Date(fecha_cita),
        motivo,
        estado_cita,
      },
    });

    // Registrar la acción comercial
    await prisma.acciones_comerciales.create({
      data: {
        cliente_id: updatedCita.cliente_id,
        cita_id: updatedCita.cita_id,
        asesor_id: asesorId,
        notas,
      },
    });

    return NextResponse.json({ message: "Cita actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar la cita:", error);
    return NextResponse.json(
      { error: "Error al actualizar la cita" },
      { status: 500 }
    );
  }
}
