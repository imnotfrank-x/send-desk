"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { shipmentSchema, type ActionState } from "@/lib/validations";

function newSheetNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = crypto.randomUUID().slice(0, 6).toUpperCase();
  return `HD-${date}-${suffix}`;
}

export async function createShipmentAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  let payload: unknown;
  try {
    payload = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return { error: "La hoja contiene datos inválidos." };
  }

  const parsed = shipmentSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Revisa los paquetes antes de guardar.",
    };
  }

  try {
    const shipment = await prisma.shipment.create({
      data: {
        sheetNumber: newSheetNumber(),
        status: "READY",
        createdById: user.id,
        parcels: {
          create: parsed.data.parcels.map((parcel, index) => ({ ...parcel, position: index + 1 })),
        },
      },
    });
    revalidatePath("/envios");
    revalidatePath("/dashboard");
    redirect(`/envios/${shipment.id}`);
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return { error: "No fue posible guardar la hoja. Verifica que los números de paquete no estén repetidos." };
  }
}

