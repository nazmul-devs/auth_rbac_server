import { Request, Response } from "express";
import { BaseRoute } from "../../base/BaseRoute";
import { validateRequest } from "../middlewares/validate-request";
import { AuthController } from "./auth.controller";
import { AuthValidator } from "./auth.validator";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User management API
 */
export class AuthRoutes extends BaseRoute<AuthController> {
  constructor() {
    super(new AuthController());
  }

  protected initializeRoutes(): void {
    /**
     * @swagger
     * /users:
     *   get:
     *     summary: Get all users
     *     tags: [Users]
     *     responses:
     *       200:
     *         description: Returns a list of all users
     */
    this.router.post(
      "/signup",
      validateRequest(AuthValidator.signup),
      this.controller.register
    );

    /**
     * @swagger
     * /users:
     *   post:
     *     summary: Create a new user
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               email:
     *                 type: string
     *     responses:
     *       201:
     *         description: User created successfully
     */
    this.router.post(
      "/signin",
      validateRequest(AuthValidator.login),
      createUser
    );
  }
}

const createUser = (_req: Request, res: Response) => {
  res.status(201).json({ message: "User created" });
};
