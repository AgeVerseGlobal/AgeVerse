import crypto from "node:crypto";
import {
  assertPost,
  jsonResponse,
  parseJsonBody,
  redisCommand,
  reminderKey,
  REMINDER_ZSET,
} from "./_common.js";

const MAX_FUTURE_MS = 366 * 24 * 60 * 60 * 1000;
const MAX_RETIREMENT_FUTURE_MS = 101 * 365 * 24 * 60 * 60 * 1000;

export default async function handler(req, res) {
  try {
    assertPost(req);
    const body = await parseJsonBody(req);
    const reminderKind = body.reminderKind === "retirement" ? "retirement" : "event";
    const eventName = String(body.eventName || (reminderKind === "retirement" ? "Retirement" : "Event")).trim().slice(0, 120);
    const eventTimestamp = Number(body.eventTimestamp);
    const reminderTimestamp = Number(body.reminderTimestamp);
    const subscription = body.subscription;

    if (!eventName || !Number.isFinite(eventTimestamp) || !Number.isFinite(reminderTimestamp)) {
      return jsonResponse(res, 400, { ok: false, error: "Invalid reminder data." });
    }
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return jsonResponse(res, 400, { ok: false, error: "Invalid push subscription." });
    }

    const now = Date.now();
    const maxFuture = reminderKind === "retirement" ? MAX_RETIREMENT_FUTURE_MS : MAX_FUTURE_MS;
    const invalidOrder = reminderKind === "retirement"
      ? reminderTimestamp > eventTimestamp
      : eventTimestamp <= reminderTimestamp;
    if (reminderTimestamp <= now || invalidOrder || eventTimestamp > now + maxFuture) {
      return jsonResponse(res, 400, { ok: false, error: "Reminder time must be in the future and before the event." });
    }

    const id = crypto.randomUUID();
    const record = {
      id,
      eventName,
      eventTimestamp,
      reminderTimestamp,
      reminderKind,
      reminderType: body.reminderType ? String(body.reminderType).slice(0, 40) : "",
      customReminderDays: Number.isFinite(Number(body.customReminderDays)) ? Number(body.customReminderDays) : 0,
      subscription: {
        endpoint: String(subscription.endpoint).slice(0, 2048),
        expirationTime: subscription.expirationTime ?? null,
        keys: {
          p256dh: String(subscription.keys.p256dh),
          auth: String(subscription.keys.auth),
        },
      },
      createdAt: now,
    };

    await redisCommand(["SET", reminderKey(id), JSON.stringify(record), "EX", 60 * 60 * 24 * 400]);
    await redisCommand(["ZADD", REMINDER_ZSET, reminderTimestamp, id]);

    return jsonResponse(res, 200, { ok: true, reminderId: id });
  } catch (error) {
    const status = error.statusCode || (error.code === "CONFIG_MISSING" ? 503 : 500);
    return jsonResponse(res, status, { ok: false, error: error.message || "Unable to schedule reminder." });
  }
}
