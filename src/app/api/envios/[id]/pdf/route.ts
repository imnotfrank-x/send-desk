import { getCurrentUser } from "@/lib/auth";
import { buildShipmentPdf } from "@/lib/pdf";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentUser())) return Response.json({ error: "No autorizado" }, { status: 401 });
  const shipment = await prisma.shipment.findUnique({ where: { id: (await params).id }, include: { createdBy: { select: { name: true } }, parcels: { orderBy: { position: "asc" } } } });
  if (!shipment) return Response.json({ error: "Hoja no encontrada" }, { status: 404 });
  if (shipment.status !== "READY") return Response.json({ error: "Finaliza la jornada antes de generar el PDF." }, { status: 409 });
  const bytes = await buildShipmentPdf({ ...shipment, parcels: shipment.parcels.filter((parcel) => parcel.packageNumber && parcel.weight).map((parcel) => ({ ...parcel, packageNumber: parcel.packageNumber!, weight: parcel.weight! })) });
  const body = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  return new Response(body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${shipment.sheetNumber}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}

