import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { workdayDraftSchema } from "@/lib/validations";

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "No autorizado" }, { status: 401 });
  const parsed = workdayDraftSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Borrador inválido" }, { status: 400 });
  const { workdayId, sheetId, parcels } = parsed.data;
  const workday = await prisma.workday.findUnique({ where: { id: workdayId } });
  if (!workday || workday.status !== "ACTIVE") return Response.json({ error: "La jornada no está disponible para edición." }, { status: 409 });
  const sheet = await prisma.shipment.findFirst({ where: { id: sheetId, workdayId } });
  if (!sheet) return Response.json({ error: "Hoja no encontrada." }, { status: 404 });
  try {
    await prisma.$transaction([
      prisma.parcel.deleteMany({ where: { shipmentId: sheetId } }),
      ...parcels.map((parcel) => prisma.parcel.create({ data: {
        shipmentId: sheetId,
        position: parcel.position,
        span: parcel.span,
        packageNumber: parcel.packageNumber || null,
        senderName: parcel.senderName,
        senderPhone: parcel.senderPhone,
        senderAddress: parcel.senderAddress,
        recipientName: parcel.recipientName,
        recipientPhone: parcel.recipientPhone,
        recipientAddress: parcel.recipientAddress,
        weight: parcel.weight || null,
        description: parcel.description,
        packageCount: parcel.packageCount,
      } })),
      prisma.workday.update({ where: { id: workdayId }, data: { lastEditorId: user.id, lastActivityAt: new Date() } }),
    ]);
  } catch {
    return Response.json({ error: "No fue posible guardar. Revisa números de paquete repetidos." }, { status: 409 });
  }
  return Response.json({ savedAt: new Date().toISOString() });
}
