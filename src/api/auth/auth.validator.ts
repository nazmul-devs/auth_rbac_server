import { z } from "zod";
import { BaseValidator } from "../../base/base.validator";

export class AuthValidator extends BaseValidator {
  private static signupSchema = z.object({
    name: z.string().min(3),
    email: BaseValidator.email,
    password: BaseValidator.password,
  });

  private static loginSchema = z.object({
    identifier: z.string(),
    password: z.string().min(6),
    trustDevice: z.boolean().default(false),
  });

  static signup = z.object({ body: this.signupSchema });
  static login = z.object({ body: this.loginSchema });
}

// @types
export type SignupDto = z.infer<typeof AuthValidator.signup>;
export type LoginDto = z.infer<typeof AuthValidator.login>;
