import { notFound } from "next/navigation";
import { CustomerForm } from "@/components/customer-form";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Editar cliente" };

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const customer = await prisma.customer.findUnique({ where: { id: (await params).id } });
  if (!customer) notFound();
  return <div className="mx-auto max-w-6xl"><PageHeader title="Editar cliente" description="Actualiza los datos del directorio." /><CustomerForm customer={customer} /></div>;
}
