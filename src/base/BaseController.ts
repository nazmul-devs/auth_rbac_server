import { NextFunction, Request, Response } from "express";
import { AppError } from "../core/errors/AppError";
import { ValidationError } from "../core/errors/errorTypes";
import { ResponseHandler } from "../core/utils/responseHandler";

export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export class BaseController {
  asyncHandler(fn: AsyncRequestHandler): AsyncRequestHandler {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error: any) {
        // known AppError → pass as-is
        if (error instanceof AppError) return next(error);

        // Zod validation
        if (error.name === "ZodError")
          return next(new ValidationError("Validation failed", error.errors));

        // Prisma / DB unique email conflict example
        if (error.code === "P2002") {
          return next(
            new AppError("Duplicate entry", 409, { fields: error.meta?.target })
          );
        }

        // Fallback internal error
        return next(
          new AppError(
            error.message || "Something went wrong",
            error.statusCode || 500,
            null,
            error.code || "INTERNAL_SERVER_ERROR",
            false
          )
        );
      }
    };
  }

  sendResponse = ResponseHandler.success;
  sendError = ResponseHandler.error;
  serverError = ResponseHandler.serverError;
}
