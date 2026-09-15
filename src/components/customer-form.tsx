"use client";

import type { Customer } from "@prisma/client";
import { useActionState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { saveCustomerAction } from "@/app/actions/customers";

const inputClass = "mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 outline-none transition focus:border-cyan-500";

export function CustomerForm({ customer }: { customer?: Customer }) {
  const [state, action, pending] = useActionState(saveCustomerAction, {});
  return (
    <form action={action} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      {customer && <input type="hidden" name="id" value={customer.id} />}
      {state.error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Código (opcional)" name="code" defaultValue={customer?.code} error={state.fieldErrors?.code?.[0]} placeholder="Se genera automáticamente" required={false} />
        <Field label="Nombre o razón social" name="name" defaultValue={customer?.name} error={state.fieldErrors?.name?.[0]} placeholder="Empresa de ejemplo" />
        <Field label="Teléfono" name="phone" defaultValue={customer?.phone} error={state.fieldErrors?.phone?.[0]} placeholder="555 010 0000" />
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Dirección <span className="font-normal text-slate-400">(opcional)</span><textarea name="address" defaultValue={customer?.address} rows={3} className={`${inputClass} h-auto py-3`} />{state.fieldErrors?.address?.[0] && <span className="mt-1 block text-sm text-red-600">{state.fieldErrors.address[0]}</span>}</label>
        <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Notas <span className="font-normal text-slate-400">(opcional)</span><textarea name="notes" defaultValue={customer?.notes ?? ""} rows={3} className={`${inputClass} h-auto py-3`} /></label>
      </div>
      <div className="mt-7 flex justify-end"><button type="submit" disabled={pending} className="flex h-11 items-center gap-2 rounded-xl bg-[#1769aa] px-5 font-semibold text-white hover:bg-[#12578f] disabled:opacity-70">{pending ? <LoaderCircle size={18} className="animate-spin" aria-hidden /> : <Save size={18} aria-hidden />}{customer ? "Guardar cambios" : "Crear cliente"}</button></div>
    </form>
  );
}

function Field({ label, name, defaultValue, error, placeholder, required = true }: { label: string; name: string; defaultValue?: string; error?: string; placeholder?: string; required?: boolean }) {
  return <label className="text-sm font-semibold text-slate-700">{label}<input name={name} defaultValue={defaultValue} placeholder={placeholder} className={inputClass} required={required} />{error && <span className="mt-1 block text-sm text-red-600">{error}</span>}</label>;
}

