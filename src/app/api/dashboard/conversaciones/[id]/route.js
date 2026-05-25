import prisma from '@/lib/db';
import { NextResponse } from 'next/server';
import { findClienteDocByCelular, listConversacionesConInteracciones } from '@/lib/firestore';

export async function GET(_request, { params }) {
  try {
    const { id } = await params;

    const cliente = await prisma.clientes.findUnique({
      where: { cliente_id: parseInt(id, 10) },
      select: { cliente_id: true, nombre: true, apellido: true, celular: true },
    });

    if (!cliente) {
      return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 404 });
    }

    const clienteDoc = await findClienteDocByCelular(cliente.celular);
    const conversaciones = clienteDoc
      ? await listConversacionesConInteracciones(clienteDoc)
      : [];

    return NextResponse.json({
      cliente: {
        nombreCompleto: `${cliente.nombre} ${cliente.apellido || ''}`.trim(),
        celular: cliente.celular,
      },
      conversaciones,
    });
  } catch (error) {
    console.error('Error al obtener conversaciones del cliente:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor al obtener las conversaciones' },
      { status: 500 }
    );
  }
}
