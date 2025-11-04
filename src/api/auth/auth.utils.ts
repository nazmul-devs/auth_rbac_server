import crypto from "crypto";

export class AuthUtils {
  static generateUsername(fullName: string): string {
    const base = fullName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    const randomNum = Math.floor(100 + Math.random() * 900);
    return `${base}.${randomNum}`;
  }

  static generateTempPassword(length = 12): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    const randomBytes = crypto.randomBytes(length);

    return [...randomBytes].map((byte) => chars[byte % chars.length]).join("");
  }
}
