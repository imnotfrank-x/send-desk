import { redirect } from "next/navigation";

export const metadata = { title: "Nueva hoja" };

export default function NewShipmentPage() {
  redirect("/jornada");
}

