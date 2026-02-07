import { NextFunction, Request, Response } from "express";

export abstract class BaseMiddleware {
  abstract handle(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void | Promise<void>;

  protected sendError(res: Response, statusCode: number, message: string) {
    res.status(statusCode).json({
      success: false,
      message,
    });
  }
}
