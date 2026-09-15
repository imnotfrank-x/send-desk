import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { buildShipmentPdf, buildWorkdayPdf } from "./pdf";

describe("PDF de hoja de envío", () => {
  it("genera un documento A4 horizontal de una página", async () => {
    const bytes = await buildShipmentPdf({
      sheetNumber: "HD-TEST-001",
      createdAt: new Date("2026-09-12T12:00:00Z"),
      createdBy: { name: "Usuario Demo" },
      parcels: [{
        position: 1,
        packageNumber: "PKG-TEST-001",
        senderName: "Remitente Demo",
        senderPhone: "555 010 1000",
        senderAddress: "Avenida de Prueba 100, Ciudad Demo",
        recipientName: "Destinatario Demo",
        recipientPhone: "555 010 2000",
        recipientAddress: "Calle de Prueba 200, Ciudad Demo",
        weight: 2.5,
        description: "Contenido ficticio",
      }],
    });
    const document = await PDFDocument.load(bytes);
    expect(document.getPageCount()).toBe(1);
    const { width, height } = document.getPage(0).getSize();
    expect(width).toBeGreaterThan(height);
    expect(new TextDecoder().decode(bytes.slice(0, 4))).toBe("%PDF");
  });
});

describe("PDF de jornada", () => {
  it("conserva todas las hojas en un documento multipágina", async () => {
    const sheet = {
      sheetNumber: "HD-TEST-001",
      createdAt: new Date("2026-09-12T12:00:00Z"),
      createdBy: { name: "Usuario Demo" },
      parcels: [{
        position: 1, span: 2, packageCount: 3, packageNumber: "PKG-TEST-001",
        senderName: "Remitente Demo", senderPhone: "555 010 1000", senderAddress: "Avenida de Prueba 100",
        recipientName: "Destinatario Demo", recipientPhone: "555 010 2000", recipientAddress: "Calle de Prueba 200",
        weight: 2.5, description: "Contenido ficticio",
      }],
    };
    const bytes = await buildWorkdayPdf([sheet, { ...sheet, sheetNumber: "HD-TEST-002" }]);
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(2);
  });
});
