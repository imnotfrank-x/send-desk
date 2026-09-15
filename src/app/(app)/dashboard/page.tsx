import Link from "next/link";
import { ArrowRight, CalendarCheck, PackageCheck, Play, Scale, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Estadísticas" };

export default async function DashboardPage() {
  const user = await requireAdmin();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eightWeeksAgo = new Date(today);
  eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 55);
  const finalizedFilter = { shipment: { workday: { status: "FINALIZED" as const } } };
  const [customerCount, workdayCount, parcelSummary, recent, weekly] = await Promise.all([
    prisma.customer.count(),
    prisma.workday.count({ where: { status: "FINALIZED" } }),
    prisma.parcel.aggregate({ where: finalizedFilter, _sum: { packageCount: true, weight: true } }),
    prisma.workday.findMany({ where: { status: "FINALIZED" }, take: 5, orderBy: { finalizedAt: "desc" }, include: { createdBy: { select: { name: true } }, shipments: { include: { parcels: { select: { packageCount: true, weight: true } } } } } }),
    prisma.workday.findMany({ where: { status: "FINALIZED", finalizedAt: { gte: eightWeeksAgo } }, select: { finalizedAt: true, shipments: { select: { parcels: { select: { packageCount: true } } } } } }),
  ]);
  const weeks = Array.from({ length: 8 }, (_, offset) => {
    const start = new Date(eightWeeksAgo); start.setDate(start.getDate() + offset * 7);
    const end = new Date(start); end.setDate(end.getDate() + 7);
    const count = weekly.filter((day) => day.finalizedAt && day.finalizedAt >= start && day.finalizedAt < end).flatMap((day) => day.shipments.flatMap((sheet) => sheet.parcels)).reduce((total, parcel) => total + parcel.packageCount, 0);
    return { label: `${start.getDate()}/${start.getMonth() + 1}`, count };
  });
  const maxWeek = Math.max(1, ...weeks.map((week) => week.count));
  return <div className="mx-auto max-w-7xl"><PageHeader title={`Hola, ${user.name.split(" ")[0]}`} description="Estadísticas calculadas exclusivamente con jornadas finalizadas." action={<Link href="/jornada" className="flex h-11 items-center gap-2 rounded-xl bg-[#1769aa] px-5 font-bold text-white"><Play size={18} /> Ir a jornada</Link>} />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Jornadas finalizadas" value={workdayCount.toLocaleString("es-MX")} icon={<CalendarCheck />} /><Metric label="Paquetes enviados" value={(parcelSummary._sum.packageCount ?? 0).toLocaleString("es-MX")} icon={<PackageCheck />} /><Metric label="Kg enviados" value={`${(parcelSummary._sum.weight ?? 0).toFixed(2)} kg`} icon={<Scale />} /><Metric label="Clientes" value={customerCount.toLocaleString("es-MX")} icon={<UsersRound />} /></section>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]"><section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="text-lg font-extrabold text-[#102a43]">Jornadas recientes</h2><Link href="/envios" className="flex items-center gap-1 text-sm font-bold text-[#1769aa]">Ver hojas <ArrowRight size={16} /></Link></div>{recent.length === 0 ? <p className="px-5 py-14 text-center text-sm text-slate-500">Aún no hay jornadas finalizadas.</p> : <div className="divide-y divide-slate-100">{recent.map((day) => { const parcels = day.shipments.flatMap((sheet) => sheet.parcels); return <article key={day.id} className="flex items-center justify-between px-5 py-4"><div><p className="font-bold text-slate-800">{new Intl.DateTimeFormat("es-MX", { dateStyle: "long" }).format(day.finalizedAt!)}</p><p className="text-xs text-slate-500">{day.createdBy.name} · {day.shipments.length} hojas</p></div><p className="text-sm font-bold text-[#1769aa]">{parcels.reduce((sum, parcel) => sum + parcel.packageCount, 0)} paq · {parcels.reduce((sum, parcel) => sum + (parcel.weight ?? 0), 0).toFixed(2)} kg</p></article>; })}</div>}</section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-extrabold text-[#102a43]">Semanas de mayor actividad</h2><p className="text-sm text-slate-500">Paquetes de jornadas finalizadas · últimas 8 semanas</p><div className="mt-7 flex h-44 items-end justify-between gap-2 border-b border-slate-200 px-1">{weeks.map((week) => <div key={week.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-bold text-slate-600">{week.count}</span><span className="w-full max-w-8 rounded-t-md bg-[#18a6b8]" style={{ height: `${Math.max(week.count ? 14 : 3, (week.count / maxWeek) * 115)}px`, opacity: week.count ? 1 : 0.2 }} /><span className="pb-2 text-xs text-slate-500">{week.label}</span></div>)}</div></section></div>
  </div>;
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) { return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-[#1769aa]">{icon}</div><p className="mt-5 text-sm font-semibold text-slate-500">{label}</p><p className="mt-1 text-2xl font-extrabold text-[#102a43]">{value}</p></article>; }
