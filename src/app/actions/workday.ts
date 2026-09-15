"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const collaboratorWindowMs = 2 * 60 * 1000;

function sheetNumber(index: number) {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `HD-${date}-${crypto.randomUUID().slice(0, 5).toUpperCase()}-${index}`;
}

function refresh() {
  revalidatePath("/jornada");
  revalidatePath("/dashboard");
  revalidatePath("/envios");
}

export async function startWorkdayAction() {
  const user = await requireUser();
  const existing = await prisma.workday.findFirst({ where: { status: { in: ["ACTIVE", "PAUSED"] } }, orderBy: { createdAt: "desc" } });
  if (existing) redirect("/jornada");
  await prisma.workday.create({
    data: {
      createdById: user.id,
      lastEditorId: user.id,
      lastActivityAt: new Date(),
      shipments: { create: { sheetNumber: sheetNumber(1), sheetIndex: 1, status: "DRAFT", createdById: user.id } },
    },
  });
  refresh();
  redirect("/jornada");
}

export async function addSheetAction() {
  const user = await requireUser();
  const workday = await prisma.workday.findFirst({
    where: { status: "ACTIVE" },
    include: { shipments: { orderBy: { sheetIndex: "desc" }, take: 1 } },
  });
  if (!workday) return;
  const index = (workday.shipments[0]?.sheetIndex ?? 0) + 1;
  await prisma.$transaction([
    prisma.shipment.create({ data: { sheetNumber: sheetNumber(index), sheetIndex: index, status: "DRAFT", createdById: user.id, workdayId: workday.id } }),
    prisma.workday.update({ where: { id: workday.id }, data: { lastEditorId: user.id, lastActivityAt: new Date() } }),
  ]);
  refresh();
}

async function currentWithCollaborator(workdayId: string, userId: string) {
  const workday = await prisma.workday.findUnique({ where: { id: workdayId }, include: { lastEditor: { select: { name: true } } } });
  if (!workday) throw new Error("Jornada no encontrada.");
  const collaborator = workday.lastEditorId !== userId && workday.lastActivityAt && Date.now() - workday.lastActivityAt.getTime() < collaboratorWindowMs;
  return { workday, collaborator: collaborator ? workday.lastEditor?.name ?? "otro empleado" : null };
}

export async function changeWorkdayStatusAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const intent = String(formData.get("intent") ?? "");
  const force = formData.get("force") === "true";
  const { workday, collaborator } = await currentWithCollaborator(id, user.id);
  if ((intent === "pause" || intent === "finalize") && collaborator && !force) redirect(`/jornada?confirm=${intent}&colaborador=${encodeURIComponent(collaborator)}`);

  if (intent === "pause" && workday.status === "ACTIVE") {
    await prisma.workday.update({ where: { id }, data: { status: "PAUSED", pausedAt: new Date() } });
  } else if (intent === "continue" && workday.status === "PAUSED") {
    await prisma.workday.update({ where: { id }, data: { status: "ACTIVE", pausedAt: null, lastEditorId: user.id, lastActivityAt: new Date() } });
  } else if (intent === "finalize" && workday.status !== "FINALIZED") {
    const parcels = await prisma.parcel.findMany({ where: { shipment: { workdayId: id } } });
    const invalid = parcels.some((parcel) => !parcel.packageNumber || !parcel.senderName || !parcel.senderPhone || !parcel.senderAddress || !parcel.recipientName || !parcel.recipientPhone || !parcel.recipientAddress || !parcel.weight || parcel.weight <= 0 || !parcel.description || parcel.packageCount <= 0);
    if (invalid) redirect("/jornada?error=pendientes");
    if (workday.lastActivityAt && (!workday.directorySavedAt || workday.directorySavedAt < workday.lastActivityAt)) redirect("/jornada?error=directorio");
    const finalizedAt = new Date();
    const customerNames = [...new Set(parcels.flatMap((parcel) => [parcel.senderName, parcel.recipientName]).filter(Boolean))];
    await prisma.$transaction([
      prisma.workday.update({ where: { id }, data: { status: "FINALIZED", finalizedAt } }),
      prisma.shipment.updateMany({ where: { workdayId: id }, data: { status: "READY" } }),
      ...(customerNames.length ? [prisma.customer.updateMany({ where: { OR: customerNames.map((name) => ({ name: { equals: name, mode: "insensitive" as const } })) }, data: { lastShipmentAt: finalizedAt } })] : []),
    ]);
  }
  refresh();
  redirect("/jornada");
}

type Contact = { name: string; phone: string; address: string };

async function upsertCustomer(tx: Prisma.TransactionClient, contact: Contact) {
  const existing = await tx.customer.findFirst({ where: { name: { equals: contact.name, mode: "insensitive" } } });
  if (existing) return tx.customer.update({ where: { id: existing.id }, data: { phone: contact.phone, address: contact.address } });
  return tx.customer.create({ data: { code: `AUTO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, ...contact } });
}

export async function saveDirectoryAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const workday = await prisma.workday.findUnique({ where: { id }, include: { shipments: { include: { parcels: true } } } });
  if (!workday || workday.status === "FINALIZED") return;
  const at = new Date();
  await prisma.$transaction(async (tx) => {
    for (const parcel of workday.shipments.flatMap((sheet) => sheet.parcels)) {
      if (!parcel.senderName || !parcel.senderPhone || !parcel.senderAddress || !parcel.recipientName || !parcel.recipientPhone || !parcel.recipientAddress) continue;
      const sender = await upsertCustomer(tx, { name: parcel.senderName, phone: parcel.senderPhone, address: parcel.senderAddress });
      const recipient = await upsertCustomer(tx, { name: parcel.recipientName, phone: parcel.recipientPhone, address: parcel.recipientAddress });
      if (sender.id !== recipient.id) {
        const key = { senderId: sender.id, recipientId: recipient.id };
        const relation = await tx.customerRelation.findUnique({ where: { senderId_recipientId: key } });
        if (!relation) await tx.customerRelation.create({ data: { ...key, lastUsedAt: at } });
        else if (relation.lastUsedAt < workday.startedAt) await tx.customerRelation.update({ where: { id: relation.id }, data: { usageCount: { increment: 1 }, lastUsedAt: at } });
      }
    }
    await tx.workday.update({ where: { id }, data: { directorySavedAt: at } });
  });
  revalidatePath("/clientes");
  refresh();
}

export async function clearWorkdayAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const workday = await prisma.workday.findUnique({ where: { id } });
  if (!workday || workday.status !== "FINALIZED" || !workday.pdfGeneratedAt || !workday.pdfData || (workday.lastActivityAt && (!workday.directorySavedAt || workday.directorySavedAt < workday.lastActivityAt))) redirect("/jornada?error=limpiar");
  await prisma.$transaction(async (tx) => {
    await tx.workday.create({ data: { createdById: user.id, lastEditorId: user.id, lastActivityAt: new Date(), shipments: { create: { sheetNumber: sheetNumber(1), sheetIndex: 1, status: "DRAFT", createdById: user.id } } } });
  });
  refresh();
  redirect("/jornada");
}
