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

  resendVerification = this.asyncHandler(
    async (req: Request, res: Response) => {
      const data = await this.service.resendVerification(req.body);

      this.sendResponse(res, data);
    }
  );

  signout = this.asyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
      res.status(401).json({ message: "Unauthorized" });

    const refreshToken = authHeader?.split(" ")[1];
    const trustedDeviceToken = req.headers?.trusteddevicetoken;

    const payload = {
      refreshToken,
      trustedDeviceToken: trustedDeviceToken || "",
    };

    const data = await this.service.signout(payload);

    this.sendResponse(res, data);
  });

  me = this.asyncHandler(async (req: Request, res: Response) => {
    const data = await this.service.me({ userId: req.user?.id || "" });

    this.sendResponse(res, data);
  });

  refreshToken = this.asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.headers.authorization?.split(" ")[1] || "";

    const data = await this.service.refreshToken({ refreshToken });

    this.sendResponse(res, data);
  });

  verifyEmail = this.asyncHandler(async (req: Request, res: Response) => {
    const { body } = req.validatedData;

    const data = await this.service.verifyEmail(body);

    this.sendResponse(res, data);
  });
}
