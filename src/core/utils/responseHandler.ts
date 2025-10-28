// src/core/utils/responseHandler.ts
import { Response } from "express";

interface MetaInfo {
  requestId?: string;
  timestamp?: string;
}

interface SuccessResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data?: T;
  meta?: MetaInfo;
}

interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: { field?: string; message: string }[];
  meta?: MetaInfo;
}

export class ResponseHandler {
  static success<T>(
    res: Response,
    statusCode: number,
    message: string,
    data?: T,
    meta?: MetaInfo
  ): Response {
    return res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data: data || undefined,
      meta: {
        ...meta,
        timestamp: new Date().toISOString(),
      },
    } satisfies SuccessResponse<T>);
  }

  static error(
    res: Response,
    statusCode: number,
    message: string,
    errors?: { field?: string; message: string }[],
    meta?: MetaInfo
  ): Response {
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors: errors ?? [],
      meta: {
        ...meta,
        timestamp: new Date().toISOString(),
      },
    } satisfies ErrorResponse);
  }

  static serverError(res: Response, error: any): Response {
    const message =
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : error.message;

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message,
      meta: { timestamp: new Date().toISOString() },
    } satisfies ErrorResponse);
  }
}
