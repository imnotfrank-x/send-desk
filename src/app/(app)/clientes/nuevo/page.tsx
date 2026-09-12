import { CustomerForm } from "@/components/customer-form";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Nuevo cliente" };

export default function NewCustomerPage() {
  return <div className="mx-auto max-w-6xl"><PageHeader title="Nuevo cliente" description="Agrega un contacto para reutilizarlo en futuras hojas." /><CustomerForm /></div>;
}

