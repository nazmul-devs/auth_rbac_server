import { z } from "zod";
import { baseValidator } from "../../../base";
/* =========================
   Internal Schemas
========================= */

const signupBodySchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters"),
  email: baseValidator.email,
  password: baseValidator.password,
  username: z
    .string()
    .trim()
    .min(3)
    .max(20)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    )
    .optional(),
});

const signinBodySchema = z.object({
  identifier: z.string().trim(),
  password: z.string().min(6),
  trustDevice: z.boolean().default(false),
});

/* =========================
   Public Request Schemas
========================= */

export const authValidator = {
  signup: z.object({
    body: signupBodySchema,
  }),

  signin: z.object({
    body: signinBodySchema,
  }),

  resendVerification: z.object({
    body: z.object({
      email: baseValidator.email,
    }),
  }),

  verifyEmail: z.object({
    body: z.object({
      token: z
        .string()
        .trim()
        .length(64, "Invalid or expired verification token"),
    }),
  }),

  getToken: z.object({
    body: z.object({
      clientId: z.string().min(1, "Client ID is required"),
      clientSecret: z.string().min(1, "Client Secret is required"),
      grantType: z.literal("client_credentials").default("client_credentials"),
    }),
  }),

  registerService: z.object({
    body: z.object({
      name: z.string().min(1, "Service name is required"),
      description: z.string().optional(),
    }),
  }),
};
