import jwt, { SignOptions } from "jsonwebtoken";
import { jwtConfig } from "../../config";

class JwtUtils {
  private readonly jwtSecret: string;
  private readonly refreshSecret: string;
  private readonly jwtExpiresIn: any;
  private readonly refreshExpiry: any;

  constructor() {
    this.jwtSecret = jwtConfig.access.secret;
    this.jwtExpiresIn = jwtConfig.access.expiresIn || "15m";
    this.refreshSecret = jwtConfig.refresh.secret;
    this.refreshExpiry = jwtConfig.refresh.expiresIn || "7d";
  }

  /**
   * Sign Access Token
   */
  public generateToken(payload: object, expiresIn?: any): string {
    const options: SignOptions = {
      expiresIn: expiresIn || this.jwtExpiresIn,
      algorithm: "HS256",
    };

    return jwt.sign(payload, this.jwtSecret, options);
  }

  /**
   * Sign Service Token
   */
  public generateServiceToken(payload: object): string {
    const options: SignOptions = {
      expiresIn: this.jwtExpiresIn, // Can be longer if needed
      algorithm: "HS256",
    };
    return jwt.sign({ ...payload, type: "service" }, this.jwtSecret, options);
  }

  /**
   * Verify Access Token Safely
   */
  public verifyToken<T = any>(token: string): T | null {
    try {
      return jwt.verify(token, this.jwtSecret) as T;
    } catch (error) {
      this.handleJwtError(error);
      return null;
    }
  }

  /**
   * Decode JWT token (without verifying)
   * @param token string
   * @returns JWTPayload | null
   */
  static decodeToken(token: string): object | null {
    try {
      return jwt.decode(token) as object;
    } catch (error) {
      return null;
    }
  }

  /**
   * Sign Refresh Token
   */
  public generateRefreshToken(payload: object): string {
    const options: SignOptions = {
      expiresIn: this.refreshExpiry,
      algorithm: "HS256",
    };

    return jwt.sign(payload, this.refreshSecret, options);
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

export default new JwtUtils();
