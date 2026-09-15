import { Trash2 } from "lucide-react";
import { deleteEmployeeAction } from "@/app/actions/employees";
import { EmployeeCreateForm, PasswordForm } from "@/components/employee-forms";
import { ConfirmationButton } from "@/components/confirmation-button";
import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Empleados" };

export default async function EmployeesPage() {
  const admin = await requireAdmin();
  const employees = await prisma.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, email: true, role: true, createdAt: true, _count: { select: { shipments: true, workdays: true } } } });
  return <div className="mx-auto max-w-6xl"><PageHeader title="Empleados" description="Crea accesos, cambia contraseñas y administra el equipo." /><EmployeeCreateForm /><section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="divide-y divide-slate-100">{employees.map((employee) => { const hasHistory = employee._count.shipments + employee._count.workdays > 0; return <article key={employee.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto_auto] md:items-center"><div><p className="font-extrabold text-[#102a43]">{employee.name}</p><p className="text-sm text-slate-500">{employee.email} · {employee.role === "ADMIN" ? "Administrador" : "Empleado"}</p></div><PasswordForm id={employee.id} /><form action={deleteEmployeeAction}><input type="hidden" name="id" value={employee.id} /><ConfirmationButton message={`¿Eliminar el acceso de ${employee.name}?`} disabled={employee.id === admin.id || hasHistory} title={hasHistory ? "Se conserva porque tiene historial operativo" : undefined} className="grid size-9 place-items-center rounded-lg border border-red-200 text-red-600 disabled:cursor-not-allowed disabled:opacity-30" ariaLabel={`Eliminar ${employee.name}`}><Trash2 size={16} /></ConfirmationButton></form></article>; })}</div></section></div>;
}
