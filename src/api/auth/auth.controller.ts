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

  signin = this.asyncHandler(async (req: Request, res: Response) => {
    const { body } = req.validatedData;

    const data = await this.service.signin(body);

    this.sendResponse(res, data);
  });

  signout = this.asyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
      res.status(401).json({ message: "Unauthorized" });

    const refreshToken = authHeader?.split(" ")[1];
    const trustedDeviceToken = req.headers?.trusteddevicetoken;

    const data = await this.service.signout({
      refreshToken,
      trustedDeviceToken,
    });

    this.sendResponse(res, data);
  });

  refreshToken = this.asyncHandler(async (req: Request, res: Response) => {
    const { body } = req;

    const data = await this.service.refreshToken(body);

    this.sendResponse(res, data);
  });

  verifyEmail = this.asyncHandler(async (req: Request, res: Response) => {
    const { body } = req.validatedData;

    const data = await this.service.verifyEmail(body);

    this.sendResponse(res, data);
  });
}
