import { z } from "zod";

export const baseValidator = {
  id: z.string().min(10),

  email: z.string().email("Invalid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Must contain at least one special character"
    ),

  phone: z.string().regex(/^\+?\d{7,15}$/, "Invalid phone number format"),

  boolean: z.boolean(),

  status: z.enum(["ACTIVE", "INACTIVE", "DELETED"]),

  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
  }),

  date: z.coerce.date(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
};
