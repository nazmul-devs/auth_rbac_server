import { NextFunction, Request, Response } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { Prisma } from "../../generated/prisma";
import { logger } from "../utils/logger";
import { AppError } from "./AppError";

export interface ErrorResponse {
  success: boolean;
  message: string;
  code?: string;
  details?: any;
}

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  let customError: AppError;

  // Prisma known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        customError = new AppError(
          `Duplicate field: ${err.meta?.target}`,
          409,
          "DUPLICATE_ENTRY"
        );
        break;
      case "P2003":
        customError = new AppError(
          `Foreign key constraint failed on field: ${err.meta?.field_name}`,
          400,
          "FOREIGN_KEY_ERROR"
        );
        break;
      case "P2025":
        customError = new AppError("Record not found", 404, "NOT_FOUND");
        break;
      default:
        customError = new AppError(
          `Database error: ${err.message}`,
          500,
          "PRISMA_ERROR"
        );
    }
  }

  // JWT errors
  else if (err instanceof TokenExpiredError) {
    customError = new AppError(
      "Token expired. Please login again.",
      401,
      "TOKEN_EXPIRED"
    );
  } else if (err instanceof JsonWebTokenError) {
    customError = new AppError("Invalid token.", 401, "INVALID_TOKEN");
  }

  // Custom AppError
  else if (err instanceof AppError) {
    customError = err;
  }

  // Zod validation or similar
  else if (err.name === "ZodError") {
    customError = new AppError("Validation failed", 422, "VALIDATION_ERROR");
  }

  // Unexpected / programming errors
  else {
    logger.error(`[UNEXPECTED] ${err.stack || err}`);
    customError = new AppError(
      "Internal server error",
      500,
      "INTERNAL_ERROR",
      false
    );
  }

  // Logging (only non-validation / internal)
  if (customError.statusCode >= 500 || !customError.isOperational) {
    logger.error(`[${customError.code}] ${customError.message}`);
  }

  const response: ErrorResponse = {
    success: false,
    message: customError.message,
    code: customError.code,
  };

  if (
    process.env.NODE_ENV !== "production" &&
    customError.isOperational === false
  ) {
    response.details = err.stack;
  }

  res.status(customError.statusCode).json(response);
}
