import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Escribe un correo válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export const customerSchema = z.object({
  id: z.string().optional(),
  code: z.string().trim().min(3, "El código es obligatorio.").max(20),
  name: z.string().trim().min(2, "El nombre es obligatorio.").max(100),
  phone: z.string().trim().min(7, "El teléfono es obligatorio.").max(25),
  address: z.string().trim().min(8, "La dirección es obligatoria.").max(240),
  notes: z.string().trim().max(300).optional(),
});

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

