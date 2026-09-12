import { Boxes } from "lucide-react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Iniciar sesión" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <main className="min-h-screen bg-[#102a43] px-4 py-10 sm:grid sm:place-items-center">
      <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl sm:grid sm:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden min-h-[620px] overflow-hidden bg-[#1769aa] p-12 text-white sm:flex sm:flex-col sm:justify-between">
          <div className="absolute -right-24 -top-24 size-72 rounded-full border-[42px] border-white/10" />
          <div className="absolute -bottom-28 -left-24 size-80 rounded-full bg-[#18a6b8]/50" />
          <div className="relative flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-white/15"><Boxes size={24} aria-hidden /></span><span className="text-2xl font-extrabold">SendDesk</span></div>
          <div className="relative"><p className="max-w-md text-4xl font-extrabold leading-tight tracking-tight">De la hoja física al control digital.</p><p className="mt-5 max-w-sm text-lg leading-7 text-blue-100">Clientes, paquetes y hojas de envío en un solo lugar, listo para operar.</p></div>
          <p className="relative text-sm text-blue-100">MVP académico · Datos de demostración</p>
        </div>
        <div className="flex min-h-[620px] items-center p-6 sm:p-12">
          <div className="w-full">
            <div className="mb-8 flex items-center gap-3 sm:hidden"><span className="grid size-10 place-items-center rounded-xl bg-[#1769aa] text-white"><Boxes size={21} aria-hidden /></span><span className="text-xl font-extrabold text-[#102a43]">SendDesk</span></div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1769aa]">Acceso interno</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#102a43]">Bienvenido</h1>
            <p className="mb-8 mt-2 text-slate-600">Usa las credenciales de demostración para continuar.</p>
            <LoginForm />
            <div className="mt-7 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600"><strong>Demo:</strong> admin@senddesk.demo · Demo1234!</div>
          </div>
        </div>
      </section>
    </main>
  );
}

