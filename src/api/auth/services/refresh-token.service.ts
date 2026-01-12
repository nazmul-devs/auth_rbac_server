import { BaseService } from "../../../base";
import { authConfig } from "../config/auth.config";
import { randomToken, sha256 } from "../utils/hash.util";

export class RefreshTokenService extends BaseService {
  async createToken(userId: string) {
    const token = randomToken();
    const hash = sha256(token);
    const expiresAt = new Date(
      Date.now() + authConfig.REFRESH_TOKEN_EXPIRES_MS
    );

    await this.db.refreshToken.create({
      data: { user_id: userId, token_hash: hash, expires_at: expiresAt },
    });

    return token;
  }

  async rotate(oldToken: string) {
    const hash = sha256(oldToken);

    return this.db.$transaction(async (tx) => {
      const record = await tx.refreshToken.findFirst({
        where: { token_hash: hash },
      });

      if (!record || record.revoked || record.expires_at < new Date())
        throw new Error("Invalid refresh token");

      await tx.refreshToken.update({
        where: { id: record.id },
        data: { revoked: true },
      });

      const newToken = randomToken();
      const newHash = sha256(newToken);
      const expiresAt = new Date(
        Date.now() + authConfig.REFRESH_TOKEN_EXPIRES_MS
      );

      await tx.refreshToken.create({
        data: {
          user_id: record.user_id,
          token_hash: newHash,
          expires_at: expiresAt,
        },
      });

      return { userId: record.user_id, refreshToken: newToken };
    });
  }

  async revoke(token: string) {
    await this.db.refreshToken.updateMany({
      where: { token_hash: sha256(token) },
      data: { revoked: true },
    });
  }
}
