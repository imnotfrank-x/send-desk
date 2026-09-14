import { redirect } from "next/navigation";
import { AuthPanel } from "@/components/auth-panel";
import { RegisterForm } from "@/components/register-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Crear cuenta" };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return <AuthPanel mode="register"><RegisterForm /></AuthPanel>;
}
