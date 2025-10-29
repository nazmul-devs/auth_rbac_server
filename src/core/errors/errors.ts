import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ZodError, ZodIssue } from "zod";
import { logger } from "../utils/logger";

type ErrorDetails = Record<string, unknown> | unknown[] | string | undefined;

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details: ErrorDetails;
  public readonly code: string;
  public readonly timestamp: Date;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 400,
    isOperational: boolean = true,
    details: ErrorDetails = undefined,
    code: string = "APPLICATION_ERROR",
    context?: Record<string, unknown>
  ) {
    super(message);

    // Ensure proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype);

    // Standard error properties
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.code = code;
    this.timestamp = new Date();
    this.context = context;

    // Capture stack trace (excluding constructor call)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
      isOperational: this.isOperational,
      ...(this.details && { details: this.details }),
      ...(process.env.NODE_ENV !== "production" && {
        stack: this.stack,
        context: this.context,
      }),
    };
  }

  public toString(): string {
    return `[${this.timestamp.toISOString()}] ${this.name} (${this.code}): ${
      this.message
    }`;
  }

  public static fromError(
    error: Error,
    overrides: Partial<
      Pick<
        AppError,
        "statusCode" | "isOperational" | "details" | "code" | "context"
      >
    > = {}
  ): AppError {
    return new AppError(
      error.message,
      overrides.statusCode || 500,
      overrides.isOperational ?? false,
      overrides.details || error.stack,
      overrides.code || "INTERNAL_ERROR",
      overrides.context
    );
  }

  public static logError(error: AppError): void {
    logger.error(`[AppError] ❌ ${error.toString()}`, {
      details: error.details,
      context: error.context,
    });
  }
}

export class ValidationError extends AppError {
  public readonly issues: ZodIssue[];
  public readonly flattenedErrors: {
    fieldErrors: Record<string, string[]>;
    formErrors: string[];
  };

  constructor(issues: ZodIssue[] | ZodError) {
    const parsedIssues = issues instanceof ZodError ? issues.issues : issues;
    const flattened = issues instanceof ZodError ? issues.flatten() : null;

    super(
      "Validation failed",
      400,
      true,
      ValidationError.transformIssuesToDetails(parsedIssues),
      "VALIDATION_ERROR"
    );

    this.issues = parsedIssues;
    this.flattenedErrors = flattened || {
      fieldErrors: ValidationError.getFieldErrors(parsedIssues),
      formErrors: ValidationError.getFormErrors(parsedIssues),
    };

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  private static transformIssuesToDetails(issues: ZodIssue[]): ErrorDetails[] {
    return issues.map((issue) => ({
      field: issue.path.join(".") || "general",
      message: issue.message,
      code: issue.code,
      ...(issue.path.length > 0 && { path: issue.path }),
    }));
  }

  private static getFieldErrors(issues: ZodIssue[]): Record<string, string[]> {
    const fieldErrors: Record<string, string[]> = {};

    for (const issue of issues) {
      const field = issue.path.join(".");
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field].push(issue.message);
    }

    return fieldErrors;
  }

  private static getFormErrors(issues: ZodIssue[]): string[] {
    return issues
      .filter((issue) => issue.path.length === 0)
      .map((issue) => issue.message);
  }

  public toJSON() {
    return {
      ...super.toJSON(),
      issues: this.issues,
      flattened: this.flattenedErrors,
    };
  }

  public getFieldErrors(): Record<string, string[]> {
    return this.flattenedErrors.fieldErrors;
  }

  public getFormErrors(): string[] {
    return this.flattenedErrors.formErrors;
  }

  public hasErrors(): boolean {
    return (
      this.issues.length > 0 ||
      Object.keys(this.flattenedErrors.fieldErrors).length > 0 ||
      this.flattenedErrors.formErrors.length > 0
    );
  }
}

export class DatabaseError extends AppError {
  public readonly prismaCode: string;
  public readonly meta?: Record<string, unknown>;
  public readonly target?: string[];
  private static readonly prismaErrorMessages: Record<string, string> = {
    P2000: "The provided value is too long for the column",
    P2001: "Record not found in the database",
    P2002: "Unique constraint violation",
    P2003: "Foreign key constraint violation",
    P2004: "Database constraint violation",
    P2005: "Invalid value for field",
    P2006: "Invalid value provided",
    P2007: "Data validation error",
    P2008: "Query parsing failed",
    P2009: "Query validation failed",
    P2010: "Raw query failed",
    P2011: "Null constraint violation",
    P2012: "Missing required value",
    P2013: "Missing required argument",
    P2014: "Relation violation",
    P2015: "Related record not found",
    P2016: "Query interpretation error",
    P2017: "Records not connected",
    P2018: "Required connected records not found",
    P2019: "Input error",
    P2020: "Value out of range",
    P2021: "Table does not exist",
    P2022: "Column does not exist",
    P2023: "Inconsistent column data",
    P2024: "Connection pool timeout",
    P2025: "Record to update/delete not found",
    P2026: "Unsupported feature",
    P2027: "Multiple errors occurred",
    P2028: "Transaction API error",
    P2030: "Cannot find fulltext index",
    P2033: "Numeric value out of range",
    P2034: "Transaction failed",
  };

  constructor(error: PrismaClientKnownRequestError) {
    const message = DatabaseError.getErrorMessage(error);
    const details = DatabaseError.getErrorDetails(error);

    super(
      message,
      DatabaseError.getStatusCode(error),
      true, // Database errors are typically operational
      details,
      error.code || "DATABASE_ERROR"
    );

    this.prismaCode = error.code;
    this.meta = error.meta;
    this.target = error.meta?.target as string[] | undefined;

    // Preserve stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }

  private static getErrorMessage(error: PrismaClientKnownRequestError): string {
    return (
      this.prismaErrorMessages[error.code] ||
      error.message ||
      "Database operation failed"
    );
  }

  private static getStatusCode(error: PrismaClientKnownRequestError): number {
    // Map specific Prisma error codes to appropriate HTTP status codes
    const code = error.code;
    if (code === "P2002" || code === "P2003" || code === "P2011") {
      return 409; // Conflict
    }
    if (code === "P2001" || code === "P2015" || code === "P2025") {
      return 404; // Not Found
    }
    if (code === "P2000" || code === "P2005" || code === "P2020") {
      return 400; // Bad Request
    }
    if (code === "P2024") {
      return 503; // Service Unavailable
    }
    return 500; // Default to Internal Server Error
  }

  private static getErrorDetails(
    error: PrismaClientKnownRequestError
  ): ErrorDetails[] {
    const details: ErrorDetails[] = [
      {
        field: "database",
        message: error.message,
        code: error.code,
      },
    ];

    if (error.meta?.target) {
      details.push({
        field: "target",
        message: `Affected fields: ${(error.meta.target as string[]).join(
          ", "
        )}`,
        code: "TARGET_FIELDS",
      });
    }

    if (error.meta?.cause) {
      details.push({
        field: "cause",
        message: error.meta.cause as string,
        code: "DATABASE_CAUSE",
      });
    }

    return details;
  }
}

export class RateLimitError extends AppError {
  public readonly resetTime: Date;

  constructor(resetTime: Date) {
    super("Too many requests", 429, true, { resetTime }, "RATE_LIMIT_EXCEEDED");
    this.resetTime = resetTime;
  }
}

export class NotFoundError extends AppError {
  constructor(
    resource: string,
    identifier: string | number,
    details?: ErrorDetails
  ) {
    super(
      `${resource} with ID ${identifier} not found`,
      404,
      true,
      details,
      resource === "Route" ? "ROUTE_NOT_FOUND" : "RESOURCE_NOT_FOUND",
      { resource, identifier }
    );
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed") {
    super(message, 401, true, undefined, "AUTHENTICATION_ERROR");
  }
}

export const throwNotFound = (entity: string, id: string | number) => {
  throw new AppError(`${entity} with ID ${id} does not exist`, 404);
};

export const throwValidation = (message: string) => {
  throw new AppError(message, 400);
};

export const throwUnauthorized = (message = "Unauthorized") => {
  throw new AppError(message, 401);
};

export const throwUnHandle = (message = "Server error") => {
  throw new AppError(message, 500);
};

export enum RedisErrorCodes {
  CONNECTION_REFUSED = "ECONNREFUSED",
  MAX_RETRIES = "MAX_RETRIES_PER_REQUEST_FAILED",
  NO_AUTH = "NOAUTH",
  BUSY = "BUSY",
}
