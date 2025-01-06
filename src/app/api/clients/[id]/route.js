import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const clientPromise = new MongoClient(uri).connect();

export async function PUT(req, { params }) {
  const { id } = await params; // Obtén el ID del cliente desde la URL
  const body = await req.json(); // Parsear el body de la solicitud

  try {
    // Obtener el cliente actual para verificar su gestor antes de actualizarlo
    const clienteActual = await prisma.clientes.findUnique({
      where: { cliente_id: parseInt(id) },
      select: { gestor: true },
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