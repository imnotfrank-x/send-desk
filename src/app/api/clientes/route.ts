import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  if (!(await getCurrentUser())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  const relatedTo = new URL(request.url).searchParams.get("relatedTo")?.trim();
  if (q.length < 2 && relatedTo) {
    const relations = await prisma.customerRelation.findMany({ where: { senderId: relatedTo }, orderBy: [{ usageCount: "desc" }, { lastUsedAt: "desc" }], take: 8, select: { recipient: { select: { id: true, code: true, name: true, phone: true, address: true } } } });
    return NextResponse.json(relations.map((relation) => relation.recipient));
  }
  if (q.length < 2) return NextResponse.json([]);
  const customers = await prisma.customer.findMany({ where: { OR: [{ name: { contains: q } }, { code: { contains: q } }, { phone: { contains: q } }] }, orderBy: { name: "asc" }, take: 8, select: { id: true, code: true, name: true, phone: true, address: true } });
  return NextResponse.json(customers);
}
