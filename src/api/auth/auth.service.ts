import crypto from "crypto";
import { BaseService } from "../../base/BaseService";
import { config } from "../../core/config/env.config";
import { throwValidation } from "../../core/errors/errors";
import mailer from "../../core/mail/mailer";
import { BcryptUtil } from "../../core/utils/bcrypt.utils";
import jwtUtils from "../../core/utils/jwt.utils";
import { ServiceReturnDto } from "../../core/utils/responseHandler";
import { SigninDto, SignupDto, VerifyEmailDto } from "./auth.validator";

type SignupFnDto = (payload: SignupDto["body"]) => Promise<ServiceReturnDto>;
type SigninFnDto = (payload: SigninDto["body"]) => Promise<ServiceReturnDto>;
type verifyEmailFnDto = (
  payload: VerifyEmailDto["body"]
) => Promise<ServiceReturnDto>;

export class AuthService extends BaseService {
  // ---------------------------
  // 🧩 Signup
  // ---------------------------
  signup: SignupFnDto = async (payload) => {
    const { email, name, password, username } = payload;

    // Check existing user
    const existing = await this.db.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      throwValidation(
        existing.email === email
          ? "Email already registered."
          : "Username already taken."
      );
    }

    // Hash password
    const passwordHash = await BcryptUtil.hash(password);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    // Create user
    const user = await this.db.user.create({
      data: {
        name,
        email,
        username,
        password_hash: passwordHash,
        verification_token: verificationToken,
        verification_expires: verificationExpires,
      },
    });

    // Prepare verification link
    const verificationLink = `${config}/verify-email?token=${verificationToken}`;

    //  Send email
    await mailer.sendEmail(email, {
      subject: "Verify your email address",
      templateName: "verify-email",
      templateData: {
        name: user.name,
        verificationLink,
      },
    });

    return {
      statusCode: 201,
      message:
        "Registration successful. Please check your email for verification link.",
    };
  };

  // ---------------------------
  // ✉️ Verify Email
  // ---------------------------
  verifyEmail: verifyEmailFnDto = async (payload) => {
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
        is_verified: true,
        verification_token: null,
        verification_expires: null,
      },
    });

    return { message: "Email verified successfully. You can now sign in." };
  };

  // * Resend verify email
  // * Forgot password
  // * Change password
  // * Profile update

  // ---------------------------
  // 🔑 Sign In
  // ---------------------------
  signin: SigninFnDto = async (payload) => {
    const { identifier, password, trustDevice } = payload;

    const user = await this.db.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user) return this.throwUnauthorized("Invalid credentials.");
    if (!user.is_verified)
      return this.throwError("Please verify your email before signing in.");

    const passwordMatch = await BcryptUtil.compare(
      password,
      user.password_hash
    );
    if (!passwordMatch) this.throwUnauthorized("Invalid credentials.");

    const trusted = false;
    const twoFAEnabled = false;
    const emailVerified = false;

    if (trusted) {
      // Trusted device → skip both email verification and 2FA
      // return allowLogin(user);
    }

    if (twoFAEnabled) {
      // Prompt user to enter 2FA code
      // return "Enter your 2FA code."
    }

    if (!emailVerified) {
      // Send email verification link
      // await authService.sendVerificationEmail(user);
      // return "Email verification required."
    }

    // Everything passed → allow login
    // return allowLogin(user);
    // ---- End ----

    const token = jwtUtils.generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    const refreshToken = jwtUtils.generateRefreshToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    let trustedDeviceToken: string | null = null;

    if (trustDevice) {
      // 🔒 Issue long-lived trusted device token
      trustedDeviceToken = jwtUtils.generateToken(
        {
          userId: user.id,
          deviceId: crypto.randomUUID(),
        },
        "30d"
      );

      // Optionally store hashed version in Redis
      const key = `trusted_device:${user.id}:${trustedDeviceToken}`;
      await this.cache.set(key, "valid", { ttl: 30 * 24 * 60 * 60 });
    }

    return {
      message: "Signin successful.",
      data: {
        token,
        refreshToken,
        trustedDeviceToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
        },
      },
    };
  };

  // ✅ Verify if a device token is still trusted
  async isDeviceTrusted(token: string): Promise<boolean> {
    try {
      const payload = jwtUtils.verifyToken(token) as {
        userId: string;
      };

      const key = `trusted_device:${payload.userId}:${token}`;
      const exists = await this.cache.get(key);
      return Boolean(exists);
    } catch {
      return false;
    }
  }

  // ✅ Invalidate a trusted device
  async revokeTrustedDevice(token: string) {
    try {
      const payload = jwtUtils.verifyToken(token);
      const key = `trusted_device:${payload.userId}:${token}`;
      await this.cache.del(key);
    } catch {
      // ignore errors
    }
  }
}
