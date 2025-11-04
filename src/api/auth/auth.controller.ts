import { Request, Response } from "express";
import { BaseController } from "../../base/BaseController";
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

  verifyEmail = this.asyncHandler(async (req: Request, res: Response) => {
    const { body } = req.validatedData;

    const data = await this.service.verifyEmail(body);

    this.sendResponse(res, data);
  });

  signin = this.asyncHandler(async (req: Request, res: Response) => {
    const { body } = req.validatedData;

    const data = await this.service.signin(body);

    this.sendResponse(res, data);
  });
}
