// src/events/email.events.ts

import mailer from "../mail/mailer";
import { logger } from "../utils/logger";
import { Event } from "./event-bul.service";

interface LoginInitiate {
  userId: string;
  email: string;
  name: string;
  verificationLink: string;
}

export const emailEvents = (eventBus: any) => {
  /**
   * @Sent_email_verification
   */
  eventBus.subscribe(
    "email_verification:signup",
    async (event: Event<LoginInitiate>) => {
      const { email, name, verificationLink } = event.payload;

      try {
        //  Send email
        await mailer.sendEmail(email, {
          subject: "Verify your email address",
          templateName: "verify-email",
          templateData: {
            name,
            verificationLink,
          },
        });

        logger.info(`Email signup verification sent to ${email} successfully.`);
      } catch (err) {
        logger.error(
          `Failed to send email signup verification to ${email}:`,
          err
        );
      }
    }
  );
};
