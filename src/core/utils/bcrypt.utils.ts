// src/core/utils/bcrypt.util.ts
import bcrypt from "bcrypt";
import { config } from "../config/env.config";

export class BcryptUtil {
  /**
   * Hash a plain text password
   * @param password string
   * @returns Promise<string>
   */
  static async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(config.SALT_ROUNDS);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare a plain password with a hashed password
   * @param password string
   * @param hashed string
   * @returns Promise<boolean>
   */
  static async compare(password: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(password, hashed);
  }
}
