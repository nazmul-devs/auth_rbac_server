import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.string().transform(Number),

  DATABASE_URL: z.string().url(),

  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string(),

  REFRESH_SECRET: z.string().min(10),
  REFRESH_EXPIRES_IN: z.string(),

  REFRESH_TOKEN_SECRET: z.string().min(10),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),

  BCRYPT_SALT_ROUNDS: z.string().transform(Number),

  SMTP_USER_EMAIL: z.string().email(),
  SMTP_PASS: z.string(),

  SLACK_WEBHOOK_URL: z.string().url(),

  FRONTEND_URL: z.string(),
  CLIENT_URL: z.string(),

  RATE_LIMIT_WINDOW_MS: z.string().transform(Number),
  RATE_LIMIT_MAX: z.string().transform(Number),

  REDIS_URL: z.string(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
