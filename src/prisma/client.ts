import { PrismaClient } from "@prisma/client";
import { logger } from "../core/utils/logger";

const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "error" },
    { emit: "event", level: "warn" },
  ],
});

prisma.$on("query", (e) => {
  if (process.env.NODE_ENV === "development") {
    logger.info(`Query: ${e.query}`);
  }
});

prisma.$on("error", (e) => logger.error(e));
prisma.$on("warn", (e) => logger.warn(e));

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export type { PrismaClient } from "@prisma/client";
export { prisma };
