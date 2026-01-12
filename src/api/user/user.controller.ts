import { Request, Response } from "express";
import { BaseController } from "../../base/base.controller";
import { UserService } from "./user.service";

export class UserController extends BaseController {
  private service: UserService;

  constructor() {
    super();
    this.service = new UserService();
  }

  me = this.asyncHandler(async (req: Request, res: Response) => {
    const data = await this.service.me({ userId: req.user?.id || "" });

    this.sendResponse(res, data);
  });
}
