import Link from "next/link";

export function AuthPanel({ mode, children }: { mode: "login" | "register"; children: React.ReactNode }) {
  const registering = mode === "register";
  return (
    <div className="w-full">
      <nav aria-label="Opciones de acceso" className="mb-7 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
        {[
          { href: "/login", label: "Iniciar sesión", active: !registering },
          { href: "/registro", label: "Registrarse", active: registering },
        ].map(({ href, label, active }) => (
          <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`rounded-lg px-3 py-2.5 text-center text-sm font-semibold transition ${active ? "bg-white text-[#1769aa] shadow-sm" : "text-slate-500 hover:text-[#102a43]"}`}>
            {label}
          </Link>
        ))}
      </nav>
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1769aa]">{registering ? "Nueva cuenta" : "Acceso interno"}</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#102a43]">{registering ? "Crea tu cuenta" : "Bienvenido"}</h1>
      <p className="mb-7 mt-2 text-slate-600">{registering ? "Regístrate para gestionar clientes y hojas de envío." : "Ingresa tu correo y contraseña para continuar."}</p>
      {children}
      <p className="mt-6 text-center text-sm text-slate-600">
        {registering ? "¿Ya tienes una cuenta?" : "¿Eres nuevo en SendDesk?"}{" "}
        <Link href={registering ? "/login" : "/registro"} className="font-semibold text-[#1769aa] hover:underline">
          {registering ? "Inicia sesión" : "Crea una cuenta"}
        </Link>
      </p>
    </div>
  );
}
