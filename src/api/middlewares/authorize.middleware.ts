import { NextFunction, Request, Response } from "express";
import { AuthenticateMiddleware } from "./authenticate.middleware";
import { TokenPayload } from "../../utils/jwt.util";

export class AuthorizeMiddleware extends AuthenticateMiddleware {
    private allowedRoles: string[];
  
    constructor(...roles: string[]) {
      super();
      this.allowedRoles = roles;
    }
  
    async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
      await super.handle(req, res, async () => {
        if (!req.user || !this.allowedRoles.includes((req as any as TokenPayload).role)) {
          return super.sendError(res, 403, "Forbidden: Access denied" as string);
        }
        next();
      });
    }
  }
  