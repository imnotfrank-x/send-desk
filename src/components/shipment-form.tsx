"use client";

import { useActionState, useState } from "react";
import { LoaderCircle, PackagePlus, Save, Trash2 } from "lucide-react";
import { createShipmentAction } from "@/app/actions/shipments";
import { CustomerAutocomplete, type CustomerOption } from "@/components/customer-autocomplete";
import type { ParcelInput } from "@/lib/validations";

type ParcelDraft = ParcelInput & { key: string };

const emptyParcel = (): ParcelDraft => ({
  key: crypto.randomUUID(),
  packageNumber: "",
  senderName: "",
  senderPhone: "",
  senderAddress: "",
  recipientName: "",
  recipientPhone: "",
  recipientAddress: "",
  weight: 0,
  description: "",
});

const fieldClass = "mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-cyan-500";

export function ShipmentForm() {
  const [parcels, setParcels] = useState<ParcelDraft[]>([emptyParcel()]);
  const [state, action, pending] = useActionState(createShipmentAction, {});

  function update(index: number, field: keyof ParcelInput, value: string | number) {
    setParcels((current) => current.map((parcel, parcelIndex) => parcelIndex === index ? { ...parcel, [field]: value } : parcel));
  }

  function fillContact(index: number, prefix: "sender" | "recipient", customer: CustomerOption) {
    setParcels((current) => current.map((parcel, parcelIndex) => parcelIndex === index ? {
      ...parcel,
      [`${prefix}Name`]: customer.name,
      [`${prefix}Phone`]: customer.phone,
      [`${prefix}Address`]: customer.address,
    } : parcel));
  }

  const payload = JSON.stringify({
    parcels: parcels.map((parcel) => ({
      packageNumber: parcel.packageNumber,
      senderName: parcel.senderName,
      senderPhone: parcel.senderPhone,
      senderAddress: parcel.senderAddress,
      recipientName: parcel.recipientName,
      recipientPhone: parcel.recipientPhone,
      recipientAddress: parcel.recipientAddress,
      weight: parcel.weight,
      description: parcel.description,
    })),
  });

  return (
    <form action={action}>
      <input type="hidden" name="payload" value={payload} />
      <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold text-[#102a43]">Capacidad de la hoja</p>
          <div className="mt-2 flex gap-2" aria-label={`${parcels.length} de 6 posiciones ocupadas`}>
            {Array.from({ length: 6 }, (_, index) => <span key={index} className={`grid size-8 place-items-center rounded-lg text-sm font-bold ${index < parcels.length ? "bg-[#1769aa] text-white" : "border border-dashed border-slate-300 text-slate-400"}`}>{index + 1}</span>)}
          </div>
        </div>
        <button type="button" disabled={parcels.length === 6} onClick={() => setParcels((current) => [...current, emptyParcel()])} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[#1769aa] px-4 font-semibold text-[#1769aa] hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"><PackagePlus size={18} aria-hidden /> Agregar paquete</button>
      </div>

      {state.error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>}

      <div className="space-y-5">
        {parcels.map((parcel, index) => (
          <section key={parcel.key} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
              <div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-[#102a43] text-sm font-bold text-white">{index + 1}</span><div><h2 className="font-bold text-[#102a43]">Paquete {index + 1}</h2><p className="text-xs text-slate-500">Posición {index + 1} de la hoja</p></div></div>
              {parcels.length > 1 && <button type="button" onClick={() => setParcels((current) => current.filter((_, parcelIndex) => parcelIndex !== index))} className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label={`Quitar paquete ${index + 1}`}><Trash2 size={18} aria-hidden /></button>}
            </header>
            <div className="p-5">
              <div className="mb-5 grid gap-4 sm:grid-cols-[1fr_180px_2fr]">
                <Field label="Número de paquete" value={parcel.packageNumber} onChange={(value) => update(index, "packageNumber", value)} placeholder="PKG-0001" required />
                <Field label="Peso (kg)" value={parcel.weight || ""} onChange={(value) => update(index, "weight", Number(value))} type="number" placeholder="0.00" required />
                <Field label="Descripción" value={parcel.description} onChange={(value) => update(index, "description", value)} placeholder="Contenido general" required />
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                <ContactBlock title="Remitente" prefix="sender" parcel={parcel} index={index} update={update} onSelect={(customer) => fillContact(index, "sender", customer)} />
                <ContactBlock title="Destinatario" prefix="recipient" parcel={parcel} index={index} update={update} onSelect={(customer) => fillContact(index, "recipient", customer)} />
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="sticky bottom-4 mt-6 flex justify-end rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
        <button type="submit" disabled={pending} className="flex h-12 items-center gap-2 rounded-xl bg-[#1769aa] px-6 font-semibold text-white hover:bg-[#12578f] disabled:opacity-70">{pending ? <LoaderCircle size={19} className="animate-spin" aria-hidden /> : <Save size={19} aria-hidden />} Guardar hoja ({parcels.length} {parcels.length === 1 ? "paquete" : "paquetes"})</button>
      </div>
    </form>
  );
}

function ContactBlock({ title, prefix, parcel, index, update, onSelect }: { title: string; prefix: "sender" | "recipient"; parcel: ParcelDraft; index: number; update: (index: number, field: keyof ParcelInput, value: string | number) => void; onSelect: (customer: CustomerOption) => void }) {
  const name = `${prefix}Name` as keyof ParcelInput;
  const phone = `${prefix}Phone` as keyof ParcelInput;
  const address = `${prefix}Address` as keyof ParcelInput;
  return (
    <fieldset className="rounded-xl border border-dashed border-slate-300 p-4">
      <legend className="px-2 text-sm font-extrabold uppercase tracking-wider text-[#1769aa]">{title}</legend>
      <CustomerAutocomplete label="Completar desde clientes" onSelect={onSelect} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Nombre" value={String(parcel[name])} onChange={(value) => update(index, name, value)} required />
        <Field label="Teléfono" value={String(parcel[phone])} onChange={(value) => update(index, phone, value)} required />
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Dirección<textarea value={String(parcel[address])} onChange={(event) => update(index, address, event.target.value)} rows={2} className={`${fieldClass} h-auto py-2`} required /></label>
      </div>
    </fieldset>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", required }: { label: string; value: string | number; onChange: (value: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return <label className="text-sm font-semibold text-slate-700">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} min={type === "number" ? "0.01" : undefined} step={type === "number" ? "0.01" : undefined} className={fieldClass} required={required} /></label>;
}
