import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

export type ShipmentPdfData = {
  sheetNumber: string;
  createdAt: Date;
  createdBy: { name: string };
  parcels: Array<{
    position: number;
    span?: number;
    packageCount?: number;
    packageNumber: string;
    senderName: string;
    senderPhone: string;
    senderAddress: string;
    recipientName: string;
    recipientPhone: string;
    recipientAddress: string;
    weight: number;
    description: string;
  }>;
};

const navy = rgb(16 / 255, 42 / 255, 67 / 255);
const blue = rgb(23 / 255, 105 / 255, 170 / 255);
const cyan = rgb(24 / 255, 166 / 255, 184 / 255);
const orange = rgb(242 / 255, 140 / 255, 40 / 255);
const slate = rgb(71 / 255, 85 / 255, 105 / 255);
const line = rgb(203 / 255, 213 / 255, 225 / 255);
const pale = rgb(248 / 255, 250 / 255, 252 / 255);

export async function buildShipmentPdf(shipment: ShipmentPdfData) {
  const document = await PDFDocument.create();
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  drawShipmentPage(document, shipment, regular, bold, 1, 1);
  return document.save();
}

export async function buildWorkdayPdf(shipments: ShipmentPdfData[]) {
  const document = await PDFDocument.create();
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);
  shipments.forEach((shipment, index) => drawShipmentPage(document, shipment, regular, bold, index + 1, shipments.length));
  return document.save();
}

function drawShipmentPage(document: PDFDocument, shipment: ShipmentPdfData, regular: PDFFont, bold: PDFFont, pageNumber: number, pageCount: number) {
  const page = document.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });
  page.drawRectangle({ x: 0, y: height - 78, width, height: 78, color: navy });
  page.drawRectangle({ x: 0, y: height - 82, width, height: 4, color: orange });
  page.drawText("SENDDESK", { x: 32, y: height - 40, size: 20, font: bold, color: rgb(1, 1, 1) });
  page.drawText("HOJA DIGITAL DE ENVIO", { x: 32, y: height - 59, size: 9, font: bold, color: cyan });
  page.drawText(shipment.sheetNumber, { x: 265, y: height - 43, size: 20, font: bold, color: rgb(1, 1, 1) });
  const captured = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Mexico_City" }).format(shipment.createdAt);
  page.drawText(`Fecha: ${captured}`, { x: 620, y: height - 34, size: 8.5, font: regular, color: rgb(0.9, 0.94, 0.97) });
  page.drawText(`Capturo: ${clean(shipment.createdBy.name)}`, { x: 620, y: height - 50, size: 8.5, font: regular, color: rgb(0.9, 0.94, 0.97) });
  const packageCount = shipment.parcels.reduce((total, parcel) => total + (parcel.packageCount ?? 1), 0);
  page.drawText(`Paquetes: ${packageCount}`, { x: 620, y: height - 66, size: 8.5, font: regular, color: rgb(0.9, 0.94, 0.97) });

  const margin = 24;
  const gap = 10;
  const top = height - 98;
  const footer = 20;
  const cellWidth = (width - margin * 2 - gap) / 2;
  const cellHeight = (top - footer - gap * 2) / 3;

  for (let index = 0; index < 6; index += 1) {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = margin + column * (cellWidth + gap);
    const y = top - (row + 1) * cellHeight - row * gap;
    const position = index + 1;
    const parcel = shipment.parcels.find((item) => item.position === position);
    const owner = shipment.parcels.find((item) => position > item.position && position < item.position + (item.span ?? 1));
    drawParcelCell(page, parcel, position, x, y, cellWidth, cellHeight, regular, bold, owner?.position);
  }

  page.drawText("Documento generado por SendDesk - MVP academico", { x: margin, y: 7, size: 7, font: regular, color: slate });
  page.drawText(`${pageNumber} / ${pageCount}`, { x: width - 48, y: 7, size: 7, font: regular, color: slate });
}

function drawParcelCell(page: PDFPage, parcel: ShipmentPdfData["parcels"][number] | undefined, position: number, x: number, y: number, width: number, height: number, regular: PDFFont, bold: PDFFont, absorbedBy?: number) {
  page.drawRectangle({ x, y, width, height, borderColor: line, borderWidth: 0.9, color: rgb(1, 1, 1) });
  page.drawRectangle({ x, y: y + height - 27, width, height: 27, color: parcel ? pale : rgb(0.98, 0.98, 0.98) });
  page.drawCircle({ x: x + 18, y: y + height - 13.5, size: 9.5, color: parcel ? blue : line });
  page.drawText(String(position), { x: x + 15.5, y: y + height - 17, size: 9, font: bold, color: rgb(1, 1, 1) });
  page.drawText(`PAQUETE ${position}`, { x: x + 34, y: y + height - 17, size: 9, font: bold, color: navy });

  if (!parcel) {
    page.drawText(absorbedBy ? `ESPACIO ABSORBIDO POR BLOQUE ${absorbedBy}` : "POSICION DISPONIBLE", { x: x + width / 2 - (absorbedBy ? 75 : 43), y: y + height / 2 - 3, size: 8, font: bold, color: absorbedBy ? blue : line });
    return;
  }

  page.drawText(clean(parcel.packageNumber), { x: x + width - 118, y: y + height - 17, size: 9, font: bold, color: orange, maxWidth: 108 });
  if ((parcel.span ?? 1) > 1) page.drawText(`EXPANDIDO x${parcel.span}`, { x: x + 120, y: y + height - 17, size: 7, font: bold, color: blue });
  const infoY = y + height - 48;
  label(page, "PESO", `${parcel.weight.toFixed(2)} kg`, x + 14, infoY, regular, bold);
  label(page, "DESCRIPCION", clean(parcel.description), x + 92, infoY, regular, bold, width - 105);
  page.drawLine({ start: { x: x + 14, y: infoY - 26 }, end: { x: x + width - 14, y: infoY - 26 }, color: line, thickness: 0.7 });

  const columnsY = infoY - 43;
  contact(page, "REMITENTE", parcel.senderName, parcel.senderPhone, parcel.senderAddress, x + 14, columnsY, width / 2 - 22, regular, bold);
  page.drawLine({ start: { x: x + width / 2, y: y + 12 }, end: { x: x + width / 2, y: columnsY + 8 }, color: line, thickness: 0.7 });
  contact(page, "DESTINATARIO", parcel.recipientName, parcel.recipientPhone, parcel.recipientAddress, x + width / 2 + 10, columnsY, width / 2 - 24, regular, bold);
}

function label(page: PDFPage, title: string, value: string, x: number, y: number, regular: PDFFont, bold: PDFFont, maxWidth = 72) {
  page.drawText(title, { x, y, size: 6.5, font: bold, color: blue });
  page.drawText(value, { x, y: y - 12, size: 8.5, font: regular, color: navy, maxWidth });
}

function contact(page: PDFPage, title: string, name: string, phone: string, address: string, x: number, y: number, maxWidth: number, regular: PDFFont, bold: PDFFont) {
  page.drawText(title, { x, y, size: 7, font: bold, color: blue });
  page.drawText(clean(name), { x, y: y - 14, size: 8, font: bold, color: navy, maxWidth });
  page.drawText(clean(phone), { x, y: y - 27, size: 7.5, font: regular, color: slate, maxWidth });
  const lines = wrap(clean(address), regular, 7.2, maxWidth).slice(0, 3);
  lines.forEach((lineText, index) => page.drawText(lineText, { x, y: y - 41 - index * 10, size: 7.2, font: regular, color: slate }));
}

function wrap(value: string, font: PDFFont, size: number, maxWidth: number) {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) current = candidate;
    else { if (current) lines.push(current); current = word; }
  }
  if (current) lines.push(current);
  return lines;
}

function clean(value: string) {
  return value.replace(/[–—]/g, "-").replace(/[^\x20-\x7EÀ-ÿ]/g, "");
}

