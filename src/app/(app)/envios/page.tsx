import Link from "next/link";
import { Eye, PackagePlus, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Hojas de envío" };

export default async function ShipmentsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = (await searchParams).q?.trim() ?? "";
  const shipments = await prisma.shipment.findMany({
    where: q ? { OR: [{ sheetNumber: { contains: q } }, { parcels: { some: { packageNumber: { contains: q } } } }] } : undefined,
    include: { createdBy: { select: { name: true } }, parcels: { select: { weight: true, packageCount: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Hojas de envío" description="Consulta las hojas capturadas y sus paquetes." action={<Link href="/envios/nueva" className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1769aa] px-5 font-semibold text-white hover:bg-[#12578f]"><PackagePlus size={18} aria-hidden /> Nueva hoja</Link>} />
      <form className="mb-5 flex max-w-xl items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 shadow-sm"><Search size={18} className="text-slate-400" aria-hidden /><input name="q" defaultValue={q} placeholder="Buscar hoja o número de paquete" className="h-12 min-w-0 flex-1 border-0 bg-transparent outline-none" /></form>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {shipments.length === 0 ? <div className="px-6 py-16 text-center"><p className="font-semibold text-slate-700">No hay hojas para mostrar.</p><p className="mt-1 text-sm text-slate-500">Crea una hoja o cambia el término de búsqueda.</p></div> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Folio</th><th className="px-5 py-4">Captura</th><th className="px-5 py-4">Paquetes</th><th className="px-5 py-4">Peso total</th><th className="px-5 py-4 text-right">Detalle</th></tr></thead><tbody className="divide-y divide-slate-100">
            {shipments.map((shipment) => <tr key={shipment.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><p className="font-bold text-[#102a43]">{shipment.sheetNumber}</p><span className="mt-1 inline-flex rounded-full bg-cyan-50 px-2 py-1 text-xs font-bold text-cyan-700">{shipment.status === "READY" ? "Finalizada" : "Borrador"}</span></td><td className="px-5 py-4"><p className="text-sm text-slate-700">{new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(shipment.createdAt)}</p><p className="text-xs text-slate-500">{shipment.createdBy.name}</p></td><td className="px-5 py-4 font-semibold text-slate-700">{shipment.parcels.reduce((total, parcel) => total + parcel.packageCount, 0)}</td><td className="px-5 py-4 text-slate-600">{shipment.parcels.reduce((total, parcel) => total + (parcel.weight ?? 0), 0).toFixed(2)} kg</td><td className="px-5 py-4 text-right"><Link href={`/envios/${shipment.id}`} className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100" aria-label={`Ver ${shipment.sheetNumber}`}><Eye size={17} aria-hidden /></Link></td></tr>)}
          </tbody></table></div>
        )}
      </div>
    </div>
  );
}

