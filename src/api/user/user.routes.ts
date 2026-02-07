import { BaseRoute } from "../../core/base";
import { authenticate } from "../../core/middlewares";
import { UserController } from "./user.controller";

export class UserRoutes extends BaseRoute<UserController> {
  constructor() {
    super(new UserController());
  }

  protected initializeRoutes(): void {
    /**
     * @swagger
     * /user/me:
     *   get:
     *     description: Get user profile
     *     tags: [User]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: User profile
     *       401:
     *         description: Unauthorized
     */
    this.router.get("/me", authenticate, this.controller.me);
  }
}
