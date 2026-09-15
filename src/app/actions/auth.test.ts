import { Prisma } from "@prisma/client";
import { compare, hash } from "bcryptjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loginAction, logoutAction, registerAction } from "./auth";
import { verifySessionToken } from "@/lib/auth";

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  findUnique: vi.fn(),
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
  redirect: vi.fn((path: string) => { throw new Error(`REDIRECT:${path}`); }),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { user: { create: mocks.create, findUnique: mocks.findUnique } } }));
vi.mock("next/headers", () => ({ cookies: async () => ({ set: mocks.setCookie, delete: mocks.deleteCookie }) }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

const validValues = {
  name: "  Persona Demo  ",
  email: "  NUEVA@senddesk.demo  ",
  password: "Registro123!",
  confirmPassword: "Registro123!",
};

function form(values: Record<string, string> = validValues) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("AUTH_SECRET", "senddesk-test-secret-with-at-least-32-characters");
  mocks.create.mockReset();
  mocks.findUnique.mockReset();
});

afterEach(() => vi.unstubAllEnvs());

describe("registro de usuarios", () => {
  it("normaliza los datos, guarda un hash y no permite elegir ADMIN", async () => {
    mocks.create.mockResolvedValue({ id: "new-user", role: "OPERADOR" });
    vi.stubEnv("NODE_ENV", "production");
    await expect(registerAction({}, form({ ...validValues, role: "ADMIN" }))).rejects.toThrow("REDIRECT:/jornada");
    const saved = mocks.create.mock.calls[0][0].data;
    expect(saved.name).toBe("Persona Demo");
    expect(saved.email).toBe("nueva@senddesk.demo");
    expect(saved.role).toBe("OPERADOR");
    expect(saved.password).toBeUndefined();
    expect(saved.confirmPassword).toBeUndefined();
    expect(saved.passwordHash).not.toBe(validValues.password);
    expect(await compare(validValues.password, saved.passwordHash)).toBe(true);
    const [cookieName, token, options] = mocks.setCookie.mock.calls[0];
    expect(cookieName).toBe("senddesk_session");
    expect(verifySessionToken(token)).toMatchObject({ userId: "new-user", role: "OPERADOR" });
    expect(options).toMatchObject({ httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 28800 });
  });

  it.each([
    ["name", " ", "name"],
    ["email", "correo-invalido", "email"],
    ["password", "corta", "password"],
    ["confirmPassword", "OtraClave123!", "confirmPassword"],
    ["password", "é".repeat(37), "password"],
  ])("rechaza %s inválido antes de guardar", async (field, value, errorField) => {
    const result = await registerAction({}, form({ ...validValues, [field]: value }));
    expect(result.fieldErrors?.[errorField]?.length).toBeGreaterThan(0);
    expect(mocks.create).not.toHaveBeenCalled();
    expect(mocks.setCookie).not.toHaveBeenCalled();
  });

  it("rechaza solicitudes sin campos", async () => {
    const result = await registerAction({}, new FormData());
    expect(result.fieldErrors).toHaveProperty("email");
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("maneja el correo duplicado incluso con registros simultáneos", async () => {
    mocks.create.mockRejectedValue(new Prisma.PrismaClientKnownRequestError("Unique constraint", { code: "P2002", clientVersion: "6.12.0" }));
    const result = await registerAction({}, form());
    expect(result.fieldErrors?.email?.[0]).toContain("ya tiene una cuenta");
    expect(mocks.setCookie).not.toHaveBeenCalled();
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("no filtra errores internos ni abre sesión si falla la base", async () => {
    mocks.create.mockRejectedValue(new Error("private database details"));
    const result = await registerAction({}, form());
    expect(result.error).toBe("No fue posible crear tu cuenta. Intenta de nuevo.");
    expect(mocks.setCookie).not.toHaveBeenCalled();
  });
});

describe("inicio y cierre de sesión existentes", () => {
  it("permite entrar con la cuenta nueva y mantiene su rol", async () => {
    mocks.findUnique.mockResolvedValue({ id: "new-user", role: "OPERADOR", passwordHash: await hash(validValues.password, 4) });
    await expect(loginAction({}, form())).rejects.toThrow("REDIRECT:/jornada");
    expect(mocks.findUnique).toHaveBeenCalledWith({ where: { email: "nueva@senddesk.demo" } });
    expect(verifySessionToken(mocks.setCookie.mock.calls[0][1])).toMatchObject({ userId: "new-user", role: "OPERADOR" });
  });

  it("conserva el acceso del administrador existente", async () => {
    mocks.findUnique.mockResolvedValue({ id: "admin-user", role: "ADMIN", passwordHash: await hash(validValues.password, 4) });
    await expect(loginAction({}, form())).rejects.toThrow("REDIRECT:/dashboard");
    expect(verifySessionToken(mocks.setCookie.mock.calls[0][1])).toMatchObject({ userId: "admin-user", role: "ADMIN" });
  });

  it("rechaza contraseñas incorrectas", async () => {
    mocks.findUnique.mockResolvedValue({ id: "user", role: "OPERADOR", passwordHash: await hash("OtraClave123!", 4) });
    expect(await loginAction({}, form())).toEqual({ error: "Correo o contraseña incorrectos." });
    expect(mocks.setCookie).not.toHaveBeenCalled();
  });

  it("elimina la cookie al cerrar sesión", async () => {
    await expect(logoutAction()).rejects.toThrow("REDIRECT:/login");
    expect(mocks.deleteCookie).toHaveBeenCalledWith("senddesk_session");
  });
});
