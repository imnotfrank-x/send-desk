import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { buildShipmentPdf } from "../src/lib/pdf";

const prisma = new PrismaClient();

async function main() {
  const shipment = await prisma.shipment.findUnique({ where: { sheetNumber: "HD-DEMO-001" }, include: { createdBy: { select: { name: true } }, parcels: { orderBy: { position: "asc" } } } });
  if (!shipment) throw new Error("Ejecuta npm run db:setup antes de generar el PDF de muestra.");
  const outputDirectory = path.join(process.cwd(), "output", "pdf");
  await mkdir(outputDirectory, { recursive: true });
  const outputPath = path.join(outputDirectory, "senddesk-hoja-demo.pdf");
  await writeFile(outputPath, await buildShipmentPdf({ ...shipment, parcels: shipment.parcels.filter((parcel) => parcel.packageNumber && parcel.weight).map((parcel) => ({ ...parcel, packageNumber: parcel.packageNumber!, weight: parcel.weight! })) }));
  console.log(outputPath);
}

main().then(() => prisma.$disconnect()).catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); });

