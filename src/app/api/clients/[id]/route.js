import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { MongoClient } from 'mongodb';
import { google } from 'googleapis';

const uri = process.env.MONGODB_URI;
const clientPromise = new MongoClient(uri).connect();

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const CALENDAR_ID = "ifc.citas@gmail.com";

// Función para autenticarse con Google Calendar
async function getGoogleCalendarService() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });
  return google.calendar({ version: "v3", auth });
}

// Eliminar eventos por rango de tiempo
async function deleteEventsInRange(calendarService, fecha, horaInicio, duracionMinutos = 30) {
  const fecha_inicio = new Date(`${fecha}T${horaInicio}:00`);
  const start = new Date(fecha_inicio.getTime() + 5 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + duracionMinutos * 60 * 1000);

  const events = await calendarService.events.list({
    calendarId: CALENDAR_ID,
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  for (const event of events.data.items || []) {
    await calendarService.events.delete({
      calendarId: CALENDAR_ID,
      eventId: event.id,
    });
    console.log(`Evento eliminado: ${event.summary}`);
  }
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

export async function PUT(req, { params }) {
  const { id } = await params; // Obtén el ID del cliente desde la URL
  const body = await req.json(); // Parsear el body de la solicitud

  try {
    // Obtener el cliente actual para verificar su gestor antes de actualizarlo
    const clienteActual = await prisma.clientes.findUnique({
      where: { cliente_id: parseInt(id) },
      select: { gestor: true, nombre: true, apellido: true },
    });

    if (!clienteActual) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    const gestorAnterior = clienteActual.gestor; // Gestor antes de la actualización
    const gestorNuevo = body.gestor; // Nuevo gestor enviado desde el body

    // Descomponer el nombre y apellido del gestor
    const [nombreAnterior, ...apellidosAnteriores] = gestorAnterior ? gestorAnterior.split(" ") : [];
    const [nombreNuevo, ...apellidosNuevos] = gestorNuevo ? gestorNuevo.split(" ") : [];

    // Actualiza el cliente en la base de datos
    const updatedClient = await prisma.clientes.update({
      where: { cliente_id: parseInt(id) },
      data: {
        nombre: body.nombreCompleto.split(" ")[0],
        apellido: body.nombreCompleto.split(" ").slice(1).join(" "),
        observaciones: body.observaciones,
        email: body.email,
        gestor: gestorNuevo,
        acciones: body.acciones,
      },
    });

    // Actualizar la tabla asesor si el gestor cambió
    if (gestorAnterior !== gestorNuevo) {
      if (gestorAnterior !== "") {
        // Restar 1 al `num_leads` del asesor anterior
        await prisma.asesor.updateMany({
          where: {
            nombre: nombreAnterior,
            primer_apellido: apellidosAnteriores.join(" "),
          },
          data: { num_leads: { decrement: 1 } },
        });
      }

      if (gestorNuevo !== "") {
        // Sumar 1 al `num_leads` del nuevo asesor
        await prisma.asesor.updateMany({
          where: {
            nombre: nombreNuevo,
            primer_apellido: apellidosNuevos.join(" "),
          },
          data: { num_leads: { increment: 1 } },
        });
      }
    }

    const calendarService = await getGoogleCalendarService();

      // Manejar la acción de "cita agendada" o "promesa"
      if (body.acciones === "cita_agendada" || body.acciones === "promesa_de_pago") {
        const nuevaCitaFecha = new Date(`${body.fechaCita}T${body.horaCita}:00`);
        //const nuevaCitaFecha = new Date(nuevaCitaFechaUTC.getTime() - 5 * 60 * 60 * 1000);
        const motivoCita = body.acciones === "cita_agendada" ? `Cita confirmada para ${clienteActual.nombre}` : `Cita reservada para ${clienteActual.nombre}`;
        const estadoCita = body.acciones === "cita_agendada" ? "confirmada" : "agendada";

        // Obtener las citas actuales del cliente que se van a marcar como eliminadas
        const citasAEliminar = await prisma.citas.findMany({
          where: { cliente_id: parseInt(id), estado_cita: "agendada" },
        });

        // Marcar como eliminadas las citas existentes del cliente
        await prisma.citas.updateMany({
          where: { cliente_id: parseInt(id), estado_cita: { in: ["agendada","confirmada"]}},
          data: { estado_cita: "eliminada" },
        });

        // Eliminar eventos correspondientes en Google Calendar
        for (const cita of citasAEliminar) {
          const fecha = cita.fecha_cita.toISOString().split("T")[0];
          const horaInicio = new Date(cita.fecha_cita).toISOString().split("T")[1].slice(0, 5);
          await deleteEventsInRange(calendarService, fecha, horaInicio);
        }
  
        // Eliminar eventos de Google Calendar en el rango de tiempo
        //await deleteEventsInRange(calendarService, body.fechaCita, body.horaCita);

        // Crear una nueva cita para el cliente
        const nuevaCita = await prisma.citas.create({
          data: {
            cliente_id: parseInt(id),
            fecha_cita: nuevaCitaFecha,
            estado_cita: estadoCita,
            motivo: motivoCita,
          },
        });
  
        await createEvent(calendarService, motivoCita, body.fechaCita, body.horaCita);

        console.log("Nueva cita creada:", nuevaCita);

        let estado_cliente = ""
        if (body.acciones === "cita_agendada")
          estado_cliente = "cita agendada"
        else
          estado_cliente = "promesas de pago"
        // actualizar cliente
        await prisma.clientes.update({
          where: { cliente_id: parseInt(id) },
          data: {
            estado : estado_cliente
          },
        });
      }

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


export async function GET(request, { params }) {
  try {
    const { id } = params; // Get the client ID
    const cliente = await prisma.clientes.findUnique({
      where: { cliente_id: parseInt(id) },
      include: {
        citas: {
          orderBy: { fecha_cita: 'desc' },
          take: 5 // Limit to the 5 most recent appointments
        },
        pagos: {
          orderBy: { fecha_pago: 'desc' },
          take: 5 // Limit to the 5 most recent payments
        },
        acciones_comerciales: {
          orderBy: { acciones_comerciales_id: 'desc' },
          take: 5 // Limit to the 5 most recent commercial actions
        },
        historico: {
          orderBy: { fecha_estado: 'desc' },
          take: 1 // Get only the most recent status
        },
        leads: {
          orderBy: { fecha_contacto: 'desc' },
          take: 1 // Get only the most recent lead
        }
      }
    });

    if (!cliente) {
      return NextResponse.json({ message: "Cliente no encontrado" }, { status: 404 });
    }

    // Fetch conversations from MongoDB
    const mongoClient = await clientPromise;
    const db = mongoClient.db(process.env.MONGODB_DB);
    const mongoConversations = await db.collection('clientes').findOne(
      { celular: cliente.celular },
      { projection: { conversaciones: 1 } }
    );

    // Format dates to ISO string for easier handling in the frontend
    const formattedCliente = {
      ...cliente,
      fecha_creacion: cliente.fecha_creacion?.toISOString(),
      fecha_ultima_interaccion: cliente.fecha_ultima_interaccion?.toISOString(),
      fecha_ultima_interaccion_bot: cliente.fecha_ultima_interaccion_bot?.toISOString(),
      citas: cliente.citas.map(cita => ({
        ...cita,
        fecha_cita: cita.fecha_cita.toISOString(),
        fecha_creacion: cita.fecha_creacion.toISOString()
      })),
      pagos: cliente.pagos.map(pago => ({
        ...pago,
        fecha_pago: pago.fecha_pago.toISOString()
      })),
      historico: cliente.historico.map(h => ({
        ...h,
        fecha_estado: h.fecha_estado.toISOString()
      })),
      leads: cliente.leads.map(lead => ({
        ...lead,
        fecha_contacto: lead.fecha_contacto.toISOString()
      })),
      conversaciones: mongoConversations?.conversaciones || []
    };

    return NextResponse.json(formattedCliente);
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}