import { NextResponse } from 'next/server';
import { findClienteDocByCelular, listConversacionesConInteracciones } from '@/lib/firestore';

export async function GET(_request, { params }) {
  try {
    const { phone } = await params;
    const clienteDoc = await findClienteDocByCelular(phone);
    if (!clienteDoc) {
      return NextResponse.json({ conversaciones: [] });
    }
    const conversaciones = await listConversacionesConInteracciones(clienteDoc);
    return NextResponse.json({ conversaciones });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Error fetching conversations' }, { status: 500 });
  }
}
