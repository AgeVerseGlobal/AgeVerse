self.addEventListener("message", (event) => {
  const data = event.data;

  if (!data || data.type !== "SHOW_RETIREMENT_NOTIFICATION") {
    return;
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title || "AgeVerseGlobal",
      {
        body: data.body || "Retirement reminder from AgeVerseGlobal.",
        icon: data.icon || "/favicon.ico",
        badge: data.badge || "/favicon.ico",
        tag: data.tag || "ageverse-retirement",
        requireInteraction: true,
        data: { url: data.url || "/" },
      }
    )
  );
});

self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      body: event.data ? event.data.text() : "Event reminder from AgeVerseGlobal.",
    };
  }

  if (data.type !== "EVENT_REMINDER" && data.type !== "RETIREMENT_REMINDER") {
    return;
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title || "🔔 AgeVerseGlobal Reminder",
      {
        body: data.body || (data.type === "RETIREMENT_REMINDER" ? "Your retirement reminder from AgeVerseGlobal." : "Your event is coming up soon."),
        icon: data.icon || "/favicon.ico",
        badge: data.badge || "/favicon.ico",
        tag: data.tag || (data.type === "RETIREMENT_REMINDER" ? "ageverse-retirement-reminder" : "ageverse-event-reminder"),
        requireInteraction: true,
        data: { url: data.url || (data.type === "RETIREMENT_REMINDER" ? "/retirement-calculator" : "/event-calculator") },
      }
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || "/",
    self.location.origin
  ).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl);
    })
  );
});
