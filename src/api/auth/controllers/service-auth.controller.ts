import { Request, Response, NextFunction } from "express";
import { BaseController } from "../../../base/base.controller";
import { ServiceAuthService } from "../services/service-auth.service";

const serviceAuthService = new ServiceAuthService();

export class ServiceAuthController extends BaseController {
  /**
   * POST /auth/service/token
   */
  getToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await serviceAuthService.getToken(req.body);
      this.sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/service/register
   */
  registerService = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await serviceAuthService.registerService(req.body);
      this.sendResponse(res, result);
    } catch (error) {
      next(error);
    }
  };
}
