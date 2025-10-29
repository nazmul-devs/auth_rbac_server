import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  slackWebhook: process.env.SLACK_WEBHOOK_URL,
  SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10"),
  jwt: {
    jwtSecret: process.env.JWT_SECRET || "access_secret",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
    refreshSecret: process.env.REFRESH_SECRET || "refresh_secret",
    refreshExpiresIn: process.env.REFRESH_EXPIRES_IN || "7d",
  },
  db: {
    url: process.env.DATABASE_URL || "",
  },
  redis: {
    url: process.env.REDIS_URL || "",
  },
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60000,
    max: process.env.RATE_LIMIT_MAX || 60000,
  },
  nodemailer: {
    user: process.env.SMTP_USER_EMAIL,
    pass: process.env.SMTP_PASS,
  },
};
