import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    // Obtener todos los templates
    const templates = await prisma.templates.findMany({
      orderBy: {
        created_at: "desc",
      },
    });

    if (!templates || templates.length === 0) {
      return NextResponse.json(
        { message: "No se encontraron templates.", templates: [] },
        { status: 404 }
      );
    }

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error al obtener templates:", error);
    return NextResponse.json(
      { message: `Error interno del servidor al obtener templates: ${error.message}` },
      { status: 500 }
    );
  }
}
