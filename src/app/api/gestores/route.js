import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request) {
  try {
    const {
      search = "",
      page = "1",
      pageSize = "10",
    } = Object.fromEntries(new URL(request.url).searchParams);

    // Convertir `page` y `pageSize` a números
    const pageNumber = parseInt(page, 10);
    const pageSizeNumber = parseInt(pageSize, 10);

    // Calcular el desplazamiento
    const skip = (pageNumber - 1) * pageSizeNumber;

    // Construir el filtro de búsqueda
    const searchFilter = search
      ? {
          OR: [
            { nombre: { contains: search } },
            { primer_apellido: { contains: search } },
            { segundo_apellido: { contains: search } },
          ],
        }
      : {};

    // Obtener todos los asesores
    const asesores = await prisma.asesor.findMany({
      where: {
        usuario: {
          roles: {
            nombre_rol: "asesor", // Solo usuarios con rol "asesor"
          },
        },
        AND: searchFilter,
      },
      skip: skip,
      take: pageSizeNumber,
      select: {
        asesor_id: true,
        nombre: true,
        primer_apellido: true,
        segundo_apellido: true,
        celular: true,
        num_leads: true,
        usuario: {
          select: {
            username: true,
          },
        },
      },
    });

    
    const totalAsesores = await prisma.asesor.count({
      where: {
        usuario: {
          roles: {
            nombre_rol: "asesor",
          },
        },
        AND: searchFilter,
      },
    });

    return NextResponse.json({
      asesores,
      totalAsesores,
    });
  } catch (error) {
    console.error("Error al obtener asesores:", error);
    return NextResponse.json(
      { message: "Error interno del servidor al obtener asesores" },
      { status: 500 }
    );
  }
}
