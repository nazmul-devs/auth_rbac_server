import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "../api/docs/swagger";
import { AuthRoutes } from "../api/auth/auth.routes";
import { UserRoutes } from "../api/user/user.routes";

export const registerRoutes = (app: Application) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use("/api/v1/auth", new AuthRoutes().router);
  app.use("/api/v1/user", new UserRoutes().router);
};
