import compression from "compression";
import express, { Application, NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { AuthRoutes } from "./api/auth/auth.routes";
import swaggerSpec from "./api/docs/swagger";
import { UserRoutes } from "./api/user/user.routes";
import { corsMiddleware } from "./core/config/cors.config";
import { AppError } from "./core/errors/AppError";
import { errorHandler } from "./core/errors/errorHandler";
import { emailEvents } from "./core/events/email.events";
import { eventBus } from "./core/events/event-bul.service";
import { logger } from "./core/utils/logger";

const app: Application = express();

// Register event handlers
emailEvents(eventBus);

/* Security Middlewares -------------------- */
app.use(helmet());
app.use(corsMiddleware);
app.use(compression());

/* Basic Config -------------------- */
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.disable("x-powered-by");

/* Logging -------------------- */
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

/* Rate Limiting -------------------- */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many requests, please try again later.",
});
app.use("/api", limiter);

// Swagger route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* Health Check -------------------- */
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/* API Routes -------------------- */
app.use("/api/v1/auth", new AuthRoutes().router);
app.use("/api/v1/user", new UserRoutes().router);

/* Swagger Docs (optional) -------------------- */
if (process.env.NODE_ENV !== "production") {
  //   app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

/* 404 Handler -------------------- */
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(
    new AppError(
      `Can't find ${req.originalUrl} on this server!`,
      404,
      "NOT_FOUND"
    )
  );
});

/* Global Error Handler -------------------- */
app.use(errorHandler);

/* Unhandled Rejection / Exception Guards -------------------- */
process.on("uncaughtException", (err) => {
  logger.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error(`❌ Unhandled Rejection: ${reason}`);
});

export default app;
