import { createHmac, timingSafeEqual } from "node:crypto";
import type { Role } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "senddesk_session";
const SESSION_SECONDS = 60 * 60 * 8;

type SessionPayload = {
  userId: string;
  role: Role;
  expiresAt: number;
};

function secret() {
  return process.env.AUTH_SECRET ?? "senddesk-demo-local-secret";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function createSessionToken(userId: string, role: Role) {
  const value = `${userId}.${role}.${Math.floor(Date.now() / 1000) + SESSION_SECONDS}`;
  return `${value}.${sign(value)}`;
}

export function verifySessionToken(token?: string): SessionPayload | null {
  if (!token) return null;
  const [userId, role, expires, signature] = token.split(".");
  if (!userId || !role || !expires || !signature) return null;
  if (role !== "ADMIN" && role !== "OPERADOR") return null;
  const value = `${userId}.${role}.${expires}`;
  const expected = sign(value);
  if (signature.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const expiresAt = Number(expires);
  if (!Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return null;
  return { userId, role, expiresAt };
}

export async function getCurrentUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = verifySessionToken(token);
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/jornada");
  return user;
}

