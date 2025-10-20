import { Request, Response } from "express";
import { BaseController } from "../../base/BaseController";
import { UserService } from "../services/user.service";
import { UserValidator } from "../validators/user.validator";

export class UserController extends BaseController {
  constructor() {
    super();
  }

  private userService = new UserService();

  register = BaseController.asyncHandler(
    async (req: Request, res: Response) => {
      // Validate request data
      const userData = UserValidator.validateCreateUser(req.body);

      // Create user through service
      const user = await this.userService.createUser(userData);

      this.sendResponse(res, 201, "User registered successfully", user);
    }
  );

  login = BaseController.asyncHandler(async (req: Request, res: Response) => {
    // Validate request data
    const credentials = UserValidator.validateLogin(req.body);

    // Authenticate user through service
    const result = await this.userService.login(credentials);

    this.sendResponse(res, 200, "Login successful", result);
  });
}
