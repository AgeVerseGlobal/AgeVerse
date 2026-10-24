import {
  assertPost,
  jsonResponse,
  parseJsonBody,
  redisCommand,
  reminderKey,
  REMINDER_ZSET,
} from "./_common.js";

export default async function handler(req, res) {
  try {
    assertPost(req);
    const body = await parseJsonBody(req);
    const id = String(body.reminderId || "").trim();
    if (!id || !/^[a-f0-9-]{20,80}$/i.test(id)) {
      return jsonResponse(res, 400, { ok: false, error: "Invalid reminder id." });
    }

    await redisCommand(["ZREM", REMINDER_ZSET, id]);
    await redisCommand(["DEL", reminderKey(id)]);
    return jsonResponse(res, 200, { ok: true });
  } catch (error) {
    const status = error.statusCode || (error.code === "CONFIG_MISSING" ? 503 : 500);
    return jsonResponse(res, status, { ok: false, error: error.message || "Unable to cancel reminder." });
  }
}
