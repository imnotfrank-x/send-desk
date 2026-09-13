import { Boxes } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#102a43] px-4 py-8 sm:grid sm:place-items-center">
      <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid md:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden min-h-[680px] overflow-hidden bg-[#1769aa] p-12 text-white md:flex md:flex-col md:justify-between">
          <div className="absolute -right-24 -top-24 size-72 rounded-full border-[42px] border-white/10" />
          <div className="absolute -bottom-28 -left-24 size-80 rounded-full bg-[#18a6b8]/50" />
          <div className="relative flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-white/15"><Boxes size={24} aria-hidden /></span><span className="text-2xl font-extrabold">SendDesk</span></div>
          <div className="relative"><p className="max-w-md text-4xl font-extrabold leading-tight tracking-tight">De la hoja física al control digital.</p><p className="mt-5 max-w-sm text-lg leading-7 text-blue-100">Clientes, paquetes y hojas de envío en un solo lugar, listo para operar.</p></div>
          <p className="relative text-sm text-blue-100">MVP académico · Datos de demostración</p>
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-10">
          <div className="mb-7 flex items-center gap-3 md:hidden"><span className="grid size-10 place-items-center rounded-xl bg-[#1769aa] text-white"><Boxes size={21} aria-hidden /></span><span className="text-xl font-extrabold text-[#102a43]">SendDesk</span></div>
          {children}
        </div>
      </section>
    </main>
  );
}
