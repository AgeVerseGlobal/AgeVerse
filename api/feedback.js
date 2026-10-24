function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  return res.end(JSON.stringify(body));
}

function clean(value, max = 2000) {
  return String(value ?? "").trim().slice(0, max);
}

function getCountryName(code) {
  const normalized = clean(code, 8).toUpperCase();
  if (!normalized) return "Unknown";
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(normalized) || normalized;
  } catch {
    return normalized;
  }
}

function getVercelHeader(req, name) {
  return clean(req.headers[name] || req.headers[name.toLowerCase()] || "", 160);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "Method Not Allowed" });

  const webAppUrl = clean(process.env.GOOGLE_FEEDBACK_WEB_APP_URL, 1000);
  const actionUrl = clean(process.env.GOOGLE_FORM_ACTION_URL, 1000);
  const entryDateTime = clean(process.env.GOOGLE_FORM_ENTRY_DATE_TIME, 100);
  const entryCountry = clean(process.env.GOOGLE_FORM_ENTRY_COUNTRY, 100);
  const entryCity = clean(process.env.GOOGLE_FORM_ENTRY_CITY, 100);
  const entryPage = clean(process.env.GOOGLE_FORM_ENTRY_PAGE, 100);
  const entryRating = clean(process.env.GOOGLE_FORM_ENTRY_RATING, 100);
  const entryFeedback = clean(process.env.GOOGLE_FORM_ENTRY_FEEDBACK, 100);

  if (!webAppUrl && (!actionUrl || !entryDateTime || !entryCountry || !entryCity || !entryPage || !entryRating || !entryFeedback)) {
    return json(res, 503, { ok: false, error: "Feedback service is not configured yet." });
  }

  let body = req.body || {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return json(res, 400, { ok: false, error: "Invalid feedback data." }); }
  }

  const rating = Number(body.rating);
  const feedback = clean(body.feedback, 2000);
  const page = clean(body.page, 160);
  const dateTime = clean(body.dateTime, 80) || new Date().toISOString();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return json(res, 400, { ok: false, error: "Please select a rating." });
  }
  if (!feedback) return json(res, 400, { ok: false, error: "Please enter your feedback." });

  // Vercel supplies approximate city/country from the request IP. We only
  // forward the derived city/country to the feedback form; the visitor IP is
  // never included in the submitted feedback fields.
  const country = getCountryName(getVercelHeader(req, "x-vercel-ip-country"));
  const city = getVercelHeader(req, "x-vercel-ip-city") || "Unknown";

  if (webAppUrl) {
    try {
      const response = await fetch(webAppUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, city, page, rating, feedback, dateTime }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        return json(res, 502, { ok: false, error: "Unable to submit feedback right now." });
      }
      return json(res, 200, { ok: true });
    } catch {
      return json(res, 502, { ok: false, error: "Unable to submit feedback right now." });
    }
  }

  const form = new URLSearchParams();
  form.set(entryDateTime, dateTime);
  form.set(entryCountry, country);
  form.set(entryCity, city);
  form.set(entryPage, page);
  form.set(entryRating, String(rating));
  form.set(entryFeedback, feedback);

  try {
    const response = await fetch(actionUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: form.toString(),
      redirect: "manual",
    });

    // Google Forms commonly responds with a redirect or a successful 2xx.
    if (response.status < 200 || response.status >= 400) {
      return json(res, 502, { ok: false, error: "Unable to submit feedback right now." });
    }

    return json(res, 200, { ok: true });
  } catch {
    return json(res, 502, { ok: false, error: "Unable to submit feedback right now." });
  }
}
