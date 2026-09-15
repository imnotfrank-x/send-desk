import Link from "next/link";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { deleteCustomerAction } from "@/app/actions/customers";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ConfirmationButton } from "@/components/confirmation-button";

export const metadata = { title: "Clientes" };

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; estado?: string }> }) {
  const user = await requireUser();
  const query = await searchParams;
  const q = query.q?.trim() ?? "";
  const inactiveSince = new Date();
  inactiveSince.setMonth(inactiveSince.getMonth() - 6);
  const inactive = user.role === "ADMIN" && query.estado === "inactivos";
  const customers = await prisma.customer.findMany({ where: { AND: [q ? { OR: [{ name: { contains: q } }, { code: { contains: q } }, { phone: { contains: q } }] } : {}, inactive ? { OR: [{ lastShipmentAt: null }, { lastShipmentAt: { lt: inactiveSince } }] } : {}] }, orderBy: { name: "asc" } });
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Clientes" description="Directorio reutilizable para acelerar la captura de paquetes." action={user.role === "ADMIN" ? <Link href="/clientes/nuevo" className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1769aa] px-5 font-semibold text-white hover:bg-[#12578f]"><Plus size={18} aria-hidden /> Nuevo cliente</Link> : undefined} />
      {user.role === "ADMIN" && <div className="mb-4 flex gap-2"><Link href="/clientes" className={`rounded-lg px-3 py-2 text-sm font-bold ${!inactive ? "bg-[#102a43] text-white" : "bg-white text-slate-600"}`}>Todos</Link><Link href="/clientes?estado=inactivos" className={`rounded-lg px-3 py-2 text-sm font-bold ${inactive ? "bg-[#102a43] text-white" : "bg-white text-slate-600"}`}>Inactivos · 6 meses</Link></div>}
      <form className="mb-5 flex max-w-xl items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 shadow-sm"><Search size={18} className="text-slate-400" aria-hidden /><input name="q" defaultValue={q} placeholder="Buscar por nombre, código o teléfono" className="h-12 min-w-0 flex-1 border-0 bg-transparent outline-none" /></form>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {customers.length === 0 ? <div className="px-6 py-16 text-center"><p className="font-semibold text-slate-700">No encontramos clientes.</p><p className="mt-1 text-sm text-slate-500">Prueba otra búsqueda o crea el primer registro.</p></div> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Cliente</th><th className="px-5 py-4">Teléfono</th><th className="px-5 py-4">Dirección</th><th className="px-5 py-4 text-right">Acciones</th></tr></thead><tbody className="divide-y divide-slate-100">
            {customers.map((customer) => <tr key={customer.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><p className="font-semibold text-slate-800">{customer.name}</p><p className="text-sm text-slate-500">{customer.code}</p></td><td className="px-5 py-4 text-slate-600">{customer.phone}</td><td className="max-w-sm px-5 py-4 text-sm text-slate-600">{customer.address}</td><td className="px-5 py-4"><div className="flex justify-end gap-2">{user.role === "ADMIN" && <><Link href={`/clientes/${customer.id}/editar`} className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100" aria-label={`Editar ${customer.name}`}><Pencil size={16} aria-hidden /></Link><form action={deleteCustomerAction}><input type="hidden" name="id" value={customer.id} /><ConfirmationButton message={`¿Eliminar ${customer.name} y sus relaciones del Directorio? La información histórica de las hojas no cambiará.`} className="grid size-9 place-items-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50" ariaLabel={`Eliminar ${customer.name}`}><Trash2 size={16} aria-hidden /></ConfirmationButton></form></>}</div></td></tr>)}
          </tbody></table></div>
        )}
      </div>
    </div>
  );
}

