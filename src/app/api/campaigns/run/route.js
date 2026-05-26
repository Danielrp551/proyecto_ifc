// Proxy server-side a Cloud Run /campaigns/run.
// El payload de campañas puede ser grande (filtros) pero NO incluye lista de clientes;
// el backend consulta MySQL después de recibirlo.

import { NextResponse } from 'next/server';

const CHATBOT_API_URL = process.env.CHATBOT_API_URL;
const CHATBOT_API_KEY = process.env.CHATBOT_API_KEY;

export async function POST(request) {
  if (!CHATBOT_API_URL || !CHATBOT_API_KEY) {
    return NextResponse.json(
      { message: 'Server misconfigured: CHATBOT_API_URL / CHATBOT_API_KEY no seteados' },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Body no es JSON válido' }, { status: 400 });
  }

  try {
    const res = await fetch(`${CHATBOT_API_URL}/campaigns/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': CHATBOT_API_KEY,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Proxy /campaigns/run error:', error);
    return NextResponse.json(
      { message: 'Error contactando el backend' },
      { status: 502 }
    );
  }
}
