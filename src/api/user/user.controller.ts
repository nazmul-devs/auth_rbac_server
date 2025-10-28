import { Request, Response } from "express";
import { UserService } from "./user.service";

export class UserController {
  constructor(private readonly userService: UserService) {}

  async createUser(req: Request, res: Response) {
    const user = await this.userService.create(req.body);
    return res.status(201).json({ success: true, data: user });
  }

  async login(req: Request, res: Response) {
    const token = await this.userService.login(req.body);
    return res.json({ success: true, token });
  }
}
