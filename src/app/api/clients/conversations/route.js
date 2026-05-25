import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import getFirestore, { getUltimaConversacion } from '@/lib/firestore';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);
    const orderBy = url.searchParams.get('orderBy') || 'mas_reciente';
    const asesorIdRaw = url.searchParams.get('asesorId');
    const asesorId = asesorIdRaw ? parseInt(asesorIdRaw, 10) : null;

    const fs = getFirestore();

    // Paso 1: filtrar celulares por asesor (Prisma) o tomar todos (Firestore).
    let celulares = null;
    const tipoControlMap = new Map();

    if (asesorId) {
      const clientes = await prisma.clientes.findMany({
        where: { asesor_control_id: asesorId },
        select: { celular: true, tipo_control: true, fecha_ultima_interaccion: true },
        orderBy: {
          fecha_ultima_interaccion: orderBy === 'por_vencer' ? 'asc' : 'desc',
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
      celulares = clientes.map((c) => c.celular);
      for (const c of clientes) {
        tipoControlMap.set(c.celular, c.tipo_control || 'desconocido');
      }
    }

    if (asesorId && (!celulares || celulares.length === 0)) {
      return NextResponse.json({ conversaciones: [], total: 0, page, pageSize });
    }

    // Paso 2: total (Prisma cuando hay asesor, Firestore en general)
    let total = 0;
    if (asesorId) {
      total = await prisma.clientes.count({ where: { asesor_control_id: asesorId } });
    } else {
      const snap = await fs.collection('clientes').count().get();
      total = snap.data().count;
    }

    // Paso 3: obtener doc clientes en Firestore. Si hay asesor, filtramos por celular.
    let clientesDocs = [];
    if (asesorId) {
      const CHUNK = 30; // Firestore where-in tope
      for (let i = 0; i < celulares.length; i += CHUNK) {
        const chunk = celulares.slice(i, i + CHUNK);
        const snap = await fs.collection('clientes').where('celular', 'in', chunk).get();
        clientesDocs.push(...snap.docs);
      }
    } else {
      const snap = await fs.collection('clientes').limit(pageSize * page).get();
      clientesDocs = snap.docs.slice((page - 1) * pageSize, page * pageSize);
    }

    // Paso 4: por cada cliente, su última conversación con interacciones.
    const conversacionesAdaptadas = await Promise.all(
      clientesDocs.map(async (clienteDoc) => {
        const cliente = clienteDoc.data();
        const ultimaConv = await getUltimaConversacion(clienteDoc);
        if (!ultimaConv) return null;

        const tipo_control = tipoControlMap.get(cliente.celular) || 'desconocido';
        const interaccionesAdaptadas = (ultimaConv.interacciones || []).map((i) => ({
          _id: `int_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          fecha: i.fecha?.toISOString?.() ?? new Date(i.fecha).toISOString(),
          mensaje_cliente: i.mensaje_cliente || null,
          mensaje_chatbot: i.mensaje_chatbot || null,
        }));

        const ultimaFecha = ultimaConv.ultima_interaccion?.toDate?.() ?? new Date();

        return {
          conversacion_id: ultimaConv.conversacion_id,
          cliente: {
            nombre: cliente.nombre,
            apellido: cliente.apellido || '',
            celular: cliente.celular,
            estado: cliente.estado || 'desconocido',
          },
          ultima_interaccion: ultimaFecha.toISOString(),
          fecha_obj: ultimaFecha,
          mensajes_no_leidos: 0,
          estado_conversacion: ultimaConv.estado || 'activa',
          tipo_control,
          interacciones: interaccionesAdaptadas,
        };
      })
    );

    const resultado = conversacionesAdaptadas
      .filter((c) => c !== null)
      .sort((a, b) =>
        orderBy === 'por_vencer'
          ? a.fecha_obj - b.fecha_obj
          : b.fecha_obj - a.fecha_obj
      )
      .map(({ fecha_obj, ...rest }) => rest);

    return NextResponse.json({ conversaciones: resultado, total, page, pageSize });
  } catch (error) {
    console.error('❌ Error general:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
