import http from "http";
import app from "./app";
import { config } from "./core/config/env";
import { prisma } from "./prisma/client";
import { logger } from "./core/utils/logger";

const PORT = config.port;
const server = http.createServer(app);

/* -------------------- Start Server -------------------- */
server.listen(PORT, () => {
  logger.info(
    `🚀 Auth service running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
});

/* -------------------- Graceful Shutdown -------------------- */
const shutdown = async (signal: string) => {
  try {
    logger.info(`🧹 ${signal} received. Closing HTTP server...`);
    server.close(async () => {
      logger.info("🔒 HTTP server closed.");
      await prisma.$disconnect();
      logger.info("💾 Prisma disconnected.");
      process.exit(0);
    });
  } catch (err) {
    logger.error("❌ Error during shutdown", err);
    process.exit(1);
  }
};

["SIGTERM", "SIGINT"].forEach((sig) => {
  process.on(sig, () => shutdown(sig));
});
