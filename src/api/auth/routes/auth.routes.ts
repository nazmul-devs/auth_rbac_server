import { BaseRoute } from "../../../base";
import { authenticate } from "../../middlewares/authenticate";
import { validateRequest } from "../../middlewares/validate-request";
import { AuthController } from "../controllers/auth.controller";
import { ServiceAuthController } from "../controllers/service-auth.controller";
import { authValidator } from "../validators/auth.validator";

/**
 * Authentication & Authorization Routes
 * Base path: /api/v1/auth
 */
export class AuthRoutes extends BaseRoute<AuthController> {
  private readonly serviceAuthController: ServiceAuthController;

  constructor() {
    super(new AuthController());
    this.serviceAuthController = new ServiceAuthController();
  }

  protected initializeRoutes(): void {
    this.registerPublicAuthRoutes();
    this.registerProtectedAuthRoutes();
    this.registerOAuthRoutes();
  }

  /* =========================
     Public Auth Routes
  ========================= */

  private registerPublicAuthRoutes(): void {
    /**
     * POST /auth/signup
     */
    this.router.post(
      "/signup",
      validateRequest(authValidator.signup),
      this.controller.signup
    );

    /**
     * POST /auth/signin
     */
    this.router.post(
      "/signin",
      validateRequest(authValidator.signin),
      this.controller.signin
    );

    /**
     * POST /auth/verify-email
     */
    this.router.post(
      "/verify-email",
      validateRequest(authValidator.verifyEmail),
      this.controller.verifyEmail
    );

    /**
     * POST /auth/resend-verification
     */
    this.router.post(
      "/resend-verification",
      validateRequest(authValidator.resendVerification),
      this.controller.resendVerification
    );
  }

  /* =========================
     Protected User Routes
  ========================= */

  private registerProtectedAuthRoutes(): void {
    /**
     * POST /auth/signout
     */
    this.router.post("/signout", authenticate, this.controller.signout);

    /**
     * GET /auth/me
     */
    this.router.get("/me", authenticate, this.controller.me);

    /**
     * GET /auth/refresh-token
     */
    this.router.get(
      "/refresh-token",
      authenticate,
      this.controller.refreshToken
    );
  }

  /* =========================
     OAuth / Service Auth
  ========================= */

  private registerOAuthRoutes(): void {
    /**
     * POST /auth/oauth/token
     * Client Credentials Grant
     */
    this.router.post(
      "/oauth/token",
      validateRequest(authValidator.getToken),
      this.serviceAuthController.getToken
    );

    /**
     * POST /auth/oauth/register
     * Usually internal or admin-protected
     */
    this.router.post(
      "/oauth/register",
      this.serviceAuthController.registerService
    );
  }
}
