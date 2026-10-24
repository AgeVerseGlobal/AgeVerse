const SERVICE_WORKER_PATH = "/service-worker.js";

function base64UrlToUint8Array(value) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

export function isEventReminderSupported() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    window.isSecureContext
  );
}

export async function requestEventNotificationPermission() {
  // Permission itself only depends on the Notification API.
  // Push/service-worker capability is validated when the reminder is scheduled.
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";

  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

async function registerServiceWorker() {
  const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH);
  await navigator.serviceWorker.ready;
  return registration;
}

async function getServerConfig() {
  const response = await fetch("/api/event-reminders/config", {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.publicKey) {
    throw new Error(data.error || "Event reminder service is not configured.");
  }
  return data;
}

async function getPushSubscription(publicKey) {
  const registration = await registerServiceWorker();
  if (!registration?.pushManager) {
    throw new Error("Background notifications are not available in this browser.");
  }
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8Array(publicKey),
    });
  }

  return subscription;
}

export async function scheduleEventReminder({
  eventName,
  eventTimestamp,
  reminderTimestamp,
}) {
  if (!isEventReminderSupported()) {
    throw new Error("Notifications are unavailable in this browser or context.");
  }

  if (Notification.permission !== "granted") {
    throw new Error("Notification permission is required for the event reminder.");
  }

  const config = await getServerConfig();
  const subscription = await getPushSubscription(config.publicKey);

  const response = await fetch("/api/event-reminders/schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventName,
      eventTimestamp,
      reminderTimestamp,
      subscription: subscription.toJSON(),
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.reminderId) {
    throw new Error(data.error || "Unable to schedule the event reminder.");
  }

  return data.reminderId;
}

export async function cancelEventReminder(reminderId) {
  if (!reminderId) return true;

  try {
    const response = await fetch("/api/event-reminders/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reminderId }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
