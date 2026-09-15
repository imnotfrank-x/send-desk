import { redirect } from "next/navigation";

export const metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  redirect("/login");
}
