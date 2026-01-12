import compression from "compression";
import express, { Application } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "../config";
import { corsMiddleware } from "../core/config/cors.config";

export const registerMiddlewares = (app: Application) => {
  app.use(helmet());
  app.use(corsMiddleware);
  app.use(compression());

  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  app.use(
    "/api",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      message: "Too many requests, please try again later.",
    })
  );
};
