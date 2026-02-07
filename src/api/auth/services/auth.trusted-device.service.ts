import crypto from "crypto";
import jwt from "jsonwebtoken";

import { BaseService } from "../../../core/base";
import { cacheService } from "../../../core/cache";
import { authConfig } from "../auth.config";

export class TrustedDeviceService extends BaseService {
  private buildKey(userId: string, token: string) {
    return `trusted_device:${userId}:${token}`;
  }

  async markTrusted(userId: string) {
    try {
      const token = jwt.sign(
        { userId, deviceId: crypto.randomUUID() },
        process.env.JWT_SECRET!,
        { expiresIn: "30d" },
      );

      const key = this.buildKey(userId, token);

      await cacheService.set(key, "1", authConfig.TRUSTED_DEVICE_TTL);

      return token;
    } catch (error) {
      console.error("[TrustedDevice] markTrusted failed:", error);
      throw error;
    }
  }

  async revoke(token: string) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
      };

      const key = this.buildKey(payload.userId, token);

      await cacheService.del(key);
    } catch (error) {
      console.error("[TrustedDevice] revoke failed:", error);
      throw error;
    }
  }

  async isTrusted(token: string) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
      };

      const key = this.buildKey(payload.userId, token);

      const result = await cacheService.get(key);

      return Boolean(result);
    } catch (error) {
      console.error("[TrustedDevice] isTrusted failed:", error);
      return false;
    }
  }
}
