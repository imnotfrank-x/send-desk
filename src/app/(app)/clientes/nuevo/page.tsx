import { CustomerForm } from "@/components/customer-form";
import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Nuevo cliente" };

export default async function NewCustomerPage() {
  await requireAdmin();
  return <div className="mx-auto max-w-6xl"><PageHeader title="Nuevo cliente" description="Nombre y teléfono son obligatorios; código y dirección pueden completarse después." /><CustomerForm /></div>;
}

