import { z } from "zod";
import { authValidator } from "../validators/auth.validator";

export type SignupDto = z.infer<typeof authValidator.signup>["body"];
export type SigninDto = z.infer<typeof authValidator.signin>["body"];
export type ResendVerificationDto = z.infer<
  typeof authValidator.resendVerification
>["body"];
export type VerifyEmailDto = z.infer<typeof authValidator.verifyEmail>["body"];
export type GetTokenDto = z.infer<typeof authValidator.getToken>["body"];
export type RegisterServiceDto = z.infer<
  typeof authValidator.registerService
>["body"];
