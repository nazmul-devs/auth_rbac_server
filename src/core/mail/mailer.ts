import fs from "fs";
import handlebars from "handlebars";
import nodemailer from "nodemailer";
import path from "path";
import slackService from "../services/slack.service";
import { logger } from "../utils/logger";
import { mailConfig } from "./config/mail.config";

class Mailer {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: mailConfig.smtp,
    });
  }

  private async compileTemplate(
    templateName: string,
    data: any
  ): Promise<string> {
    const templatePath = path.join(
      __dirname,
      `../../templates/${templateName}.hbs`
    );

    const templateContent = await fs.promises.readFile(templatePath, "utf-8");
    const template = handlebars.compile(templateContent);
    return template(data);
  }

  async sendEmail(
    to: string,
    {
      subject,
      templateName,
      templateData,
      attachments,
    }: {
      subject: string;
      templateName: string;
      templateData: any;
      attachments?: { filename: string; path: string }[];
    }
  ): Promise<void> {
    try {
      const html = await this.compileTemplate(templateName, templateData);

      const mailOptions = {
        from: `Auth RBAC <${mailConfig.smtp.user}>`,
        to,
        subject,
        html,
        attachments,
      };

      await slackService.sendObjectMessage(
        templateData,
        `Email sent to ${mailOptions.to}`
      );

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${mailOptions.to}`);
      slackService.sendMessage(`Email sent to ${mailOptions.to}`);
    } catch (error) {
      logger.error("Error sending email:", error);
      throw error;
    }
  }
}

export default new Mailer();
