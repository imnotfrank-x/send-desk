import Link from "next/link";
import { ArrowRight, Boxes, PackageCheck, PackagePlus, Scale, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Resumen" };

export default async function DashboardPage() {
  const user = await requireUser();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const [customerCount, shipmentCount, parcelSummary, todayCount, recent, weekly] = await Promise.all([
    prisma.customer.count(),
    prisma.shipment.count(),
    prisma.parcel.aggregate({ _count: { _all: true }, _sum: { weight: true } }),
    prisma.shipment.count({ where: { createdAt: { gte: today } } }),
    prisma.shipment.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { parcels: { select: { id: true } }, createdBy: { select: { name: true } } } }),
    prisma.shipment.findMany({ where: { createdAt: { gte: sevenDaysAgo } }, select: { createdAt: true } }),
  ]);

  const days = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(sevenDaysAgo);
    date.setDate(date.getDate() + offset);
    const count = weekly.filter((shipment) => shipment.createdAt.toDateString() === date.toDateString()).length;
    return { label: new Intl.DateTimeFormat("es-MX", { weekday: "short" }).format(date).replace(".", ""), count };
  });
  const maxDay = Math.max(1, ...days.map(({ count }) => count));

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title={`Hola, ${user.name.split(" ")[0]}`} description={user.role === "ADMIN" ? "Vista administrativa de la operación registrada." : "Resumen de la operación y accesos rápidos."} action={<Link href="/envios/nueva" className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1769aa] px-5 font-semibold text-white hover:bg-[#12578f]"><PackagePlus size={18} aria-hidden /> Nueva hoja</Link>} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores principales">
        <Metric label="Hojas registradas" value={shipmentCount.toLocaleString("es-MX")} icon={<Boxes size={21} />} tone="blue" />
        <Metric label="Paquetes capturados" value={parcelSummary._count._all.toLocaleString("es-MX")} icon={<PackageCheck size={21} />} tone="cyan" />
        <Metric label="Peso acumulado" value={`${(parcelSummary._sum.weight ?? 0).toFixed(2)} kg`} icon={<Scale size={21} />} tone="orange" />
        <Metric label="Clientes" value={customerCount.toLocaleString("es-MX")} icon={<UsersRound size={21} />} tone="navy" />
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="text-lg font-extrabold text-[#102a43]">Hojas recientes</h2><p className="text-sm text-slate-500">{todayCount} capturadas hoy</p></div><Link href="/envios" className="flex items-center gap-1 text-sm font-semibold text-[#1769aa]">Ver todas <ArrowRight size={16} aria-hidden /></Link></div>
          {recent.length === 0 ? <p className="px-5 py-14 text-center text-sm text-slate-500">Aún no hay hojas registradas.</p> : <div className="divide-y divide-slate-100">{recent.map((shipment) => <Link key={shipment.id} href={`/envios/${shipment.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"><div className="min-w-0"><p className="truncate font-bold text-slate-800">{shipment.sheetNumber}</p><p className="text-xs text-slate-500">{shipment.createdBy.name} · {new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(shipment.createdAt)}</p></div><span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#1769aa]">{shipment.parcels.length} {shipment.parcels.length === 1 ? "paquete" : "paquetes"}</span></Link>)}</div>}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-extrabold text-[#102a43]">Actividad semanal</h2>
          <p className="text-sm text-slate-500">Hojas capturadas por día</p>
          <div className="mt-7 flex h-44 items-end justify-between gap-2 border-b border-slate-200 px-1" aria-label="Gráfica de hojas de los últimos siete días">
            {days.map((day) => <div key={day.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-bold text-slate-600">{day.count}</span><span className="w-full max-w-8 rounded-t-md bg-[#18a6b8]" style={{ height: `${Math.max(day.count ? 14 : 3, (day.count / maxDay) * 115)}px`, opacity: day.count ? 1 : 0.2 }} /><span className="pb-2 text-xs capitalize text-slate-500">{day.label}</span></div>)}
          </div>
          <Link href="/clientes" className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"><span>Administrar directorio</span><ArrowRight size={17} aria-hidden /></Link>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone: "blue" | "cyan" | "orange" | "navy" }) {
  const colors = { blue: "bg-blue-50 text-[#1769aa]", cyan: "bg-cyan-50 text-[#138b99]", orange: "bg-orange-50 text-[#d56d08]", navy: "bg-slate-100 text-[#102a43]" };
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className={`grid size-10 place-items-center rounded-xl ${colors[tone]}`}>{icon}</div><p className="mt-5 text-sm font-semibold text-slate-500">{label}</p><p className="mt-1 text-2xl font-extrabold tracking-tight text-[#102a43]">{value}</p></article>;
}

