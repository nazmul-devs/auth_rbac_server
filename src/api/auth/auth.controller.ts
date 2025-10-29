import { Request, Response } from "express";
import { BaseController } from "../../base/BaseController";
import { ServiceReturnDto } from "../../core/utils/responseHandler";
import { AuthService } from "./auth.service";

export class AuthController extends BaseController {
  private service: AuthService;

  constructor() {
    super();
    this.service = new AuthService();
  }

  signup = this.asyncHandler(async (req: Request, res: Response) => {
    const { body } = req.validatedData;

    const data = await this.service.signup(body);

    this.sendResponse(res, data);
  });
}
