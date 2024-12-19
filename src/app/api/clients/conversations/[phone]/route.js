import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request, { params }) {
  try {
    const { phone } = params;
    const mongoClient = await clientPromise;
    const db = mongoClient.db(process.env.MONGODB_DB);

    const conversations = await db.collection('clientes').findOne(
      { celular: phone },
      { projection: { conversaciones: 1 } }
    );

    if (!conversations) {
      return NextResponse.json({ conversations: [] });
    }

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Error fetching conversations' }, { status: 500 });
  }
}

