import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface TokenPayload extends JwtPayload {
  id: number;
  role: string;
  email: string;
}

export class JwtUtil {
  sign(payload: TokenPayload, expiresIn = "7d"): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as SignOptions["expiresIn"] });
  }

  verify(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  }
}
