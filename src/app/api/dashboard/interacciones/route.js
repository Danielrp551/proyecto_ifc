import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const clientPromise = new MongoClient(uri).connect();

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const fechaInicio = url.searchParams.get("fechaInicio");
    const fechaFin = url.searchParams.get("fechaFin");

    // Validar fechas
    if (!fechaInicio || !fechaFin) {
      return NextResponse.json({ message: "Debe proporcionar fechas válidas" }, { status: 400 });
    }

    const fechaInicioObj = new Date(fechaInicio);
    const fechaFinObj = new Date(fechaFin);

    // Conectar a MongoDB
    const mongoClient = await clientPromise;
    const db = mongoClient.db(process.env.MONGODB_DB);

    // Consulta en la colección "clientes" para filtrar documentos por rango de fechas
    const clientes = await db.collection("clientes").find({
      "conversaciones.interacciones.fecha": {
        $gte: fechaInicioObj,
        $lte: fechaFinObj,
      },
    }).project({ nombre: 1, celular: 1, email: 1 }).toArray(); // Retorna solo los campos necesarios

    // Respuesta
    return NextResponse.json({
      totalClientes: clientes.length,
      clientes,
    });
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return NextResponse.json(
      { message: "Error interno del servidor al obtener clientes" },
      { status: 500 }
    );
  }
}
