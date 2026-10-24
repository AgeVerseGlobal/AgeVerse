import {
  jsonResponse,
  redisCommand,
  reminderKey,
  REMINDER_ZSET,
  sendWebPush,
} from "./_common.js";

const MAX_BATCH = 50;

function isAuthorized(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = req.headers.authorization || "";
  return auth === `Bearer ${secret}`;
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    return jsonResponse(res, 405, { ok: false, error: "Method Not Allowed" });
  }
  if (!isAuthorized(req)) {
    return jsonResponse(res, 401, { ok: false, error: "Unauthorized" });
  }

  try {
    const dueIds = await redisCommand(["ZRANGEBYSCORE", REMINDER_ZSET, "-inf", Date.now(), "LIMIT", 0, MAX_BATCH]);
    let sent = 0;
    let removed = 0;
    let failed = 0;

    for (const id of Array.isArray(dueIds) ? dueIds : []) {
      const raw = await redisCommand(["GET", reminderKey(id)]);
      if (!raw) {
        await redisCommand(["ZREM", REMINDER_ZSET, id]);
        removed += 1;
        continue;
      }

      let record;
      try {
        record = JSON.parse(raw);
      } catch {
        await redisCommand(["ZREM", REMINDER_ZSET, id]);
        await redisCommand(["DEL", reminderKey(id)]);
        removed += 1;
        continue;
      }

      try {
        const isRetirement = record.reminderKind === "retirement";
        const title = isRetirement
          ? (record.reminderType === "on-day"
              ? "🎉 Congratulations on Your Retirement!"
              : "🔔 Retirement Reminder")
          : `🔔 ${record.eventName} Reminder`;
        const body = isRetirement
          ? (record.reminderType === "on-day"
              ? "🎉 Congratulations on your retirement! Wishing you good health, happiness, peace, and a fulfilling new chapter ahead. Warm wishes from AgeVerseGlobal. 🌸"
              : record.reminderType === "one-day-before"
                ? `📅 Your retirement is tomorrow. Retirement Date: ${new Date(record.eventTimestamp).toLocaleDateString()}. Wishing you peace, happiness and wonderful moments ahead. 🌸`
                : `🔔 Retirement Reminder — ${record.customReminderDays} ${record.customReminderDays === 1 ? "Day" : "Days"} Before. Your retirement milestone is approaching. Retirement Date: ${new Date(record.eventTimestamp).toLocaleDateString()}. Please take a moment to prepare for this important new chapter.\n\nAgeVerseGlobal`)
          : `Your ${record.eventName} is coming up soon.`;

        const response = await sendWebPush(record.subscription, {
          type: isRetirement ? "RETIREMENT_REMINDER" : "EVENT_REMINDER",
          title,
          body,
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          tag: `${isRetirement ? "ageverse-retirement" : "ageverse-event"}-${record.id}`,
          url: isRetirement ? "/retirement-calculator" : "/event-calculator",
          eventTimestamp: record.eventTimestamp,
          reminderType: record.reminderType || "",
          customReminderDays: record.customReminderDays || 0,
        });

        if (response.ok || response.status === 201 || response.status === 202) {
          await redisCommand(["ZREM", REMINDER_ZSET, id]);
          await redisCommand(["DEL", reminderKey(id)]);
          sent += 1;
        } else if (response.status === 404 || response.status === 410) {
          await redisCommand(["ZREM", REMINDER_ZSET, id]);
          await redisCommand(["DEL", reminderKey(id)]);
          removed += 1;
        } else {
          failed += 1;
        }
      } catch {
        failed += 1;
      }
    }

    return jsonResponse(res, 200, { ok: true, sent, removed, failed });
  } catch (error) {
    const status = error.code === "CONFIG_MISSING" ? 503 : 500;
    return jsonResponse(res, status, { ok: false, error: error.message || "Reminder dispatch failed." });
  }
}
