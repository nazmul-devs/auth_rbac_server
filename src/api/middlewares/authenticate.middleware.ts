import { NextFunction, Request, Response } from "express";
import { BaseMiddleware } from "../../base/BaseMiddleware";
import { JwtUtil, TokenPayload } from "../../utils/jwt.util";

export class AuthenticateMiddleware extends BaseMiddleware {
  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return this.sendError(res, 401, "Unauthorized: Missing token");
      }

      const token = authHeader.split(" ")[1];
      const decoded = new JwtUtil().verify(token as string) as TokenPayload;

      // Attach user info to request (for later use)
      (req as any).user = decoded;

      next();
    } catch (error) {
      return this.sendError(res, 401, "Invalid or expired token");
    }
  }
}
