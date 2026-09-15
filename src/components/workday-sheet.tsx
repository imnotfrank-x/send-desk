"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, CircleAlert, Cloud, CloudOff, LoaderCircle, Minus, Plus, Save, Trash2 } from "lucide-react";
import { CustomerAutocomplete, type CustomerOption } from "@/components/customer-autocomplete";

export type WorkdayParcel = {
  id?: string;
  senderCustomerId?: string;
  recipientCustomerId?: string;
  position: number;
  span: number;
  packageNumber: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  weight: number;
  description: string;
  packageCount: number;
};

const inputClass = "mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-cyan-500 disabled:bg-slate-100";

export function WorkdaySheet({ workdayId, sheetId, sheetIndex, initialParcels, editable }: { workdayId: string; sheetId: string; sheetIndex: number; initialParcels: WorkdayParcel[]; editable: boolean }) {
  const [parcels, setParcels] = useState(initialParcels);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [online, setOnline] = useState(true);
  const firstRender = useRef(true);
  const payload = useMemo(() => ({ workdayId, sheetId, parcels }), [workdayId, sheetId, parcels]);

  const save = useCallback(async () => {
    if (!editable) return;
    setSaveState("saving");
    try {
      const response = await fetch("/api/jornada/autosave", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setSaveState(response.ok ? "saved" : "error");
    } catch {
      setSaveState("error");
    }
  }, [editable, payload]);

  useEffect(() => {
    const updateConnection = () => setOnline(navigator.onLine);
    updateConnection();
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    return () => { window.removeEventListener("online", updateConnection); window.removeEventListener("offline", updateConnection); };
  }, []);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    setSaveState("saving");
    const timer = window.setTimeout(save, 700);
    return () => window.clearTimeout(timer);
  }, [parcels, save]);

  function occupied(except?: number) {
    return new Set(parcels.filter((parcel) => parcel.position !== except).flatMap((parcel) => Array.from({ length: parcel.span }, (_, offset) => parcel.position + offset)));
  }

  function addAt(position: number) {
    if (!editable || occupied().has(position)) return;
    setParcels((current) => [...current, emptyParcel(position)].sort((a, b) => a.position - b.position));
  }

  function update(position: number, field: keyof WorkdayParcel, value: string | number) {
    setParcels((current) => current.map((parcel) => parcel.position === position ? { ...parcel, [field]: value } : parcel));
  }

  function expand(parcel: WorkdayParcel) {
    const next = parcel.position + parcel.span;
    if (next > 6 || occupied(parcel.position).has(next)) return;
    update(parcel.position, "span", parcel.span + 1);
  }

  function reduce(parcel: WorkdayParcel) {
    if (parcel.span === 1) return;
    const hasInformation = Object.entries(parcel).some(([key, value]) => !["id", "position", "span"].includes(key) && value !== "" && value !== 0);
    if (!hasInformation || window.confirm("El espacio adicional forma parte de este bloque. ¿Deseas liberarlo?")) update(parcel.position, "span", parcel.span - 1);
  }

  function clear(parcel: WorkdayParcel) {
    const warning = parcel.span > 1 ? "Se eliminará el contenido y se liberarán todos los espacios absorbidos." : "Se eliminará el contenido de este bloque.";
    if (window.confirm(`${warning} ¿Continuar?`)) setParcels((current) => current.filter((item) => item.position !== parcel.position));
  }

  const totalPackages = parcels.reduce((total, parcel) => total + parcel.packageCount, 0);
  const totalWeight = parcels.reduce((total, parcel) => total + parcel.weight, 0);

  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Hoja {sheetIndex}</p><p className="font-extrabold text-[#102a43]">{totalPackages} paquetes · {totalWeight.toFixed(2)} kg</p></div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className={`inline-flex items-center gap-1.5 font-semibold ${online ? "text-emerald-700" : "text-red-600"}`}>{online ? <Cloud size={17} /> : <CloudOff size={17} />}{online ? "En línea" : "Sin conexión"}</span>
          <span className={`inline-flex items-center gap-1.5 ${saveState === "error" ? "text-red-600" : "text-slate-500"}`}>{saveState === "saving" ? <LoaderCircle size={16} className="animate-spin" /> : saveState === "error" ? <CircleAlert size={16} /> : <Check size={16} />}{saveState === "saving" ? "Guardando…" : saveState === "error" ? "Error de guardado" : "Cambios guardados"}</span>
          {editable && <button type="button" onClick={save} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 font-semibold text-slate-700 hover:bg-slate-50"><Save size={16} /> Guardar ahora</button>}
        </div>
      </div>

      {!editable && <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">La jornada está pausada o finalizada. La hoja está en modo consulta.</div>}

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 6 }, (_, index) => index + 1).map((position) => {
          const owner = parcels.find((parcel) => position >= parcel.position && position < parcel.position + parcel.span);
          if (owner && owner.position !== position) return null;
          if (!owner) return <button key={position} type="button" disabled={!editable} onClick={() => addAt(position)} className="grid min-h-36 place-items-center rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 text-sm font-bold text-slate-500 hover:border-[#18a6b8] hover:text-[#1769aa] disabled:cursor-default disabled:hover:border-slate-300 disabled:hover:text-slate-500"><span><Plus size={20} className="mx-auto mb-1" />Capturar BLOQUE {position}</span></button>;
          return <Block key={owner.position} parcel={owner} disabled={!editable} onUpdate={update} onSelect={(prefix, customer) => fill(owner.position, prefix, customer, setParcels)} onExpand={() => expand(owner)} onReduce={() => reduce(owner)} onClear={() => clear(owner)} canExpand={owner.position + owner.span <= 6 && !occupied(owner.position).has(owner.position + owner.span)} />;
        })}
      </div>
    </section>
  );
}

function emptyParcel(position: number): WorkdayParcel {
  return { position, span: 1, packageNumber: "", senderName: "", senderPhone: "", senderAddress: "", recipientName: "", recipientPhone: "", recipientAddress: "", weight: 0, description: "", packageCount: 0 };
}

function fill(position: number, prefix: "sender" | "recipient", customer: CustomerOption, setParcels: React.Dispatch<React.SetStateAction<WorkdayParcel[]>>) {
  setParcels((current) => current.map((parcel) => parcel.position === position ? { ...parcel, [`${prefix}CustomerId`]: customer.id, [`${prefix}Name`]: customer.name, [`${prefix}Phone`]: customer.phone, [`${prefix}Address`]: customer.address } : parcel));
}

function Block({ parcel, disabled, onUpdate, onSelect, onExpand, onReduce, onClear, canExpand }: { parcel: WorkdayParcel; disabled: boolean; onUpdate: (position: number, field: keyof WorkdayParcel, value: string | number) => void; onSelect: (prefix: "sender" | "recipient", customer: CustomerOption) => void; onExpand: () => void; onReduce: () => void; onClear: () => void; canExpand: boolean }) {
  const field = (name: keyof WorkdayParcel) => (value: string) => onUpdate(parcel.position, name, name === "weight" || name === "packageCount" ? Number(value) : value);
  return (
    <article className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${parcel.span > 1 ? "lg:col-span-2" : ""}`}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div><h2 className="font-extrabold text-[#102a43]">BLOQUE {parcel.position}</h2><p className="text-xs text-slate-500">Ocupa {parcel.span} {parcel.span === 1 ? "espacio" : "espacios"}</p></div>
        {!disabled && <div className="flex gap-1"><button type="button" onClick={onExpand} disabled={!canExpand} className="grid size-9 place-items-center rounded-lg border border-slate-200 text-[#1769aa] disabled:opacity-30" aria-label="Expandir bloque"><Plus size={17} /></button><button type="button" onClick={onReduce} disabled={parcel.span === 1} className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-30" aria-label="Reducir bloque"><Minus size={17} /></button><button type="button" onClick={onClear} className="grid size-9 place-items-center rounded-lg border border-red-200 text-red-600" aria-label="Limpiar bloque"><Trash2 size={17} /></button></div>}
      </header>
      <div className="grid gap-4 p-4 md:grid-cols-2">
        <Contact title="De" prefix="sender" parcel={parcel} disabled={disabled} onUpdate={field} onSelect={onSelect} />
        <Contact title="Para" prefix="recipient" parcel={parcel} disabled={disabled} onUpdate={field} onSelect={onSelect} />
        <label className="text-sm font-semibold text-slate-700 md:col-span-2">Contenido<textarea value={parcel.description} onChange={(event) => field("description")(event.target.value)} disabled={disabled} rows={2} className={`${inputClass} h-auto py-2`} /></label>
        <Field label="No. / referencia" value={parcel.packageNumber} disabled={disabled} onChange={field("packageNumber")} />
        <div className="grid grid-cols-2 gap-3"><Field label="Paq" value={parcel.packageCount || ""} type="number" disabled={disabled} onChange={field("packageCount")} /><Field label="Kg" value={parcel.weight || ""} type="number" disabled={disabled} onChange={field("weight")} /></div>
      </div>
    </article>
  );
}

function Contact({ title, prefix, parcel, disabled, onUpdate, onSelect }: { title: string; prefix: "sender" | "recipient"; parcel: WorkdayParcel; disabled: boolean; onUpdate: (name: keyof WorkdayParcel) => (value: string) => void; onSelect: (prefix: "sender" | "recipient", customer: CustomerOption) => void }) {
  const name = `${prefix}Name` as keyof WorkdayParcel;
  const phone = `${prefix}Phone` as keyof WorkdayParcel;
  const address = `${prefix}Address` as keyof WorkdayParcel;
  return <fieldset className="rounded-xl border border-dashed border-slate-300 p-3"><legend className="px-2 text-sm font-extrabold uppercase text-[#1769aa]">{title}</legend>{!disabled && <CustomerAutocomplete label={prefix === "recipient" && parcel.senderCustomerId ? "Destinos frecuentes" : "Buscar en directorio"} relatedTo={prefix === "recipient" ? parcel.senderCustomerId : undefined} onSelect={(customer) => onSelect(prefix, customer)} />}<div className="mt-3 grid gap-3"><Field label="Nombre" value={String(parcel[name])} disabled={disabled} onChange={onUpdate(name)} /><Field label="Tel" value={String(parcel[phone])} disabled={disabled} onChange={onUpdate(phone)} /><label className="text-sm font-semibold text-slate-700">Dir<textarea value={String(parcel[address])} onChange={(event) => onUpdate(address)(event.target.value)} disabled={disabled} rows={2} className={`${inputClass} h-auto py-2`} /></label></div></fieldset>;
}

function Field({ label, value, onChange, disabled, type = "text" }: { label: string; value: string | number; onChange: (value: string) => void; disabled: boolean; type?: string }) {
  return <label className="text-sm font-semibold text-slate-700">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} min={type === "number" ? "0" : undefined} step={type === "number" ? "0.01" : undefined} className={inputClass} /></label>;
}
