import jwt from "jsonwebtoken";
import { BaseService } from "../../../base";
import { authConfig } from "../config/auth.config";

export class TrustedDeviceService extends BaseService {
  async markTrusted(userId: string) {
    const token = jwt.sign(
      { userId, deviceId: crypto.randomUUID() },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" },
    );

    const key = `trusted_device:${userId}:${token}`;
    await this.cache.set(key, "1", { ttl: authConfig.TRUSTED_DEVICE_TTL });

    return token;
  }

  async revoke(token: string) {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    await this.cache.del(`trusted_device:${payload.userId}:${token}`);
  }

  async isTrusted(token: string) {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return Boolean(
      await this.cache.get(`trusted_device:${payload.userId}:${token}`),
    );
  }
}
