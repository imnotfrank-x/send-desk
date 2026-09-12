"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/auth";
import { customerSchema, type ActionState } from "@/lib/validations";

function values(formData: FormData) {
  return {
    id: String(formData.get("id") ?? "") || undefined,
    code: formData.get("code"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    notes: String(formData.get("notes") ?? "") || undefined,
  };
}

function prismaError(error: unknown): ActionState {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return { error: "Ya existe un cliente con ese código." };
  }
  return { error: "No fue posible guardar el cliente. Intenta de nuevo." };
}

export async function saveCustomerAction(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const parsed = customerSchema.safeParse(values(formData));
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const { id, ...data } = parsed.data;
  try {
    if (id) await prisma.customer.update({ where: { id }, data });
    else await prisma.customer.create({ data });
  } catch (error) {
    return prismaError(error);
  }

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function deleteCustomerAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.customer.delete({ where: { id } });
  revalidatePath("/clientes");
}

