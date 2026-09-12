import Link from "next/link";
import { Boxes, LayoutDashboard, LogOut, PackagePlus, UsersRound } from "lucide-react";
import type { Role } from "@prisma/client";
import { logoutAction } from "@/app/actions/auth";

const navigation = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: UsersRound },
  { href: "/envios", label: "Hojas", icon: Boxes },
  { href: "/envios/nueva", label: "Nueva hoja", icon: PackagePlus },
];

export function AppShell({ children, user }: { children: React.ReactNode; user: { name: string; email: string; role: Role } }) {
  return (
    <div className="min-h-screen bg-[#f4f6f8] lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="no-print bg-[#102a43] px-5 py-5 text-white lg:sticky lg:top-0 lg:h-screen lg:px-6 lg:py-7">
        <Link href="/dashboard" className="flex items-center gap-3" aria-label="Ir al resumen">
          <span className="grid size-10 place-items-center rounded-xl bg-[#18a6b8] shadow-lg shadow-cyan-950/30"><Boxes size={22} aria-hidden /></span>
          <span><span className="block text-xl font-extrabold tracking-tight">SendDesk</span><span className="block text-xs text-slate-300">Control de envíos</span></span>
        </Link>
        <nav className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:mt-10 lg:grid-cols-1" aria-label="Navegación principal">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"><Icon size={19} aria-hidden />{label}</Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-white/10 pt-5 lg:absolute lg:inset-x-6 lg:bottom-7">
          <div className="mb-3 min-w-0"><p className="truncate text-sm font-semibold">{user.name}</p><p className="truncate text-xs text-slate-400">{user.role === "ADMIN" ? "Administrador" : "Operador"}</p></div>
          <form action={logoutAction}><button className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white" type="submit"><LogOut size={17} aria-hidden /> Cerrar sesión</button></form>
        </div>
      </aside>
      <main className="min-w-0 p-4 sm:p-6 lg:p-9">{children}</main>
    </div>
  );
}

