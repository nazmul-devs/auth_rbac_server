import cors, { CorsOptions } from "cors";
import { config } from "./env";

const isProduction = config.nodeEnv === "production";

const productionOrigins = [
  "https://your-production-domain.com",
  "https://admin.your-production-domain.com",
];

const localOrigins = ["http://localhost:3000"];

const allowedOrigins = isProduction ? productionOrigins : localOrigins;

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

export const corsMiddleware = cors(corsOptions);
