import { validate } from "../../api/middlewares/validate.middleware";
import { BaseRoute } from "../../base/BaseRoute";
import { BaseValidator } from "../../base/BaseValidator";
import { AuthenticateMiddleware } from "../middlewares/authenticate.middleware";
import { AuthorizeMiddleware } from "../middlewares/authorize.middleware";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserValidator } from "./user.validator";

export class UserRoute extends BaseRoute {
  private controller = new UserController(new UserService());
  private validator = new UserValidator();

  protected initializeRoutes(): void {
    this.router.post(
      "/users",
      new AuthenticateMiddleware().handle,
      new AuthorizeMiddleware("admin" as string).handle,
      validate(this.validator, "validate" as keyof BaseValidator),
      this.controller.createUser
    );

    this.router.post(
      "/users/login",
      validate(this.validator, "loginSchema" as keyof BaseValidator), // uses login schema
      this.controller.login
    );
  }
}
