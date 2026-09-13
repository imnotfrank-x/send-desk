import { redirect } from "next/navigation";
import { AuthPanel } from "@/components/auth-panel";
import { LoginForm } from "@/components/login-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Iniciar sesión" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <AuthPanel mode="login">
      <LoginForm />
      <div className="mt-7 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600"><strong>Demo:</strong> admin@senddesk.demo · Demo1234!</div>
    </AuthPanel>
  );
}
