"use client";

import { useActionState } from "react";
import { KeyRound, LoaderCircle, UserPlus } from "lucide-react";
import { changeEmployeePasswordAction, createEmployeeAction } from "@/app/actions/employees";

const input = "mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-cyan-500";

export function EmployeeCreateForm() {
  const [state, action, pending] = useActionState(createEmployeeAction, {});
  return <form action={action} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-extrabold text-[#102a43]">Nuevo empleado</h2>{state.error && <Message error>{state.error}</Message>}{state.success && <Message>{state.success}</Message>}<div className="mt-4 grid gap-3 sm:grid-cols-2"><Field name="name" label="Nombre" error={state.fieldErrors?.name?.[0]} /><Field name="email" label="Correo" type="email" error={state.fieldErrors?.email?.[0]} /><Field name="password" label="Contraseña temporal" type="password" error={state.fieldErrors?.password?.[0]} /><label className="text-sm font-semibold text-slate-700">Rol<select name="role" className={input}><option value="OPERADOR">Empleado</option><option value="ADMIN">Administrador</option></select></label></div><button disabled={pending} className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-[#1769aa] px-4 font-bold text-white">{pending ? <LoaderCircle size={17} className="animate-spin" /> : <UserPlus size={17} />} Crear</button></form>;
}

export function PasswordForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(changeEmployeePasswordAction, {});
  return <form action={action} className="flex flex-wrap items-end gap-2"><input type="hidden" name="id" value={id} /><label className="text-xs font-bold text-slate-500">Nueva contraseña<input name="password" type="password" minLength={8} required className="mt-1 block h-9 w-44 rounded-lg border border-slate-200 px-2 text-sm" /></label><button disabled={pending} className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600" aria-label="Cambiar contraseña">{pending ? <LoaderCircle size={16} className="animate-spin" /> : <KeyRound size={16} />}</button>{state.error && <span className="w-full text-xs text-red-600">{state.error}</span>}{state.success && <span className="w-full text-xs text-emerald-700">{state.success}</span>}</form>;
}

function Field({ name, label, type = "text", error }: { name: string; label: string; type?: string; error?: string }) { return <label className="text-sm font-semibold text-slate-700">{label}<input name={name} type={type} required className={input} />{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</label>; }
function Message({ children, error = false }: { children: React.ReactNode; error?: boolean }) { return <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{children}</p>; }
