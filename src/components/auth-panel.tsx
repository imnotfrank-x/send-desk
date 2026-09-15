export function AuthPanel({ mode, children }: { mode: "login" | "register"; children: React.ReactNode }) {
  const registering = mode === "register";
  return (
    <div className="w-full">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#1769aa]">{registering ? "Nueva cuenta" : "Acceso interno"}</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#102a43]">{registering ? "Crea tu cuenta" : "Bienvenido"}</h1>
      <p className="mb-7 mt-2 text-slate-600">{registering ? "Regístrate para gestionar clientes y hojas de envío." : "Ingresa tu correo y contraseña para continuar."}</p>
      {children}
      {!registering && <p className="mt-6 text-center text-sm text-slate-500">Las cuentas son creadas por un administrador.</p>}
    </div>
  );
}
