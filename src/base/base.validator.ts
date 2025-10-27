import { z } from "zod";

export class BaseValidator {
  // ===== Common Fields =====
  static id = z.string().min(10);

  static email = z.string().email("Invalid email address");

  static password = z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Must contain at least one special character"
    );

  static phone = z
    .string()
    .regex(/^\+?\d{7,15}$/, "Invalid phone number format");

  static boolean = z.boolean().optional();

  static status = z.enum(["ACTIVE", "INACTIVE", "DELETED"]);

  // ===== Common Filters =====
  static pagination = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
  });

  // ===== Common Dates =====
  static date = z.coerce.date();

  static createdAt = z.string().datetime().optional();
  static updatedAt = z.string().datetime().optional();
}
