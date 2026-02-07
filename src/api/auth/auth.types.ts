import { z } from "zod";
import { authValidator } from "./auth.validator";

export type SignupDto = z.infer<typeof authValidator.signup>["body"];
export type SigninDto = z.infer<typeof authValidator.signin>["body"];
export type ResendVerificationDto = z.infer<
  typeof authValidator.resendVerification
>["body"];
export type VerifyEmailDto = z.infer<typeof authValidator.verifyEmail>["body"];

export const SERVICE_GRANT_TYPE = "client_credentials" as const;

export interface GetServiceTokenPayload {
  clientId: string;
  clientSecret: string;
  grantType: typeof SERVICE_GRANT_TYPE;
}

export interface RegisterServicePayload {
  name: string;
  description?: string;
}
