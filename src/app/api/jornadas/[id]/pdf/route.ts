import { getCurrentUser } from "@/lib/auth";
import { buildWorkdayPdf, type ShipmentPdfData } from "@/lib/pdf";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentUser())) return Response.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const workday = await prisma.workday.findUnique({
    where: { id },
    include: { shipments: { orderBy: { sheetIndex: "asc" }, include: { createdBy: { select: { name: true } }, parcels: { orderBy: { position: "asc" } } } } },
  });
  if (!workday) return Response.json({ error: "Jornada no encontrada" }, { status: 404 });
  if (workday.status !== "FINALIZED") return Response.json({ error: "Finaliza la jornada antes de generar el PDF." }, { status: 409 });
  let bytes = workday.pdfData;
  if (!bytes) {
    const sheets: ShipmentPdfData[] = workday.shipments.map((sheet) => ({
      sheetNumber: sheet.sheetNumber,
      createdAt: sheet.createdAt,
      createdBy: sheet.createdBy,
      parcels: sheet.parcels.filter((parcel) => parcel.packageNumber && parcel.weight).map((parcel) => ({
        ...parcel,
        packageNumber: parcel.packageNumber!,
        weight: parcel.weight!,
      })),
    }));
    bytes = await buildWorkdayPdf(sheets);
    await prisma.workday.update({ where: { id }, data: { pdfGeneratedAt: new Date(), pdfData: bytes } });
  }
  const body = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const inline = new URL(request.url).searchParams.get("disposition") === "inline";
  const date = (workday.finalizedAt ?? workday.createdAt).toISOString().slice(0, 10);
  return new Response(body, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="jornada-${date}.pdf"`, "Cache-Control": "private, no-store" } });
}
