import { z } from "zod";
import { BaseValidator } from "../../base/base.validator";

export class AuthValidator extends BaseValidator {
  private static signupSchema = z.object({
    name: z.string().min(3),
    email: BaseValidator.email,
    password: BaseValidator.password,
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters long.")
      .max(20, "Username must be less than 20 characters.")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores."
      )
      .optional(),
  });

  private static signinSchema = z.object({
    identifier: z.string(),
    password: z.string().min(6),
    trustDevice: z.boolean().default(false),
  });

  static signup = z.object({ body: this.signupSchema });

  static signin = z.object({ body: this.signinSchema });
  static verifyEmail = z.object({
    body: z.object({
      token: z
        .string()
        .trim()
        .length(64, "Invalid or expired verification token."),
    }),
  });
}

// @types
export type SignupDto = z.infer<typeof AuthValidator.signup>;
export type SigninDto = z.infer<typeof AuthValidator.signin>;
export type VerifyEmailDto = z.infer<typeof AuthValidator.verifyEmail>;
