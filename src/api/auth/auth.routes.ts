import { BaseRoute } from "../../core/base";
import { authenticate, validateRequest } from "../../core/middlewares";
import { AuthController } from "./auth.controller";
import { authValidator } from "./auth.validator";

/**
 * Authentication & Authorization Routes
 * Base path: /api/v1/auth
 */
export class AuthRoutes extends BaseRoute<AuthController> {
  constructor() {
    super(new AuthController());
  }

  protected initializeRoutes(): void {
    this.registerPublicAuthRoutes();
    this.registerProtectedAuthRoutes();
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
      this.controller.signup,
    );

    /**
     * POST /auth/signin
     */
    this.router.post(
      "/signin",
      validateRequest(authValidator.signin),
      this.controller.signin,
    );

    /**
     * POST /auth/verify-email
     */
    this.router.post(
      "/verify-email",
      validateRequest(authValidator.verifyEmail),
      this.controller.verifyEmail,
    );

    /**
     * POST /auth/resend-verification
     */
    this.router.post(
      "/resend-verification",
      validateRequest(authValidator.resendVerification),
      this.controller.resendVerification,
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
      this.controller.refreshToken,
    );
  }
}
