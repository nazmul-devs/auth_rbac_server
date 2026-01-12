import { env } from "../../../config";

export const mailConfig = {
  smtp: {
    user: env.SMTP_USER_EMAIL,
    pass: env.SMTP_PASS,
  },
};
