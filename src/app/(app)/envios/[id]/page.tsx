import Link from "next/link";
import { ArrowLeft, Box, Download } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Detalle de hoja" };

export default async function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const shipment = await prisma.shipment.findUnique({ where: { id: (await params).id }, include: { createdBy: { select: { name: true } }, parcels: { orderBy: { position: "asc" } } } });
  if (!shipment) notFound();
  return (
    <div className="mx-auto max-w-7xl">
      <div className="no-print mb-5 flex items-center justify-between gap-4"><Link href="/envios" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1769aa] hover:underline"><ArrowLeft size={17} aria-hidden /> Volver a hojas</Link><a href={`/api/envios/${shipment.id}/pdf`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1769aa] px-5 font-semibold text-white hover:bg-[#12578f]"><Download size={18} aria-hidden /> Descargar PDF</a></div>
      <article className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
        <header className="grid gap-4 border-b-2 border-[#102a43] p-5 sm:grid-cols-[1fr_auto] sm:items-end sm:p-7">
          <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1769aa]">Hoja digital de envío</p><h1 className="mt-1 text-3xl font-black tracking-tight text-[#102a43]">{shipment.sheetNumber}</h1></div>
          <div className="text-sm text-slate-600 sm:text-right"><p><strong>Fecha:</strong> {new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeStyle: "short" }).format(shipment.createdAt)}</p><p><strong>Capturó:</strong> {shipment.createdBy.name}</p><p><strong>Paquetes:</strong> {shipment.parcels.length} de 6</p></div>
        </header>
        <div className="grid md:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => {
            const parcel = shipment.parcels[index];
            return (
              <section key={index} className="min-h-[320px] border-b border-slate-300 p-5 odd:md:border-r">
                <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><span className={`grid size-8 place-items-center rounded-lg text-sm font-bold ${parcel ? "bg-[#1769aa] text-white" : "border border-dashed border-slate-300 text-slate-400"}`}>{index + 1}</span><h2 className="font-extrabold text-[#102a43]">Paquete {index + 1}</h2></div>{parcel && <Box size={20} className="text-[#f28c28]" aria-hidden />}</div>
                {!parcel ? <div className="grid h-56 place-items-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400">Posición disponible</div> : <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3"><p><span className="block text-xs uppercase text-slate-500">Número</span><strong>{parcel.packageNumber || "Sin referencia"}</strong></p><p><span className="block text-xs uppercase text-slate-500">Peso</span><strong>{(parcel.weight ?? 0).toFixed(2)} kg</strong></p><p className="col-span-2"><span className="block text-xs uppercase text-slate-500">Descripción</span>{parcel.description}</p></div>
                  <div className="grid gap-4 sm:grid-cols-2"><Contact title="Remitente" name={parcel.senderName} phone={parcel.senderPhone} address={parcel.senderAddress} /><Contact title="Destinatario" name={parcel.recipientName} phone={parcel.recipientPhone} address={parcel.recipientAddress} /></div>
                </div>}
              </section>
            );
          })}
        </div>
      </article>
    </div>
  );
}

function Contact({ title, name, phone, address }: { title: string; name: string; phone: string; address: string }) {
  return <div><h3 className="mb-1 text-xs font-extrabold uppercase tracking-wider text-[#1769aa]">{title}</h3><p className="font-semibold text-slate-800">{name}</p><p className="text-slate-600">{phone}</p><p className="mt-1 leading-5 text-slate-500">{address}</p></div>;
}

