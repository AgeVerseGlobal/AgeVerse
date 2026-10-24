function json(res, status, body) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  return res.end(JSON.stringify(body));
}

function clean(value, max = 4000) {
  return String(value ?? "").trim().slice(0, max);
}

const GOOGLE_CONTACT_FORM_ACTION_URL =
  process.env.GOOGLE_CONTACT_FORM_ACTION_URL ||
  "https://docs.google.com/forms/d/e/1FAIpQLSeSddadUFlfKkeO-kSc5TMaYqrlKzbp72GRcBP9REd6R0CuJg/formResponse";

const ENTRY = {
  name: process.env.GOOGLE_CONTACT_FORM_ENTRY_NAME || "entry.1041465478",
  email: process.env.GOOGLE_CONTACT_FORM_ENTRY_EMAIL || "entry.29619713",
  subject: process.env.GOOGLE_CONTACT_FORM_ENTRY_SUBJECT || "entry.666306291",
  message: process.env.GOOGLE_CONTACT_FORM_ENTRY_MESSAGE || "entry.1929905653",
  page: process.env.GOOGLE_CONTACT_FORM_ENTRY_PAGE || "entry.219928551",
};

const SUBJECT_VALUES = new Set([
  "General Enquiry",
  "Calculator Issue",
  "Calculation / Result Issue",
  "Translation / Language Issue",
  "Website Problem",
  "Suggestion",
  "Business / Partnership",
  "Other",
]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  let body = req.body || {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); }
    catch { return json(res, 400, { ok: false, error: "Invalid contact data." }); }
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const subject = clean(body.subject, 200);
  const message = clean(body.message, 4000);
  const page = clean(body.page, 200);

  if (!name || !email || !subject || !message) {
    return json(res, 400, { ok: false, error: "Please complete all required fields." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(res, 400, { ok: false, error: "Please enter a valid email address." });
  }

  if (!SUBJECT_VALUES.has(subject)) {
    return json(res, 400, { ok: false, error: "Please select a valid subject." });
  }

  try {
    const form = new URLSearchParams();
    form.set(ENTRY.name, name);
    form.set(ENTRY.email, email);
    form.set(ENTRY.subject, subject);
    form.set(ENTRY.message, message);
    form.set(ENTRY.page, page || "Website");

    const response = await fetch(GOOGLE_CONTACT_FORM_ACTION_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: form.toString(),
    });

    if (!response.ok) {
      return json(res, 502, { ok: false, error: "Unable to send your message right now." });
    }

    return json(res, 200, { ok: true });
  } catch {
    return json(res, 502, { ok: false, error: "Unable to send your message right now." });
  }
}
