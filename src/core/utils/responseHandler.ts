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

export type ServiceReturnDto = {
  statusCode?: number;
  message: string;
  data?: any;
  meta?: MetaInfo;
};

export class ResponseHandler {
  /**
   * ✅ Send success response
   */
  static success<T>(
    res: Response,
    {
      statusCode = 200,
      message,
      data,
      meta,
    }: {
      statusCode?: number;
      message: string;
      data?: T;
      meta?: MetaInfo;
    }
  ): Response {
    const response: SuccessResponse<T> = {
      success: true,
      statusCode,
      message,
      data,
      meta: {
        ...meta,
        timestamp: new Date().toISOString(),
      },
    };

    return res.status(statusCode).json(response);
  }

  /**
   * ❌ Standardized error response (production ready)
   */
  static error(
    res: Response,
    statusCode: number,
    message: string,
    errors?: any,
    meta?: MetaInfo
  ): Response {
    const response: ErrorResponse = {
      success: false,
      statusCode,
      message,
      errors: errors ?? [],
      meta: {
        ...meta,
        timestamp: new Date().toISOString(),
      },
    };

    return res.status(statusCode).json(response);
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
