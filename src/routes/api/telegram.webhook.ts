import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";

type Update = {
  message?: {
    chat: { id: number };
    text?: string;
    from?: { id: number; first_name?: string; username?: string };
  };
};

async function telegramApi(method: string, body: unknown) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("Bot token is not configured");
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export const Route = createFileRoute("/api/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) {
          return Response.json(
            { success: false, message: "TELEGRAM_BOT_TOKEN is not set" },
            { status: 503 },
          );
        }
        const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
        if (secret) {
          const header = request.headers.get("x-telegram-bot-api-secret-token");
          if (header !== secret) {
            return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
          }
        }
        const update = (await request.json()) as Update;
        const msg = update.message;
        if (!msg?.text) return Response.json({ success: true });
        const [cmd, arg] = msg.text.trim().split(/\s+/, 2);
        const appUrl = process.env.TELEGRAM_MINI_APP_URL ?? new URL(request.url).origin;
        const keyboard = {
          inline_keyboard: [[{ text: "Open TaskEarn PK", web_app: { url: appUrl } }]],
        };

        if (cmd === "/start") {
          if (arg) {
            const sql = await getSql();
            await sql`
              insert into notifications (user_id, type, title, body)
              select user_id, 'referral_joined', 'Telegram start', ${"Start payload " + arg}
              from app_profiles where referral_code = ${arg.toUpperCase()}
            `;
          }
          await telegramApi("sendMessage", {
            chat_id: msg.chat.id,
            text: "Welcome to TaskEarn PK. Points are campaign rewards, not cash. Open the app to start.",
            reply_markup: keyboard,
          });
        } else if (cmd === "/help") {
          await telegramApi("sendMessage", {
            chat_id: msg.chat.id,
            text: "/start /profile /tasks /balance /referral /leaderboard /support",
            reply_markup: keyboard,
          });
        } else if (cmd === "/support") {
          await telegramApi("sendMessage", {
            chat_id: msg.chat.id,
            text: "Open the app and go to Support to create a ticket.",
            reply_markup: keyboard,
          });
        } else {
          await telegramApi("sendMessage", {
            chat_id: msg.chat.id,
            text: "Open TaskEarn PK to view your profile, tasks, and ledger.",
            reply_markup: keyboard,
          });
        }
        return Response.json({ success: true });
      },
    },
  },
});
