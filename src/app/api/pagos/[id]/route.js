import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  const { id } = params; // ID del pago
  const body = await request.json();
  const { fecha_pago, monto, metodo_pago, estado_pago, notas, asesorId } = body;

  // Validación de datos necesarios
  if (!notas || !asesorId) {
    return NextResponse.json(
      { error: "Las notas y el ID del asesor son obligatorios." },
      { status: 400 }
    );
  }

  try {
    // Actualizar el pago en la base de datos
    const updatedPago = await prisma.pagos.update({
      where: { pago_id: parseInt(id, 10) },
      data: {
        fecha_pago: new Date(fecha_pago),
        monto: parseFloat(monto),
        metodo_pago,
        estado_pago,
      },
    });

    // Registrar la acción comercial
    await prisma.acciones_comerciales.create({
      data: {
        pago_id: updatedPago.pago_id,
        cliente_id: updatedPago.cliente_id,
        asesor_id: parseInt(asesorId, 10),
        notas,
      },
    });

    return NextResponse.json({ message: "Pago actualizado exitosamente." });
  } catch (error) {
    console.error("Error al actualizar el pago:", error);
    return NextResponse.json(
      { error: "Error al actualizar el pago." },
      { status: 500 }
    );
  }
}
