import { Request, Response } from "express";
import { BaseRoute } from "../../base/BaseRoute";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */
export class UserRoute extends BaseRoute {
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
    this.router.get("/users", this.getAllUsers);

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
    this.router.post("/users", this.createUser);
  }

  private getAllUsers(req: Request, res: Response) {
    res.json([{ id: 1, name: "Nazmul Hosen" }]);
  }

  private createUser(req: Request, res: Response) {
    res.status(201).json({ message: "User created" });
  }
}
