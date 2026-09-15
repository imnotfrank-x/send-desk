import Link from "next/link";
import { Download, FilePlus2, Pause, Play, Printer, RotateCcw, Save, Square } from "lucide-react";
import { addSheetAction, changeWorkdayStatusAction, clearWorkdayAction, saveDirectoryAction, startWorkdayAction } from "@/app/actions/workday";
import { PageHeader } from "@/components/page-header";
import { WorkdaySheet } from "@/components/workday-sheet";
import { ConfirmationButton } from "@/components/confirmation-button";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Jornada" };

export default async function WorkdayPage({ searchParams }: { searchParams: Promise<{ hoja?: string; error?: string; confirm?: string; colaborador?: string }> }) {
  await requireUser();
  const query = await searchParams;
  const workday = await prisma.workday.findFirst({
    where: { status: { in: ["ACTIVE", "PAUSED"] } },
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { name: true } }, shipments: { orderBy: { sheetIndex: "asc" }, include: { parcels: { orderBy: { position: "asc" } } } } },
  }) ?? await prisma.workday.findFirst({
    where: { status: "FINALIZED" },
    orderBy: { finalizedAt: "desc" },
    include: { createdBy: { select: { name: true } }, shipments: { orderBy: { sheetIndex: "asc" }, include: { parcels: { orderBy: { position: "asc" } } } } },
  });

  if (!workday) return <div className="mx-auto max-w-4xl"><PageHeader title="Jornada" description="No hay una jornada abierta." /><section className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm"><h2 className="text-xl font-extrabold text-[#102a43]">Inicia la operación del día</h2><p className="mx-auto mt-2 max-w-lg text-slate-600">Se creará la Hoja 1 con seis BLOQUES disponibles para todo el equipo.</p><form action={startWorkdayAction}><button className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-[#1769aa] px-6 font-bold text-white"><Play size={19} /> Iniciar jornada</button></form></section></div>;

  const selected = workday.shipments.find((sheet) => sheet.id === query.hoja) ?? workday.shipments[0];
  const packageCount = workday.shipments.flatMap((sheet) => sheet.parcels).reduce((total, parcel) => total + parcel.packageCount, 0);
  const weight = workday.shipments.flatMap((sheet) => sheet.parcels).reduce((total, parcel) => total + (parcel.weight ?? 0), 0);
  const statusLabel = { ACTIVE: "Activa", PAUSED: "Pausada", FINALIZED: "Finalizada" }[workday.status];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Jornada actual" description={`Iniciada por ${workday.createdBy.name} · ${new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeStyle: "short" }).format(workday.startedAt)}`} />
      {query.error && <ErrorMessage code={query.error} />}
      {query.confirm && <ConfirmCollaborator id={workday.id} intent={query.confirm} collaborator={query.colaborador} />}

      <section className="mb-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Estado" value={statusLabel} />
        <Metric label="Paquetes" value={packageCount.toLocaleString("es-MX")} />
        <Metric label="Peso" value={`${weight.toFixed(2)} kg`} />
      </section>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">{workday.shipments.map((sheet) => <Link key={sheet.id} href={`/jornada?hoja=${sheet.id}`} className={`rounded-lg px-4 py-2 text-sm font-bold ${selected?.id === sheet.id ? "bg-[#102a43] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>Hoja {sheet.sheetIndex}</Link>)}</div>
        {workday.status === "ACTIVE" && <form action={addSheetAction}><button className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#1769aa] px-3 text-sm font-bold text-[#1769aa]"><FilePlus2 size={17} /> Nueva hoja</button></form>}
      </div>

      {selected && <WorkdaySheet workdayId={workday.id} sheetId={selected.id} sheetIndex={selected.sheetIndex} editable={workday.status === "ACTIVE"} initialParcels={selected.parcels.map((parcel) => ({ ...parcel, packageNumber: parcel.packageNumber ?? "", weight: parcel.weight ?? 0 }))} />}

      <section className="no-print sticky bottom-3 z-10 mt-6 flex flex-wrap items-center justify-end gap-2 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur">
        {workday.status !== "FINALIZED" && <form action={saveDirectoryAction}><input type="hidden" name="id" value={workday.id} /><button className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 font-bold text-slate-700"><Save size={18} /> Guardar Directorio</button></form>}
        {workday.status === "ACTIVE" && <><StatusButton id={workday.id} intent="pause" label="Pausar" icon={<Pause size={18} />} /><StatusButton id={workday.id} intent="finalize" label="Finalizar" icon={<Square size={17} />} primary confirmation="La jornada quedará congelada y ya no podrá editarse. ¿Deseas finalizar?" /></>}
        {workday.status === "PAUSED" && <StatusButton id={workday.id} intent="continue" label="Continuar" icon={<Play size={18} />} primary />}
        {workday.status === "FINALIZED" && <><a href={`/api/jornadas/${workday.id}/pdf?disposition=inline`} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 font-bold text-slate-700"><Printer size={18} /> Previsualizar</a><a href={`/api/jornadas/${workday.id}/pdf`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1769aa] px-4 font-bold text-white"><Download size={18} /> PDF</a><form action={clearWorkdayAction}><input type="hidden" name="id" value={workday.id} /><ConfirmationButton message="Se abrirá una nueva jornada con Hoja 1 y seis BLOQUES disponibles. El historial finalizado y el Directorio permanecerán intactos. ¿Continuar?" className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-200 px-4 font-bold text-red-600"><RotateCcw size={18} /> Limpiar jornada</ConfirmationButton></form></>}
      </section>
    </div>
  );
}

function StatusButton({ id, intent, label, icon, primary = false, confirmation }: { id: string; intent: string; label: string; icon: React.ReactNode; primary?: boolean; confirmation?: string }) {
  const className = `inline-flex h-11 items-center gap-2 rounded-xl px-4 font-bold ${primary ? "bg-[#1769aa] text-white" : "border border-slate-200 text-slate-700"}`;
  return <form action={changeWorkdayStatusAction}><input type="hidden" name="id" value={id} /><input type="hidden" name="intent" value={intent} />{confirmation ? <ConfirmationButton message={confirmation} className={className}>{icon}{label}</ConfirmationButton> : <button className={className}>{icon}{label}</button>}</form>;
}

function ConfirmCollaborator({ id, intent, collaborator }: { id: string; intent: string; collaborator?: string }) {
  return <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4"><p className="font-bold text-amber-900">{collaborator ?? "Otro empleado"} registró actividad recientemente.</p><p className="mt-1 text-sm text-amber-800">Confirma si deseas {intent === "pause" ? "pausar" : "finalizar"} la jornada de todas formas.</p><div className="mt-3 flex gap-2"><form action={changeWorkdayStatusAction}><input type="hidden" name="id" value={id} /><input type="hidden" name="intent" value={intent} /><input type="hidden" name="force" value="true" /><button className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-bold text-white">Confirmar</button></form><Link href="/jornada" className="rounded-lg border border-amber-300 px-4 py-2 text-sm font-bold text-amber-900">Cancelar</Link></div></div>;
}

function ErrorMessage({ code }: { code: string }) {
  const messages: Record<string, string> = { pendientes: "No se puede finalizar: completa o limpia todos los BLOQUES pendientes.", directorio: "Guarda el Directorio después del último cambio antes de finalizar.", limpiar: "Sólo puedes limpiar una jornada finalizada, con PDF generado y Directorio guardado." };
  return <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{messages[code] ?? "No fue posible completar la operación."}</div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <article className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 text-xl font-extrabold text-[#102a43]">{value}</p></article>;
}
