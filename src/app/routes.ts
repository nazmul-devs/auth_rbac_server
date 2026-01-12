import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import { AuthRoutes } from "../api/auth";
import { swaggerSpec } from "../api/docs/swagger";
import { UserRoutes } from "../api/user/user.routes";

export const registerRoutes = (app: Application) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use("/api/v1/auth", new AuthRoutes().router);
  app.use("/api/v1/user", new UserRoutes().router);
};
