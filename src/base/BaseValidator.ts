import { ZodObject } from "zod";

export abstract class BaseValidator {
  protected abstract schema: ZodObject<any>;

  validate(data: unknown) {
    return this.schema.parse(data);
  }

  public safeValidate(data: unknown) {
    return this.schema.safeParse(data);
  }

  public getSchema() {
    return this.schema;
  }
}
