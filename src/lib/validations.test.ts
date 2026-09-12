import { describe, expect, it } from "vitest";
import { customerSchema, loginSchema, shipmentSchema } from "./validations";

describe("validaciones de acceso", () => {
  it("acepta credenciales con formato válido", () => {
    expect(loginSchema.safeParse({ email: "admin@senddesk.demo", password: "Demo1234!" }).success).toBe(true);
  });

  it("rechaza correo inválido y contraseña corta", () => {
    expect(loginSchema.safeParse({ email: "admin", password: "123" }).success).toBe(false);
  });
});

describe("validaciones de clientes", () => {
  it("acepta un cliente completo", () => {
    expect(customerSchema.safeParse({ code: "CLI-100", name: "Cliente Ficticio", phone: "5550101000", address: "Avenida de Prueba 100" }).success).toBe(true);
  });

  it("rechaza datos insuficientes", () => {
    expect(customerSchema.safeParse({ code: "C", name: "", phone: "1", address: "Corta" }).success).toBe(false);
  });
});

const validParcel = {
  packageNumber: "PKG-001",
  senderName: "Remitente Demo",
  senderPhone: "5550101000",
  senderAddress: "Avenida de Prueba 100",
  recipientName: "Destino Demo",
  recipientPhone: "5550102000",
  recipientAddress: "Calle de Prueba 200",
  weight: 2.5,
  description: "Contenido ficticio",
};

describe("validaciones de hojas", () => {
  it("acepta entre uno y seis paquetes", () => {
    expect(shipmentSchema.safeParse({ parcels: [validParcel] }).success).toBe(true);
    expect(shipmentSchema.safeParse({ parcels: Array.from({ length: 6 }, (_, index) => ({ ...validParcel, packageNumber: `PKG-${index}` })) }).success).toBe(true);
  });

  it("rechaza una séptima posición", () => {
    expect(shipmentSchema.safeParse({ parcels: Array.from({ length: 7 }, (_, index) => ({ ...validParcel, packageNumber: `PKG-${index}` })) }).success).toBe(false);
  });

  it("rechaza números de paquete repetidos", () => {
    expect(shipmentSchema.safeParse({ parcels: [validParcel, validParcel] }).success).toBe(false);
  });
});
