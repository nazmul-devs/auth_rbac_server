import crypto from "crypto";
import { authService } from ".";
import { BaseService } from "../../../base";
import { throwValidation } from "../../../core/errors/errors";
import { eventBus } from "../../../core/events/event-bul.service";
import { BcryptUtil } from "../../../core/utils/bcrypt.utils";
import jwtUtils from "../../../core/utils/jwt.utils";
import { ServiceReturnDto } from "../../../core/utils/responseHandler";
import { authConfig } from "../config/auth.config";
import { authConstants } from "../constants/auth.constants";
import {
  GetServiceTokenPayload,
  RegisterServicePayload,
  SERVICE_GRANT_TYPE,
} from "../types/auth.types";
import { AuthUtils } from "../utils/auth.utils";
import { randomToken } from "../utils/hash.util";
import { generateAccessToken } from "../utils/token.util";

export class AuthService extends BaseService {
  async signup(payload: any) {
    const { name, email, password, username } = payload;

    const exists = await this.db.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (exists) {
      throwValidation("User already exists");
    }

    const passwordHash = await BcryptUtil.hash(password);

    const verifyToken = randomToken(32);
    const verifyExpires = new Date(
      Date.now() + authConfig.EMAIL_VERIFY_EXPIRES_MS,
    );

    const user = await this.db.user.create({
      data: {
        name,
        email,
        username: username || AuthUtils.generateUsername(name),
        password_hash: passwordHash,
        verification_token: verifyToken,
        verification_expires: verifyExpires,
      },
    });

    const link = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}`;

    eventBus.publish("email_verification:signup", {
      email: user.email,
      name: user.name,
      verificationLink: link,
    });

    return { message: "Registration successful. Check email." };
  }

  async signin(payload: any) {
    const { identifier, password, trustDevice } = payload;

    const user = await this.db.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] },
    });

    if (!user) return this.throwUnauthorized("Invalid credentials");
    if (user?.status !== "ACTIVE") this.throwUnauthorized("Email not verified");

    const match = await BcryptUtil.compare(password, user.password_hash);
    if (!match) this.throwUnauthorized("Invalid credentials");

    const accessToken = generateAccessToken({
      id: user?.id,
      email: user?.email,
      username: user?.username,
    });

    const refreshToken = await authService.refreshToken.createToken(user?.id);

    let trustedDeviceToken = null;
    if (trustDevice) {
      trustedDeviceToken = await authService.trustedDevice.markTrusted(user.id);
    }

    return {
      message: "Signin successful",
      data: { accessToken, refreshToken, trustedDeviceToken },
    };
  }

  async refresh(payload: any) {
    const { refreshToken } = payload;

    const result = await authService.refreshToken.rotate(refreshToken);

    const accessToken = generateAccessToken({ id: result.userId });

    return {
      message: "Token refreshed",
      data: { accessToken, refreshToken: result.refreshToken },
    };
  }

  async signout(payload: any) {
    if (payload.refreshToken)
      await authService.refreshToken.revoke(payload.refreshToken);

    if (payload.trustedDeviceToken)
      await authService.trustedDevice.revoke(payload.trustedDeviceToken);

    return { message: "Signout successful" };
  }

  async me(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        status: true,
        created_at: true,
        two_fa_enabled: true,
      },
    });

    if (!user) this.throwError("User not found");

    return {
      message: "User profile",
      data: user,
    };
  }

  refreshToken = async (payload: any) => {
    const { refreshToken } = payload;

    if (!refreshToken) return this.throwUnauthorized("Refresh token missing.");

    let decoded;
    try {
      decoded = jwtUtils.verifyRefreshToken(refreshToken);
    } catch {
      return this.throwUnauthorized("Invalid refresh token.");
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const storedToken = await this.db.refreshToken.findUnique({
      where: { token_hash: hashedToken },
    });

    // If token does not exist or is revoked -> Force login
    if (!storedToken || storedToken.revoked)
      return this.throwUnauthorized("Session expired. Please login again.");

    // Expired token -> Force login
    if (storedToken.expires_at < new Date())
      return this.throwUnauthorized(
        "Refresh token expired. Please login again.",
      );

    // ✅ Token is valid → Rotate it (Revoke old one & create new one)
    await this.db.refreshToken.update({
      where: { token_hash: hashedToken },
      data: { revoked: true },
    });

    // Fetch user
    const user = await this.db.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, username: true, name: true },
    });

    if (!user) return this.throwUnauthorized("User no longer exists.");

    // Create new tokens
    const newAccessToken = jwtUtils.generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    const newRefreshToken = jwtUtils.generateRefreshToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    // Store hashed new refresh token
    const newHashedToken = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    await this.db.refreshToken.create({
      data: {
        user_id: user.id,
        token_hash: newHashedToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      message: "Token refreshed successfully.",
      data: {
        token: newAccessToken,
        refreshToken: newRefreshToken,
        user,
      },
    };
  };

  // ---------------------------
  // ✉️ Verify Email
  // ---------------------------
  verifyEmail = async (payload: any) => {
    const user = await this.db.user.findFirst({
      where: { verification_token: payload.token },
    });

    if (!user) {
      return this.throwError("Invalid verification token.");
    }

    if (user.verification_expires && user.verification_expires < new Date()) {
      throw new Error("Verification link expired. Please register again.");
    }

    await this.db.user.update({
      where: { id: user.id },
      data: {
        status: "ACTIVE",
        verification_token: null,
        verification_expires: null,
      },
    });

    return { message: "Email verified successfully. You can now sign in." };
  };

  /**
   * OAuth2 Client Credentials Grant
   */
  async getToken(payload: GetServiceTokenPayload): Promise<ServiceReturnDto> {
    const { clientId, clientSecret, grantType } = payload;

    if (grantType !== SERVICE_GRANT_TYPE) {
      return this.throwError(
        `Invalid grant type. Expected '${SERVICE_GRANT_TYPE}'.`,
      );
    }

    const serviceClient = await this.db.serviceClient.findUnique({
      where: { client_id: clientId },
    });

    if (!serviceClient || !serviceClient.is_active) {
      return this.throwUnauthorized("Invalid client credentials.");
    }

    const incomingHash = crypto
      .createHash("sha256")
      .update(clientSecret)
      .digest("hex");

    /**
     * Timing-safe comparison to prevent side-channel attacks
     */
    const isSecretValid = crypto.timingSafeEqual(
      Buffer.from(incomingHash),
      Buffer.from(serviceClient.client_secret_hash),
    );

    if (!isSecretValid) {
      return this.throwUnauthorized("Invalid client credentials.");
    }

    const accessToken = jwtUtils.generateServiceToken({
      serviceId: serviceClient.id,
      clientId: serviceClient.client_id,
      name: serviceClient.name,
    });

    return {
      statusCode: 200,
      message: "Access token generated successfully.",
      data: {
        accessToken,
        tokenType: "Bearer",
        expiresIn: authConstants.SERVICE_TOKEN_EXPIRES_IN,
      },
    };
  }

  /**
   * Register internal or third-party service
   */
  async registerService(
    payload: RegisterServicePayload,
  ): Promise<ServiceReturnDto> {
    const { name, description } = payload;

    const clientId = `svc_${crypto.randomBytes(8).toString("hex")}`;
    const clientSecret = crypto.randomBytes(32).toString("hex");

    const clientSecretHash = crypto
      .createHash("sha256")
      .update(clientSecret)
      .digest("hex");

    const serviceClient = await this.db.serviceClient.create({
      data: {
        name,
        description,
        client_id: clientId,
        client_secret_hash: clientSecretHash,
        is_active: true,
      },
    });

    /**
     * IMPORTANT:
     * clientSecret is returned ONLY once.
     * Never store or show again.
     */
    return {
      statusCode: 201,
      message: "Service client registered successfully.",
      data: {
        clientId: serviceClient.client_id,
        clientSecret,
        name: serviceClient.name,
      },
    };
  }

  // * Resend verify email
  // * Forgot password
  // * Change password
  // * Profile update
}
