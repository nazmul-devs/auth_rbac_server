import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { ValidationError } from "../errors";
import { ResponseHandler } from "../utils/responseHandler";

export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<any>;

export class BaseController {
  asyncHandler(fn: AsyncRequestHandler): AsyncRequestHandler {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error: unknown) {
        // 🔥 Always log raw error (VERY IMPORTANT)
        console.error("[Controller Error]", {
          path: req.path,
          method: req.method,
          error,
        });

        // ---------- Known AppError ----------
        if (error instanceof AppError) {
          return next(error);
        }

        // ---------- Zod ----------
        if (
          typeof error === "object" &&
          error !== null &&
          "name" in error &&
          (error as any).name === "ZodError"
        ) {
          return next(
            new ValidationError("Validation failed", (error as any).errors),
          );
        }

        // ---------- Prisma ----------
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          (error as any).code === "P2002"
        ) {
          return next(
            new AppError("Duplicate entry", 409, {
              fields: (error as any).meta?.target,
            }),
          );
        }

        // ---------- Fallback ----------
        const message =
          error instanceof Error ? error.message : "Something went wrong";

        return next(
          new AppError(message, 500, null, "INTERNAL_SERVER_ERROR", false),
        );
      }
    };
  }

  sendResponse = ResponseHandler.success;
  sendError = ResponseHandler.error;
  serverError = ResponseHandler.serverError;
}
