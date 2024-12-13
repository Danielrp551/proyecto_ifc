import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
  const url = new URL(request.url);
  const clienteIds = url.searchParams.get("cliente_ids");
  const page = parseInt(url.searchParams.get("page"), 10) || 1;
  const pageSize = parseInt(url.searchParams.get("pageSize"), 10) || 10;
  const estado = url.searchParams.get("estado") || null;
  const bound = url.searchParams.get("bound") || null;
  const searchname = url.searchParams.get("search") || null;
  
  const estados = estado? estado.split(',') : ["contactado","promesas de pago", "seguimiento", "interesado", "activo", "cita agendada", "no interesado","pendiente de contacto","nuevo"];
  const bound_filter = bound === "inbound"? true : bound === "outbound"? false : null;

  if (clienteIds) {
    const ids = clienteIds.split(",").map((id) => parseInt(id, 10));

    if (ids.length === 0) {
      return NextResponse.json({ citas: [], pagos: [] });
    }

    const [citas, pagos] = await Promise.all([
        prisma.citas.findMany({
          where: { cliente_id: { in: ids }},
        }),
        prisma.pagos.findMany({
          where: { cliente_id: { in: ids } },
        }),
      ]);

    /*
    const [citas, pagos] = await Promise.all([
      prisma.citas.findMany({
        where: { cliente_id: { in: ids } },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.pagos.findMany({
        where: { cliente_id: { in: ids } },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    */

    return NextResponse.json({ citas, pagos });
  }

  // Paginación general para clientes
  const totalClientes = await prisma.clientes.count();
  const clientes = await prisma.clientes.findMany({
    where: { estado: { in: estados }, 
    ...(bound_filter !== null && { bound: bound_filter }),
    ...(searchname && { OR: [{ nombre: { contains: searchname } }, { apellido: { contains: searchname } }] }),
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const clienteIdsPaginados = clientes.map((cliente) => cliente.cliente_id);
  /*
  const citas = await prisma.citas.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const pagos = await prisma.pagos.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
  */

  const [citas, pagos] = await Promise.all([
    prisma.citas.findMany({
      where: { cliente_id: { in: clienteIdsPaginados } },
    }),
    prisma.pagos.findMany({
      where: { cliente_id: { in: clienteIdsPaginados } },
    }),
  ]);

  return NextResponse.json({
    clientes,
    citas,
    pagos,
    totalClientes, // Total de clientes (para calcular la paginación)
  });
}
