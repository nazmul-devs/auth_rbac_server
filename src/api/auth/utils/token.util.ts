import jwt from "jsonwebtoken";
import { env } from "../../../config";

export function generateAccessToken(payload: object) {
  return jwt.sign(payload, env.JWT_SECRET!, { expiresIn: "15m" });
}

export function generateRefreshToken(payload: object) {
  return jwt.sign(payload, env.REFRESH_SECRET!, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET!);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.REFRESH_SECRET!);
}
