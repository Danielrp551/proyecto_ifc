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

    // Consulta en la colección de "clientes"
    const clientes = await db.collection("clientes").aggregate([
      {
        $match: {
          "conversaciones.interacciones.fecha": {
            $gte: fechaInicioObj,
            $lte: fechaFinObj,
          },
        },
      },
      {
        $unwind: "$conversaciones",
      },
      {
        $unwind: "$conversaciones.interacciones",
      },
      {
        $match: {
          "conversaciones.interacciones.fecha": {
            $gte: fechaInicioObj,
            $lte: fechaFinObj,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalInteracciones: { $sum: 1 },
        },
      },
    ]).toArray();

    const totalInteracciones = clientes.length > 0 ? clientes[0].totalInteracciones : 0;

    // Respuesta
    return NextResponse.json({
      totalInteracciones,
    });
  } catch (error) {
    console.error("Error al obtener interacciones:", error);
    return NextResponse.json(
      { message: "Error interno del servidor al obtener interacciones" },
      { status: 500 }
    );
  }
}
