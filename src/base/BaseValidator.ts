import { ZodSchema } from "zod";

export class BaseValidator {
  static validate<T>(schema: ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
  }
}
