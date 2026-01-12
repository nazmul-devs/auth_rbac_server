import { env } from "./env";

export const jwtConfig = {
  access: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  refresh: {
    secret: env.REFRESH_SECRET,
    expiresIn: env.REFRESH_EXPIRES_IN,
  },
  token: {
    secret: env.REFRESH_TOKEN_SECRET,
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
  },
};
