import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Escribe un correo válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre completo.").max(100, "Usa como máximo 100 caracteres."),
  email: z.string().trim().email("Escribe un correo válido.").max(254).toLowerCase(),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres.")
    .refine((value) => new TextEncoder().encode(value).length <= 72, "La contraseña es demasiado larga; usa como máximo 72 bytes."),
  confirmPassword: z.string().min(1, "Confirma tu contraseña."),
}).refine((values) => values.password === values.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});

export const customerSchema = z.object({
  id: z.string().optional(),
  code: z.string().trim().min(3, "El código es obligatorio.").max(20),
  name: z.string().trim().min(2, "El nombre es obligatorio.").max(100),
  phone: z.string().trim().min(7, "El teléfono es obligatorio.").max(25),
  address: z.string().trim().min(8, "La dirección es obligatoria.").max(240),
  notes: z.string().trim().max(300).optional(),
});

export const parcelSchema = z.object({
  packageNumber: z.string().trim().min(2, "Cada paquete necesita un número.").max(40),
  senderName: z.string().trim().min(2, "Completa el nombre del remitente.").max(100),
  senderPhone: z.string().trim().min(7, "Completa el teléfono del remitente.").max(25),
  senderAddress: z.string().trim().min(8, "Completa la dirección del remitente.").max(240),
  recipientName: z.string().trim().min(2, "Completa el nombre del destinatario.").max(100),
  recipientPhone: z.string().trim().min(7, "Completa el teléfono del destinatario.").max(25),
  recipientAddress: z.string().trim().min(8, "Completa la dirección del destinatario.").max(240),
  weight: z.number().positive("El peso debe ser mayor a cero.").max(10000),
  description: z.string().trim().min(2, "Agrega una descripción.").max(300),
});

export const shipmentSchema = z.object({
  parcels: z.array(parcelSchema).min(1, "Agrega al menos un paquete.").max(6, "Una hoja admite como máximo seis paquetes."),
}).superRefine(({ parcels }, context) => {
  const numbers = parcels.map((parcel) => parcel.packageNumber.toLocaleLowerCase());
  if (new Set(numbers).size !== numbers.length) {
    context.addIssue({ code: "custom", message: "Los números de paquete no pueden repetirse en la misma hoja.", path: ["parcels"] });
  }
});

export type ParcelInput = z.infer<typeof parcelSchema>;

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};
