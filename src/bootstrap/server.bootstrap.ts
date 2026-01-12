import { Application } from "express";
import http from "http";
import { env } from "../config";
import { logger } from "../core/utils/logger";

export const startServer = (app: Application) => {
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    logger.info(
      `🚀 Auth service running in ${env.NODE_ENV} mode on port ${env.PORT}`
    );
  });

  return server;
};
