import { Application } from "express";
import { createApp } from "../app/app";
import { registerMiddlewares } from "../app/middlewares";
import { registerRoutes } from "../app/routes";
import { registerHealthCheck } from "../app/health";
import { AppError } from "../core/errors/AppError";
import { errorHandler } from "../core/errors/errorHandler";

export const bootstrapApp = (): Application => {
  const app = createApp();

  registerMiddlewares(app);
  registerHealthCheck(app);
  registerRoutes(app);

  app.use((req, _res, next) => {
    next(
      new AppError(
        `Can't find ${req.originalUrl} on this server!`,
        404,
        "NOT_FOUND"
      )
    );
  });

  app.use(errorHandler);

  return app;
};
