"use server";

import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { employeeSchema, type ActionState } from "@/lib/validations";

export async function createEmployeeAction(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = employeeSchema.safeParse({ name: formData.get("name"), email: formData.get("email"), password: formData.get("password"), role: formData.get("role") || "OPERADOR" });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
  try {
    await prisma.user.create({ data: { name: parsed.data.name, email: parsed.data.email, role: parsed.data.role, passwordHash: await hash(parsed.data.password, 12) } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { error: "Ya existe un empleado con ese correo." };
    return { error: "No fue posible crear el empleado." };
  }
  revalidatePath("/empleados");
  return { success: "Empleado creado correctamente." };
}

export async function changeEmployeePasswordAction(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");
  const parsed = employeeSchema.shape.password.safeParse(password);
  if (!id || !parsed.success) return { error: parsed.success ? "Empleado inválido." : parsed.error.issues[0]?.message };
  await prisma.user.update({ where: { id }, data: { passwordHash: await hash(parsed.data, 12) } });
  return { success: "Contraseña actualizada." };
}

export async function deleteEmployeeAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id || id === admin.id) return;
  const hasHistory = await prisma.user.findUnique({ where: { id }, select: { _count: { select: { shipments: true, workdays: true } } } });
  if (!hasHistory || hasHistory._count.shipments || hasHistory._count.workdays) return;
  await prisma.user.delete({ where: { id } });
  revalidatePath("/empleados");
}
