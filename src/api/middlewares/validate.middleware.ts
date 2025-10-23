import { NextFunction, Request, Response } from "express";
import { BaseValidator } from "../../base/BaseValidator";

export const validate =
  (validator: BaseValidator, schemaMethod: keyof BaseValidator) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const schema = (validator as any)[schemaMethod];

      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    }
  };
