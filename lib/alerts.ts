/**
 * NoTrace — Telegram Attack Alerts
 * Sends instant notifications to admin when suspicious activity is detected.
 */

const TELEGRAM_API = "https://api.telegram.org";

export type AlertType =
  | "rate_limit_breach"
  | "brute_force"
  | "mass_creation"
  | "invalid_requests";

interface AlertPayload {
  type: AlertType;
  ip: string;
  details?: string;
  count?: number;
}

const ALERT_EMOJIS: Record<AlertType, string> = {
  rate_limit_breach: "🚨",
  brute_force: "🔓",
  mass_creation: "💣",
  invalid_requests: "⚠️",
};

const ALERT_TITLES: Record<AlertType, string> = {
  rate_limit_breach: "Rate Limit Breach",
  brute_force: "Brute Force Attack",
  mass_creation: "Mass Secret Creation",
  invalid_requests: "Invalid Request Spike",
};

export async function sendTelegramAlert(payload: AlertPayload): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return;

  const emoji = ALERT_EMOJIS[payload.type];
  const title = ALERT_TITLES[payload.type];
  const time = new Date().toUTCString();

  const message = [
    `${emoji} *NoTrace Security Alert*`,
    `*Type:* ${title}`,
    `*IP:* \`${payload.ip}\``,
    payload.count ? `*Count:* ${payload.count} requests` : null,
    payload.details ? `*Details:* ${payload.details}` : null,
    `*Time:* ${time}`,
    `*Action:* Review and consider blocking this IP.`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });
  } catch (err) {
    console.error("Failed to send Telegram alert:", err);
  }
}
