import { describe, expect, it } from "vitest";
import { customerSchema, loginSchema } from "./validations";

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
