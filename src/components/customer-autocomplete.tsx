"use client";

import { useEffect, useId, useState } from "react";
import { Search } from "lucide-react";

export type CustomerOption = { id: string; code: string; name: string; phone: string; address: string };

export function CustomerAutocomplete({ label, onSelect, relatedTo }: { label: string; onSelect: (customer: CustomerOption) => void; relatedTo?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CustomerOption[]>([]);
  const [open, setOpen] = useState(false);
  const inputId = useId();

  useEffect(() => {
    if (query.trim().length < 2 && !relatedTo) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const parameters = new URLSearchParams();
      if (query.trim().length >= 2) parameters.set("q", query);
      else if (relatedTo) parameters.set("relatedTo", relatedTo);
      const response = await fetch(`/api/clientes?${parameters}`, { signal: controller.signal });
      if (response.ok) { setResults(await response.json()); setOpen(true); }
    }, 180);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, relatedTo]);

  return (
    <div className="relative">
      <label className="text-sm font-semibold text-slate-700" htmlFor={inputId}>{label}</label>
      <div className="mt-2 flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-cyan-500"><Search size={17} className="text-slate-400" aria-hidden /><input id={inputId} value={query} onChange={(event) => { const next = event.target.value; setQuery(next); if (next.trim().length < 2) { setResults([]); setOpen(false); } }} onFocus={() => results.length > 0 && setOpen(true)} placeholder="Buscar por nombre, código o teléfono" className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none" autoComplete="off" /></div>
      {open && results.length > 0 && <div className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">{results.map((customer) => <button type="button" key={customer.id} className="block w-full rounded-lg px-3 py-2.5 text-left hover:bg-slate-50" onClick={() => { onSelect(customer); setQuery(`${customer.code} · ${customer.name}`); setOpen(false); }}><span className="block text-sm font-semibold text-slate-800">{customer.name}</span><span className="block text-xs text-slate-500">{customer.code} · {customer.phone}</span></button>)}</div>}
    </div>
  );
}
