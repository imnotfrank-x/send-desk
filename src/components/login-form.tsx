"use client";

import { useActionState } from "react";
import { ArrowRight, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { loginAction } from "@/app/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});
  return (
    <form action={action} className="space-y-5">
      {state.error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>}
      <label className="block text-sm font-semibold text-slate-700">
        Correo
        <span className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 focus-within:border-cyan-500">
          <Mail size={18} className="text-slate-400" aria-hidden />
          <input name="email" type="email" autoComplete="email" placeholder="tu@correo.com" className="h-12 min-w-0 flex-1 border-0 bg-transparent outline-none" required />
        </span>
        {state.fieldErrors?.email?.[0] && <span className="mt-1 block text-sm text-red-600">{state.fieldErrors.email[0]}</span>}
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Contraseña
        <span className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 focus-within:border-cyan-500">
          <LockKeyhole size={18} className="text-slate-400" aria-hidden />
          <input name="password" type="password" autoComplete="current-password" placeholder="Tu contraseña" className="h-12 min-w-0 flex-1 border-0 bg-transparent outline-none" required />
        </span>
        {state.fieldErrors?.password?.[0] && <span className="mt-1 block text-sm text-red-600">{state.fieldErrors.password[0]}</span>}
      </label>
      <button type="submit" disabled={pending} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1769aa] px-5 font-semibold text-white shadow-sm transition hover:bg-[#12578f] disabled:cursor-wait disabled:opacity-70">
        {pending ? <LoaderCircle size={19} className="animate-spin" aria-hidden /> : <ArrowRight size={19} aria-hidden />}
        {pending ? "Iniciando sesión…" : "Iniciar sesión"}
      </button>
    </form>
  );
}

