import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ErrorResponse } from "../../core/errors/errorHandler";

type ZodIssue = {
  code: string;
  path: (string | number)[];
  message: string;
  values?: any[];
};
export function humanizeZodErrors(nestedIssues: ZodIssue[][]) {
  const issues = nestedIssues?.flat(); // flatten nested arrays

  return issues?.map((issue) => {
    const field = issue.path.length > 0 ? issue.path.join(".") : "value";

    if (issue.code === "invalid_enum_value" || issue.code === "invalid_value") {
      return `${field}: must be one of [${issue.values?.join(", ")}]`;
    }

    return `${field}: ${issue.message}`;
  });
}

export function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
      cookies: req.cookies,
    }) as any;

    if (!result.success) {
      const formattedErrors =
        result.error?.issues.map((err: any) => {
          return {
            code: err?.code,
            field: err.path.join("."),
            message: err.message,
            values: err.values,
            details: humanizeZodErrors(err.errors),
          };
        }) ?? [];

      const response: ErrorResponse = {
        success: false,
        code: "VALIDATION_ERROR",
        message: formattedErrors[0]?.message,
        details: formattedErrors,
      };

      res.status(400).json(response);

      return;
    }

    req.validatedData = result.data;
    next();
  };
}
