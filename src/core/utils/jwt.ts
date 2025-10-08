import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { config } from "../config/env";

class JwtService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiry: any;
  private readonly refreshExpiry: any;

  constructor() {
    this.accessSecret = config.jwt.accessSecret;
    this.refreshSecret = config.jwt.refreshSecret;
    this.accessExpiry = config.jwt.accessExpiresIn || "15m";
    this.refreshExpiry = config.jwt.refreshExpiresIn || "7d";
  }

  /**
   * Sign Access Token
   */
  public signAccessToken(payload: object): string {
    const options: SignOptions = {
      expiresIn: this.accessExpiry,
      algorithm: "HS256",
    };

    return jwt.sign(payload, this.accessSecret, options);
  }

  /**
   * Sign Refresh Token
   */
  public signRefreshToken(payload: object): string {
    const options: SignOptions = {
      expiresIn: this.refreshExpiry,
      algorithm: "HS256",
    };

    return jwt.sign(payload, this.refreshSecret, options);
  }

  /**
   * Verify Access Token Safely
   */
  public verifyAccessToken<T = any>(token: string): T | null {
    try {
      return jwt.verify(token, this.accessSecret) as T;
    } catch (error) {
      this.handleJwtError(error);
      return null;
    }
  }

  /**
   * Verify Refresh Token Safely
   */
  public verifyRefreshToken<T = any>(token: string): T | null {
    try {
      return jwt.verify(token, this.refreshSecret) as T;
    } catch (error) {
      this.handleJwtError(error);
      return null;
    }
  }

  /**
   * Handle JWT Errors Gracefully
   */
  private handleJwtError(error: unknown): void {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("JWT expired:", error.message);
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error("Invalid JWT:", error.message);
    } else {
      console.error("JWT verification error:", (error as Error).message);
    }
  }
}

export default new JwtService();
