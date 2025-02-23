import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { MongoClient } from 'mongodb';
import { google } from 'googleapis';

const uri = process.env.MONGODB_URI;
const clientPromise = new MongoClient(uri).connect();

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const CALENDAR_ID = "ifc.citas@gmail.com";

async function getGoogleCalendarService() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });
  return google.calendar({ version: "v3", auth });
}

// Crear un evento en Google Calendar
async function createEvent(calendarService, summary, fecha, horaInicio, duracionMinutos = 30) {
  const fecha_inicio = new Date(`${fecha}T${horaInicio}:00`);
  const start = new Date(fecha_inicio.getTime() + 5 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + duracionMinutos * 60 * 1000);

  const event = {
    summary,
    start: { dateTime: start.toISOString(), timeZone: "America/Lima" },
    end: { dateTime: end.toISOString(), timeZone: "America/Lima" },
  };

  const createdEvent = await calendarService.events.insert({
    calendarId: CALENDAR_ID,
    requestBody: event,
  });

  console.log(`Evento creado: ${createdEvent.data.id}`);
  return createdEvent.data;
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page"), 10) || 1;
    const pageSize = parseInt(url.searchParams.get("pageSize"), 10) || 10;

    const estados = ["promesa_pago_cancelada","promesas de pago", "seguimiento", "interesado", "activo", "cita agendada", "no interesado","pendiente de contacto","nuevo"]

    // Nuevos parámetros de filtro
    const estado = url.searchParams.get("estado"); // Filtrar por estado
    const fechaInicio = url.searchParams.get("fechaInicio"); // Fecha inicial para la última interacción
    const fechaFin = url.searchParams.get("fechaFin"); // Fecha final para la última interacción
    const search = url.searchParams.get("search")?.trim(); // Buscar por nombre, celular, o email
    const bound = url.searchParams.get("bound"); // Filtrar por bound
    const nuevasConversaciones = url.searchParams.get("nuevasConversaciones") === "true";

    // Construir condiciones dinámicas
    const whereConditions = {
        estado: estado ? { in: [estado] } : { in: estados },
      };

    if (nuevasConversaciones) {
      // Si no se envían fechas, devolver respuesta vacía
      if (!fechaInicio || !fechaFin) {
        return NextResponse.json({
          clientes: [],
          totalClientes: 0,
          message: "Para filtrar nuevas conversaciones, se requiere un rango de fechas.",
        });
      }

      whereConditions.AND = [
        {
          fecha_creacion: {
            lt: new Date(fechaInicio), // Cliente creado antes del rango de fechas
          },
        },
        {
          fecha_ultima_interaccion: {
            not: null, // Solo clientes con interacciones previas
            gte: new Date(fechaInicio),
            lte: new Date(fechaFin), // Interacción dentro del rango de fechas
          },
        },
      ];
    } else if (fechaInicio && fechaFin) {
      whereConditions.fecha_ultima_interaccion = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      };
    }

    if (fechaInicio && fechaFin) {
    whereConditions.fecha_ultima_interaccion = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
    };
    }

    if (search && search.length > 0) {
      whereConditions.AND = [
        {
            OR: [
                { nombre: { contains: search} },
                { celular: { contains: search} },
                { email: { contains: search} },
            ],
        },
    ];
  }

    if (bound !== null) {
    whereConditions.bound = bound === "true";
    }

    console.log("whereConditions", whereConditions);
    // Contar total de clientes
    const totalClientes = await prisma.clientes.count({where: whereConditions,});

    if (totalClientes === null || typeof totalClientes !== "number") {
      throw new Error("Error al contar los clientes");
    }

    // Obtener clientes paginados
    const clientes = await prisma.clientes.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: whereConditions,
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


export async function POST(request) {
  try {
    const body = await request.json();
    const { celular, nombre, estado, cita } = body;

    let celular_editado = "+51" + celular;

    console.log("Body", body);

    let motivo;
    if (estado === "cita agendada"){
      motivo = "Cita reservada para " + nombre;
    }
    else{
      motivo = "Cita confirmada para "  + nombre;
    }

    let estado_cita = ""
    if (estado === "cita agendada"){
      estado_cita = "agendada"
    }
    else{
      estado_cita = "confirmada"
    }

    const newClient = await prisma.clientes.create({
      data: {
        celular : celular_editado,
        nombre,
        estado,
        bound: true,
        citas: {
          create: {
            fecha_cita: new Date(`${cita.fecha}T${cita.hora}`),
            motivo: motivo,
            estado_cita: estado_cita,
            duracion: 20,
          },
        },
      },
    });

    const calendarService = await getGoogleCalendarService();

    await createEvent(calendarService, motivo, cita.fecha, cita.hora,20);

    const client = await clientPromise;
    const db = client.db("your_database_name");

    const cliente = {
      cliente_id: `cli_${Date.now()}`,
      nombre,
      celular : celular_editado,
      estado,
      email: "",
      conversaciones: [],
    };

    await db.collection("clientes").insertOne(cliente);

    const nuevaConversacion = {
      conversacion_id: `conv_${Date.now()}`,
      estado: "activa",
      ultima_interaccion: new Date(),
      interacciones: [],
    };

    await db.collection("clientes").updateOne(
      { celular: celular_editado },
      { $push: { conversaciones: nuevaConversacion } }
    );

    /*
    const nuevaInteraccion = {
      fecha: new Date(),
      mensaje_cliente: "Nueva cita creada",
      mensaje_chatbot: "Confirmación pendiente",
    };

    await db.collection("clientes").updateOne(
      { celular, "conversaciones.estado": "activa" },
      {
        $push: { "conversaciones.$.interacciones": nuevaInteraccion },
        $set: { "conversaciones.$.ultima_interaccion": new Date() },
      }
    );*/

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error("Error al crear cliente y cita", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
