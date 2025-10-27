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
    return (req, res, next) => {
      return Promise.resolve(fn(req, res, next)).catch((error) => {
        // If it's already an AppError, pass it through
        if (error instanceof AppError) {
          return next(error);
        }

        // For validation errors from Zod
        if (error.name === "ZodError") {
          return next(new ValidationError(error.message));
        }

        // For all other errors, create a generic AppError
        return next(new AppError("Internal server error", 500));
      });
    };
  }

  sendResponse = ResponseHandler.success;
  sendError = ResponseHandler.error;
  serverError = ResponseHandler.serverError;
}
