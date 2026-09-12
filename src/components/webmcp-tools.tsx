"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type ToolDefinition = {
  name: string;
  title: string;
  description: string;
  inputSchema: object;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute(input: unknown): unknown | Promise<unknown>;
};

type ModelContext = {
  registerTool(tool: ToolDefinition, options?: { signal?: AbortSignal }): void | Promise<void>;
};

export function WebMcpTools() {
  const router = useRouter();
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();

    void Promise.resolve(context.registerTool({
      name: "search_senddesk_customers",
      title: "Buscar clientes",
      description: "Busca clientes de SendDesk por nombre, código o teléfono para completar una hoja.",
      inputSchema: { type: "object", properties: { query: { type: "string", minLength: 2 } }, required: ["query"], additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      async execute(input) {
        const query = typeof input === "object" && input && "query" in input ? String(input.query).trim() : "";
        if (query.length < 2) throw new Error("La búsqueda requiere al menos dos caracteres.");
        const response = await fetch(`/api/clientes?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error("No fue posible consultar el directorio.");
        return { customers: await response.json() };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);

    void Promise.resolve(context.registerTool({
      name: "start_senddesk_shipment",
      title: "Iniciar hoja de envío",
      description: "Abre la captura visible de una nueva hoja de hasta seis paquetes. No guarda datos por sí sola.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute() {
        router.push("/envios/nueva");
        return { status: "opened", path: "/envios/nueva" };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);

    return () => lifecycle.abort();
  }, [router]);

  return null;
}
