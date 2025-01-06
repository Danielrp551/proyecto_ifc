import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    // Obtener todos los asesores
    const asesores = await prisma.asesor.findMany({
      select: {
        asesor_id: true,
        nombre: true,
        primer_apellido: true,
        segundo_apellido: true,
        celular: true,
        usuario: {
          select: {
            username: true, // Opcional: para traer el nombre de usuario
          },
        },
      },
      orderBy: {
        nombre: "asc", // Ordenar alfabéticamente
      },
    });

    return NextResponse.json({
      asesores,
      totalAsesores: asesores.length,
    });
  } catch (error) {
    console.error("Error al obtener asesores:", error);
    return NextResponse.json(
      { message: "Error interno del servidor al obtener asesores" },
      { status: 500 }
    );
  }
}
