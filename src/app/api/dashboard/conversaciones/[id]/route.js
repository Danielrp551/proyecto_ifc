import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const clientPromise = new MongoClient(uri).connect();

export async function GET(request, { params }) {
  try {
    const { id } = params; // Obtener el ID del cliente desde la URL

    // Verificar si el cliente existe en la base de datos
    const cliente = await prisma.clientes.findUnique({
      where: { cliente_id: parseInt(id) },
      select: {
        cliente_id: true,
        nombre: true,
        apellido: true,
        celular: true,
      },
    });

    if (!cliente) {
      return NextResponse.json({ message: "Cliente no encontrado" }, { status: 404 });
    }

    // Conectar a MongoDB y obtener las conversaciones del cliente
    const mongoClient = await clientPromise;
    const db = mongoClient.db(process.env.MONGODB_DB);
    const conversaciones = await db.collection("clientes").findOne(
      { celular: cliente.celular },
      { projection: { conversaciones: 1 } }
    );


    return NextResponse.json({
      cliente: {
        nombreCompleto: `${cliente.nombre} ${cliente.apellido}`,
        celular: cliente.celular,
      },
      conversaciones: conversaciones?.conversaciones || [],
    });
  } catch (error) {
    console.error("Error al obtener conversaciones del cliente:", error);
    return NextResponse.json(
      { message: "Error interno del servidor al obtener las conversaciones" },
      { status: 500 }
    );
  }
}
