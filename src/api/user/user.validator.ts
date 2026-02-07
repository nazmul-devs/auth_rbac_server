import { z } from "zod";

/* =========================
   Internal Schemas
========================= */

const createUserSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "user"]).default("user"),
});

const getUserSchema = z.object({
  id: z.string().cuid(),
  role: z.enum(["admin", "user"]).optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

class UserValidator {
  public createUser = z.object({
    body: createUserSchema,
  });
  public updateUser = z.object({
    body: createUserSchema.partial(),
    params: z.object({
      id: z.string().cuid(),
    }),
  });
  public deleteUser = z.object({
    params: z.object({
      id: z.string().cuid(),
    }),
  });
  public getUser = z.object({
    query: getUserSchema,
  });
}

export const userValidator = new UserValidator();
