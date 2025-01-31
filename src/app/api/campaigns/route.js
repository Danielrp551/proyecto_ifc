import { NextResponse } from 'next/server';
import prisma from "@/lib/db";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page')) || 1;
  const pageSize = parseInt(searchParams.get('pageSize')) || 10;
  const type = searchParams.get('tipo');
  const skip = (page - 1) * pageSize;

  try {
    const whereClause = type ? { tipo: type } : {};

    const [campaigns, totalCount] = await Promise.all([
      prisma.campa_as.findMany({
        skip,
        take: pageSize,
        where: whereClause,
        orderBy: { fecha_creacion: 'desc' },
      }),
      prisma.campa_as.count({where: whereClause}),
    ]);

    return NextResponse.json({
      campaigns,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      totalCount: totalCount,
    });
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { nombre_campa_a, descripcion, estado_campa_a, mensaje_cliente, fecha_inicio, fecha_fin } = data;

    if (!nombre_campa_a || !mensaje_cliente) {
      return NextResponse.json({ error: 'Name and client message are required' }, { status: 400 });
    }

    const newCampaign = await prisma.campa_as.create({
      data: {
        nombre_campa_a,
        descripcion,
        estado_campa_a,
        mensaje_cliente,
        fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : null,
        fecha_fin: fecha_fin ? new Date(fecha_fin) : null,
      },
    });

    return NextResponse.json(newCampaign, { status: 201 });
  } catch (error) {
    console.error('Failed to create campaign:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}

export async function PUT(request) {
    const { searchParams } = new URL(request.url);
    const campa_a_id = searchParams.get('id'); // Extraer el ID desde la URL
  
    if (!campa_a_id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }
  
    try {
      const data = await request.json();
      const { nombre_campa_a, descripcion, estado_campa_a, mensaje_cliente, fecha_inicio, fecha_fin } = data;
  
      const updatedCampaign = await prisma.campa_as.update({
        where: { campa_a_id: parseInt(campa_a_id) },
        data: {
          nombre_campa_a,
          descripcion,
          estado_campa_a,
          mensaje_cliente,
          fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : null,
          fecha_fin: fecha_fin ? new Date(fecha_fin) : null,
        },
      });
  
      return NextResponse.json(updatedCampaign, { status: 200 });
    } catch (error) {
      console.error('Failed to update campaign:', error);
      return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
    }
  }

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
  }

  try {
    await prisma.campa_as.delete({
      where: { campa_a_id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Failed to delete campaign:', error);
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
  }
}

