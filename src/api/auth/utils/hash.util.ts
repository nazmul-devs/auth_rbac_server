import crypto from "crypto";

export function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function randomToken(bytes = 64): string {
  return crypto.randomBytes(bytes).toString("hex");
}
