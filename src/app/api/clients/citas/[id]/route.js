// /app/api/citas/[clienteId]/route.js

import prisma from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * Handler para solicitudes GET.
 * Retorna la última cita del cliente en estado "agendada" o "confirmada".
 */
export async function GET(request, { params }) {
  const { id } = params;

  // Validar que se proporcione un ID de cliente
  if (!id) {
    return NextResponse.json(
      { error: "ID de cliente no proporcionado." },
      { status: 400 }
    );
  }

  // Validar que clienteId sea un número (si aplica)
  const clienteIdNum = parseInt(id, 10);
  if (isNaN(clienteIdNum)) {
    return NextResponse.json(
      { error: "ID de cliente inválido." },
      { status: 400 }
    );
  }

  try {
    // Buscar la última cita con estado 'agendada' o 'confirmada' para el cliente dado
    const ultimaCita = await prisma.citas.findFirst({
      where: {
        cliente_id: clienteIdNum,
        estado_cita: {
          in: ["agendada", "confirmada"],
        },
      },
      orderBy: {
        fecha_cita: "desc", // Ordenar por fecha descendente para obtener la más reciente
      },
      // Seleccionar todos los campos de la cita
      select: {
        cita_id: true,
        cliente_id: true,
        fecha_cita: true,
        motivo: true,
        estado_cita: true,
        // Agrega aquí otros campos que quieras incluir de la cita
      },
    });

    // Si no se encuentra ninguna cita, devolver un 404
    /*
    if (!ultimaCita) {
      return NextResponse.json(
        { error: "No se encontró ninguna cita agendada o confirmada para este cliente." },
        { status: 404 }
      );
    }
    */

    // Devolver la cita encontrada
    return NextResponse.json(ultimaCita, { status: 200 });
  } catch (error) {
    console.error("Error al obtener la última cita:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
