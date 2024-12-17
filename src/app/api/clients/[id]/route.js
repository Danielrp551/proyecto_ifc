import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  const { id } = params; // Obtén el ID del cliente desde la URL
  const body = await req.json(); // Parsear el body de la solicitud

  try {
    // Actualiza el cliente en la base de datos
    const updatedClient = await prisma.clientes.update({
      where: { cliente_id: parseInt(id) },
      data: {
        nombre: body.nombreCompleto.split(" ")[0],
        apellido: body.nombreCompleto.split(" ").slice(1).join(" "),
        observaciones: body.observaciones,
        email: body.email,
      },
    });

    // Registra la acción comercial
    await prisma.acciones_comerciales.create({
      data: {
        cliente_id: parseInt(id),
        asesor_id: body.asesorId,
        notas: body.notas,
      },
    });

    return NextResponse.json({ message: "Cliente actualizado correctamente" });
  } catch (error) {
    console.error("Error actualizando cliente:", error);
    return NextResponse.json(
      { error: "Error actualizando cliente" },
      { status: 500 }
    );
  }
}
