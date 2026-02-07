import { z } from "zod";

export const baseValidator = {
  // ---------- ID ----------
  id: z.string().uuid("Invalid ID format"),

  // ---------- EMAIL ----------
  email: z.string().email("Invalid email address"),

  // ---------- PASSWORD ----------
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Must contain special character"),

  // ---------- PHONE ----------
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/, "Invalid phone number format"),

  // ---------- BOOLEAN ----------
  boolean: z.boolean(),

  // ---------- STATUS ----------
  status: z.enum(["ACTIVE", "INACTIVE", "DELETED"]),

  // ---------- PAGINATION ----------
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().optional(),
  }),

  // ---------- DATES ----------
  date: z.coerce.date(),

  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
};
