import { z } from "zod";
import { BaseValidator } from "../../base/BaseValidator";

export class UserValidator extends BaseValidator {
  protected schema = z.object({
    body: z.object({
      name: z.string().min(3, "Name must be at least 3 characters"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      role: z.enum(["admin", "user"]).default("user"),
    }),
  });

  // ✅ Additional use-cases (optional)
  static loginSchema = z.object({
    body: z.object({
      email: z.string().email(),
      password: z.string(),
    }),
  });
}
