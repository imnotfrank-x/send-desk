import { createHmac } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const baseUrl = process.env.SENDDESK_URL ?? "http://localhost:3000";

async function main() {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: "admin@senddesk.demo" } });
  const expires = Math.floor(Date.now() / 1000) + 300;
  const value = `${user.id}.${user.role}.${expires}`;
  const signature = createHmac("sha256", process.env.AUTH_SECRET ?? "senddesk-mvp-academico-local").update(value).digest("hex");
  const cookie = `senddesk_session=${value}.${signature}`;

  const login = await fetch(`${baseUrl}/login`);
  if (!login.ok) throw new Error(`Login respondió ${login.status}`);

  const customers = await fetch(`${baseUrl}/api/clientes?q=Demo`, { headers: { cookie } });
  if (!customers.ok || !Array.isArray(await customers.json())) throw new Error("Falló la consulta autenticada de clientes.");

  const shipment = await prisma.shipment.findUniqueOrThrow({ where: { sheetNumber: "HD-DEMO-001" } });
  const pdf = await fetch(`${baseUrl}/api/envios/${shipment.id}/pdf`, { headers: { cookie } });
  if (!pdf.ok || pdf.headers.get("content-type") !== "application/pdf" || (await pdf.arrayBuffer()).byteLength < 1000) {
    throw new Error("Falló la descarga autenticada del PDF.");
  }
  console.log("Smoke test correcto: login, clientes y PDF.");
}

main().then(() => prisma.$disconnect()).catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); });

