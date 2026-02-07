import { Request, Response } from "express";
import { BaseController } from "../../../base";
import { authService } from "../services";

export class AuthController extends BaseController {
  constructor() {
    super();
  }

  signup = this.asyncHandler(async (req: Request, res: Response) => {
    const { body } = req.validatedData;

    const data = await authService.auth.signup(body);

    this.sendResponse(res, data);
  });

  signin = this.asyncHandler(async (req: Request, res: Response) => {
    const { body } = req.validatedData;

    const data = await authService.auth.signin(body);

    this.sendResponse(res, data);
  });

  resendVerification = this.asyncHandler(
    async (req: Request, res: Response) => {
      const data = await authService.auth.refresh(req.body);

      this.sendResponse(res, data);
    },
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

    const data = await authService.auth.signout(payload);

    this.sendResponse(res, data);
  });

  me = this.asyncHandler(async (req: Request, res: Response) => {
    const userId = req?.user?.id as string;
    const data = await authService.auth.me(userId);

    this.sendResponse(res, data);
  });

  refreshToken = this.asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.headers.authorization?.split(" ")[1] || "";

    const data = await authService.auth.refreshToken({ refreshToken });

    this.sendResponse(res, data);
  });

  verifyEmail = this.asyncHandler(async (req: Request, res: Response) => {
    const { body } = req.validatedData;

    const data = await authService.auth.verifyEmail(body);

    this.sendResponse(res, data);
  });
}
