import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request) {
  try {
    const { fechaInicio = "", fechaFin = "" } = Object.fromEntries(new URL(request.url).searchParams);

    if (!fechaInicio || !fechaFin) {
      return NextResponse.json(
        { message: "Debe proporcionar una fecha de inicio y una fecha de fin." },
        { status: 400 }
      );
    }

    const fechaFilter = {
      fecha_creacion: {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      },
    };

    const estados = ["promesa_pago_cancelada","promesas de pago", "seguimiento", "interesado", "activo", "cita agendada", "no interesado","nuevo"];
    const estadosData = {};

    for (const estado of estados) {
      // Total de leads en este estado
      const totalEstado = await prisma.clientes.count({
        where: {
          ...fechaFilter,
          estado,
        },
      });

      // Porcentaje de clientes contactados (Converge)
      const contactados = await prisma.clientes.count({
        where: {
          ...fechaFilter,
          estado,
          gestor: {
            not: "",
          },
        },
      });
      const converge = totalEstado > 0 ? (contactados / totalEstado) * 100 : 0;

      // Promedio de recencia (tiempo entre creación y contacto)
      const recencia = await prisma.$queryRaw`
        SELECT AVG(DATEDIFF(fecha_ultima_interaccion, fecha_creacion)) AS promedio_recencia
        FROM clientes
        WHERE estado = ${estado} AND fecha_creacion >= ${fechaInicio} AND fecha_creacion <= ${fechaFin}
      `;
      const promedioRecencia = recencia[0]?.promedio_recencia || 0;

      // Número de contactos por cliente (Intensity)
      const intensity = await prisma.$queryRaw`
        SELECT AVG(contactos) AS promedio_contactos
        FROM (
          SELECT COUNT(*) AS contactos
          FROM acciones_comerciales
          WHERE cliente_id IN (
            SELECT cliente_id
            FROM clientes
            WHERE estado = ${estado} AND fecha_creacion >= ${fechaInicio} AND fecha_creacion <= ${fechaFin}
          )
          GROUP BY cliente_id
        ) AS subquery
      `;
      const promedioContactos = intensity[0]?.promedio_contactos || 0;

      // Acciones por estado (extraídas del campo `acciones` en clientes)
      const acciones = await prisma.clientes.groupBy({
        by: ['acciones'],
        _count: {
          cliente_id: true,
        },
        where: {
          ...fechaFilter,
          estado,
          acciones: {
            not: "",
          },
        },
      });

      const accionesData = acciones.reduce((acc, item) => {
        acc[item.acciones] = item._count.cliente_id;
        return acc;
      }, {});

      // Construcción del objeto de datos para este estado
      estadosData[estado] = {
        total: totalEstado,
        converge: converge.toFixed(2),
        recencia: promedioRecencia.toFixed(2),
        intensity: promedioContactos.toFixed(2),
        accion: accionesData, // Datos de acciones por estado
      };
    }

    // Respuesta completa
    return NextResponse.json({
      totalLeads: await prisma.clientes.count({ where: {...fechaFilter,estado:{in:estados,},}}),
      estados: estadosData,
    });
  } catch (error) {
    console.error("Error al obtener datos de leads:", error);
    return NextResponse.json(
      { message: "Error interno del servidor al obtener datos de leads." },
      { status: 500 }
    );
  }
}
