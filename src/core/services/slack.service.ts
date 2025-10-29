import { config } from "../config/env.config";

/** webhook url creation
 *
 * 1.visit: https://api.slack.com/apps
 * 2.Click “Create New App” → “From scratch”
 * 3.App Name -> Select workspace -> "Create App"
 * 4.Features->Incoming Webhooks
 * 5.Toggle “Activate Incoming Webhooks” → ON
 * 6.Scroll down and click “Add New Webhook to Workspace”
 * 7.copy: https://hooks.slack.com/services/T.../B.../XXX
 *
 */

class SlackService {
  async sendMessage(message: string) {
    const payload = { text: message };

    const res = await fetch(config.slackWebhook!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("Failed to send Slack message", await res.text());
    }
  }

  async sendObjectMessage(data: Record<string, any>, message?: string) {
    const payload = {
      text: message || "New message received:",
      attachments: [{ text: JSON.stringify(data, null, 2) }],
    };

    const res = await fetch(config.slackWebhook!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("Failed to send Slack object message", await res.text());
    }
  }
}

export default new SlackService();
