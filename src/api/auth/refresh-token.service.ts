import jwt from "jsonwebtoken";
import crypto from "crypto";
import { BaseService } from "../../base/BaseService";
import { RefreshToken } from "../../generated/prisma";

export class RefreshTokenService extends BaseService {
  private JWT_SECRET = process.env.JWT_SECRET!;
  private REFRESH_SECRET = process.env.REFRESH_SECRET!;
  private REFRESH_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

  // Helper: hash token for DB storage
  private hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  // Generate Access Token
  generateAccessToken(userId: string) {
    return jwt.sign({ userId }, this.JWT_SECRET, { expiresIn: "15m" });
  }

  // Generate Refresh Token (random string)
  generateRefreshToken() {
    return crypto.randomBytes(64).toString("hex");
  }

  // Save refresh token in DB
  async createRefreshToken(
    userId: string
  ): Promise<{ token: string; hashedToken: string; expiresAt: Date }> {
    const token = this.generateRefreshToken();
    const hashedToken = this.hashToken(token);
    const expiresAt = new Date(Date.now() + this.REFRESH_EXPIRY);

    await this.db.refreshToken.create({
      data: {
        user_id: userId,
        token_hash: hashedToken,
        expires_at: expiresAt,
      },
    });

    return { token, hashedToken, expiresAt };
  }

  // Validate refresh token
  async validateRefreshToken(token: string): Promise<RefreshToken> {
    const hashedToken = this.hashToken(token);

    const tokenRecord = await this.db.refreshToken.findFirst({
      where: { token_hash: hashedToken },
    });

    if (!tokenRecord) throw new Error("Refresh token not found");
    if (tokenRecord.revoked) throw new Error("Refresh token revoked");
    if (tokenRecord.expires_at < new Date())
      throw new Error("Refresh token expired");

    return tokenRecord;
  }

  // Rotate refresh token (revoke old, create new)
  async rotateRefreshToken(
    oldToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const oldTokenRecord = await this.validateRefreshToken(oldToken);

    // revoke old token
    await this.db.refreshToken.update({
      where: { id: oldTokenRecord.id },
      data: { revoked: true },
    });

    // create new refresh token
    const { token: newToken } = await this.createRefreshToken(
      oldTokenRecord.user_id
    );

    // generate new access token
    const accessToken = this.generateAccessToken(oldTokenRecord.user_id);

    return { accessToken, refreshToken: newToken };
  }

  // Revoke a refresh token
  async revokeToken(token: string) {
    const hashedToken = this.hashToken(token);
    await this.db.refreshToken.updateMany({
      where: { token_hash: hashedToken },
      data: { revoked: true },
    });
  }
}

/*


const refreshService = new RefreshTokenService();

/---- On login
const { token: refreshToken, expiresAt } = await refreshService.createRefreshToken(user.id);
const accessToken = refreshService.generateAccessToken(user.id);

/---- On refresh
const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await refreshService.rotateRefreshToken(oldRefreshToken);

/---- On logout
await refreshService.revokeToken(refreshToken);





*/
