import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page"), 10) || 1;
    const pageSize = parseInt(url.searchParams.get("pageSize"), 10) || 10;

    const estados = ["promesas de pago", "seguimiento", "interesado", "activo", "cita agendada", "no interesado","pendiente de contacto","nuevo"]

    // Contar total de clientes
    const totalClientes = await prisma.clientes.count({where: { estado: { in: estados }},});

    // Obtener clientes paginados
    const clientes = await prisma.clientes.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: { estado: { in: estados }},
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
