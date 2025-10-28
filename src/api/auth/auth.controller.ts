import { Request, Response } from "express";
import { BaseController } from "../../base/BaseController";

export class AuthController extends BaseController {
  register = this.asyncHandler(async (req: Request, res: Response) => {
    const { body } = req.validatedData;

    this.sendResponse(res, 200, "Login successfully", body);
  });
}
