import { z } from "zod";
import { BaseValidator } from "../../base/BaseValidator";

// Define the Zod schema for user creation
const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Define the Zod schema for user login
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export class UserValidator extends BaseValidator {
  static validateCreateUser(data: unknown) {
    return this.validate(createUserSchema, data);
  }

  static validateLogin(data: unknown) {
    return this.validate(loginSchema, data);
  }
}
