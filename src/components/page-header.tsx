export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="mb-1 text-sm font-bold uppercase tracking-[0.18em] text-[#1769aa]">SendDesk</p><h1 className="text-3xl font-extrabold tracking-tight text-[#102a43] sm:text-4xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-slate-600">{description}</p>}</div>
      {action}
    </header>
  );
}

