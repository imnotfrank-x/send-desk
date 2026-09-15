"use server";

import { Prisma, type Role } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth";
import { loginSchema, registerSchema, type ActionState } from "@/lib/validations";

export async function loginAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || !(await compare(parsed.data.password, user.passwordHash))) {
    return { error: "Correo o contraseña incorrectos." };
  }

  await startSession(user);
  redirect(user.role === "ADMIN" ? "/dashboard" : "/jornada");
}

export async function registerAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  let user: { id: string; role: Role };
  try {
    user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash: await hash(parsed.data.password, 12),
        role: "OPERADOR",
      },
      select: { id: true, role: true },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { fieldErrors: { email: ["Este correo ya tiene una cuenta. Inicia sesión con ella."] } };
    }
    return { error: "No fue posible crear tu cuenta. Intenta de nuevo." };
  }

  await startSession(user);
  redirect("/jornada");
}

async function startSession(user: { id: string; role: Role }) {
  (await cookies()).set(SESSION_COOKIE, createSessionToken(user.id, user.role), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
}

export async function logoutAction() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}

