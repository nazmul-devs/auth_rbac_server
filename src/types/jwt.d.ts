export interface JWTPayload {
  userId: string;
  email?: string;
  role?: "user" | "admin" | "superadmin";
  iat?: number;
  exp?: number;
}
