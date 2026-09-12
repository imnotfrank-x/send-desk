import { ShipmentForm } from "@/components/shipment-form";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Nueva hoja" };

export default function NewShipmentPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Nueva hoja de envío" description="Captura de uno a seis paquetes. Usa el directorio para completar remitentes y destinatarios." />
      <ShipmentForm />
    </div>
  );
}

