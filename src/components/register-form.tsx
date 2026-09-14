"use client";

import { useActionState, useState } from "react";
import { LoaderCircle, UserPlus } from "lucide-react";
import { registerAction } from "@/app/actions/auth";

const fields = [
  { name: "name", label: "Nombre completo", type: "text", autoComplete: "name", placeholder: "Tu nombre", maxLength: 100 },
  { name: "email", label: "Correo electrónico", type: "email", autoComplete: "email", placeholder: "tu@correo.com", maxLength: 254 },
  { name: "password", label: "Contraseña", type: "password", autoComplete: "new-password", placeholder: "Al menos 8 caracteres", minLength: 8 },
  { name: "confirmPassword", label: "Confirmar contraseña", type: "password", autoComplete: "new-password", placeholder: "Repite tu contraseña", minLength: 8 },
] as const;

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, {});
  const [values, setValues] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  return (
    <form action={action} className="space-y-4" aria-busy={pending}>
      {state.error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>}
      {fields.map(({ name, label, ...inputProps }) => {
        const error = state.fieldErrors?.[name]?.[0];
        return (
          <div key={name}>
            <label htmlFor={`register-${name}`} className="block text-sm font-semibold text-slate-700">{label}</label>
            <input {...inputProps} id={`register-${name}`} name={name} required value={values[name]} onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))} aria-invalid={Boolean(error)} aria-describedby={error ? `register-${name}-error` : undefined} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 outline-none transition focus:border-cyan-500" />
            {error && <p id={`register-${name}-error`} role="alert" className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );
      })}
      <p className="text-xs leading-5 text-slate-500">Tu cuenta tendrá acceso de Operador para trabajar con clientes y envíos.</p>
      <button type="submit" disabled={pending} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1769aa] px-5 font-semibold text-white shadow-sm transition hover:bg-[#12578f] disabled:cursor-wait disabled:opacity-70">
        {pending ? <LoaderCircle size={19} className="animate-spin" aria-hidden /> : <UserPlus size={19} aria-hidden />}
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </button>
    </form>
  );
}
