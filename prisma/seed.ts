import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("Demo1234!", 10);

  await prisma.user.upsert({
    where: { email: "admin@senddesk.demo" },
    update: {},
    create: {
      name: "Administración Demo",
      email: "admin@senddesk.demo",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "operador@senddesk.demo" },
    update: {},
    create: {
      name: "Operador Demo",
      email: "operador@senddesk.demo",
      passwordHash,
      role: Role.OPERADOR,
    },
  });

  const customers = [
    {
      code: "CLI-001",
      name: "Comercial Demo Norte",
      phone: "555 010 1001",
      address: "Av. Universidad 120, Centro, Ciudad Demo",
      notes: "Cliente ficticio para demostración.",
    },
    {
      code: "CLI-002",
      name: "Taller Muestra Sur",
      phone: "555 010 2002",
      address: "Calle Reforma 45, Col. Jardines, Ciudad Demo",
      notes: "Recibe de lunes a viernes.",
    },
    {
      code: "CLI-003",
      name: "Papelería Académica",
      phone: "555 010 3003",
      address: "Circuito Escolar 18, Col. Universidad, Ciudad Demo",
      notes: null,
    },
  ];

  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { code: customer.code },
      update: customer,
      create: customer,
    });
  }

  const admin = await prisma.user.findUniqueOrThrow({ where: { email: "admin@senddesk.demo" } });
  await prisma.shipment.upsert({
    where: { sheetNumber: "HD-DEMO-001" },
    update: {},
    create: {
      sheetNumber: "HD-DEMO-001",
      status: "READY",
      createdById: admin.id,
      parcels: {
        create: [
          {
            position: 1,
            packageNumber: "PKG-DEMO-1001",
            senderName: "Comercial Demo Norte",
            senderPhone: "555 010 1001",
            senderAddress: "Av. Universidad 120, Centro, Ciudad Demo",
            recipientName: "Taller Muestra Sur",
            recipientPhone: "555 010 2002",
            recipientAddress: "Calle Reforma 45, Col. Jardines, Ciudad Demo",
            weight: 3.25,
            description: "Material de muestra",
          },
          {
            position: 2,
            packageNumber: "PKG-DEMO-1002",
            senderName: "Papelería Académica",
            senderPhone: "555 010 3003",
            senderAddress: "Circuito Escolar 18, Col. Universidad, Ciudad Demo",
            recipientName: "Comercial Demo Norte",
            recipientPhone: "555 010 1001",
            recipientAddress: "Av. Universidad 120, Centro, Ciudad Demo",
            weight: 1.5,
            description: "Documentos ficticios",
          },
        ],
      },
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

