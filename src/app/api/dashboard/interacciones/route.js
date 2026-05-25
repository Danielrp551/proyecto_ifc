import { NextResponse } from 'next/server';
import { countInteraccionesEnRango } from '@/lib/firestore';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const fechaInicio = url.searchParams.get('fechaInicio');
    const fechaFin = url.searchParams.get('fechaFin');

    if (!fechaInicio || !fechaFin) {
      return NextResponse.json({ message: 'Debe proporcionar fechas válidas' }, { status: 400 });
    }

    const totalInteracciones = await countInteraccionesEnRango(
      new Date(fechaInicio),
      new Date(fechaFin)
    );

    return NextResponse.json({ totalInteracciones, clientes: [] });
  } catch (error) {
    console.error('Error al obtener interacciones:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor al obtener interacciones' },
      { status: 500 }
    );
  }
}
