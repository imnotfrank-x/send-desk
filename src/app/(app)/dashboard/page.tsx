import Link from "next/link";
import { ArrowRight, PackagePlus, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Resumen" };

export default async function DashboardPage() {
  const user = await requireUser();
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={`Hola, ${user.name.split(" ")[0]}`} description="Elige una tarea para comenzar la operación del día." />
      <div className="grid gap-5 md:grid-cols-2">
        <Link href="/envios/nueva" className="group rounded-2xl bg-[#1769aa] p-7 text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><PackagePlus size={30} aria-hidden /><h2 className="mt-8 text-2xl font-bold">Capturar hoja de envío</h2><p className="mt-2 text-blue-100">Registra hasta seis paquetes en el formato digital.</p><span className="mt-6 flex items-center gap-2 font-semibold">Comenzar <ArrowRight size={18} className="transition group-hover:translate-x-1" aria-hidden /></span></Link>
        <Link href="/clientes" className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><UsersRound size={30} className="text-[#18a6b8]" aria-hidden /><h2 className="mt-8 text-2xl font-bold text-[#102a43]">Directorio de clientes</h2><p className="mt-2 text-slate-600">Consulta y reutiliza datos de remitentes y destinatarios.</p><span className="mt-6 flex items-center gap-2 font-semibold text-[#1769aa]">Abrir directorio <ArrowRight size={18} className="transition group-hover:translate-x-1" aria-hidden /></span></Link>
      </div>
    </div>
  );
}

