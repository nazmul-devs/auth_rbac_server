export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public details?: any,
    public code: string = "APPLICATION_ERROR",
    public isOperational: boolean = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}
