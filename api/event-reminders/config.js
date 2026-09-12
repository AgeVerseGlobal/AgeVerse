import { getVapidPublicKey, jsonResponse } from "./_common.js";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return jsonResponse(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  try {
    return jsonResponse(res, 200, {
      ok: true,
      publicKey: getVapidPublicKey(),
    });
  } catch (error) {
    return jsonResponse(res, 503, {
      ok: false,
      error: error.code === "CONFIG_MISSING"
        ? "Event reminders are not configured on the server yet."
        : "Event reminder configuration is invalid.",
    });
  }
}
