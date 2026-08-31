self.addEventListener("message", (event) => {
  const data = event.data;

  if (
    !data ||
    data.type !== "SHOW_RETIREMENT_NOTIFICATION"
  ) {
    return;
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title || "AgeVerse",
      {
        body:
          data.body ||
          "Retirement reminder from AgeVerse.",

        icon:
          data.icon ||
          "/favicon.ico",

        badge:
          data.badge ||
          "/favicon.ico",

        tag:
          data.tag ||
          "ageverse-retirement",

        requireInteraction: true,

        data: {
          url:
            data.url || "/",
        },
      }
    )
  );
});