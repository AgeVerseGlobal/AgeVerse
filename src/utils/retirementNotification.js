/*
=========================================================
AGEVERSE — RETIREMENT NOTIFICATION SYSTEM
Notification Test + Retirement Reminder Support
=========================================================
*/

const SERVICE_WORKER_PATH = "/service-worker.js";

/*
=========================================================
SERVICE WORKER
=========================================================
*/

export async function registerRetirementServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration =
      await navigator.serviceWorker.register(
        SERVICE_WORKER_PATH
      );

    await navigator.serviceWorker.ready;

    return registration;
  } catch (error) {
    console.error(
      "AgeVerse Service Worker registration failed:",
      error
    );

    return null;
  }
}

/*
=========================================================
SUPPORT
=========================================================
*/

export function isNotificationSupported() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator
  );
}

export function getNotificationPermission() {
  if (
    typeof window === "undefined" ||
    !("Notification" in window)
  ) {
    return "unsupported";
  }

  return Notification.permission;
}

/*
=========================================================
PERMISSION
=========================================================
*/

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) {
    return "unsupported";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  try {
    return await Notification.requestPermission();
  } catch (error) {
    console.error(
      "Notification permission failed:",
      error
    );

    return "denied";
  }
}

/*
=========================================================
SETUP
=========================================================
*/

export async function setupRetirementNotifications() {
  if (!isNotificationSupported()) {
    return {
      supported: false,
      permission: "unsupported",
      registration: null,
    };
  }

  const registration =
    await registerRetirementServiceWorker();

  const permission =
    await requestNotificationPermission();

  return {
    supported: true,
    permission,
    registration,
  };
}

/*
=========================================================
SHOW NOTIFICATION
=========================================================
*/

export async function showRetirementNotification({
  title,
  body,
  tag = "ageverse-retirement",
}) {
  if (!isNotificationSupported()) {
    return false;
  }

  if (Notification.permission !== "granted") {
    return false;
  }

  try {
    const registration =
      await navigator.serviceWorker.ready;

    /*
     * Preferred path: active controller
     */
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SHOW_RETIREMENT_NOTIFICATION",

        title,
        body,

        icon: "/favicon.ico",
        badge: "/favicon.ico",

        tag,

        url: window.location.origin,
      });

      return true;
    }

    /*
     * Fallback
     */
    await registration.showNotification(title, {
      body,

      icon: "/favicon.ico",
      badge: "/favicon.ico",

      tag,

      requireInteraction: true,

      data: {
        url: window.location.origin,
      },
    });

    return true;
  } catch (error) {
    console.error(
      "Unable to show retirement notification:",
      error
    );

    return false;
  }
}

/*
=========================================================
PROFESSIONAL RETIREMENT MESSAGES
=========================================================
*/

export function getRetirementDayWish() {
  return (
    "🎉 Congratulations on your retirement! " +
    "Today marks the beginning of a new and meaningful " +
    "chapter in your life. May your retirement be filled " +
    "with good health, peace, happiness, and cherished " +
    "moments with your family and loved ones. " +
    "Wishing you a fulfilling, joyful, and prosperous " +
    "retirement journey.\n\n" +
    "With warm wishes,\n" +
    "AgeVerse.Global"
  );
}

export function getRetirementTodayMessage() {
  return (
    "🎉 Congratulations on Your Retirement!\n\n" +
    "Wishing you good health, happiness, peace, " +
    "and a fulfilling new chapter ahead.\n\n" +
    "Warm wishes from AgeVerse.Global. 🌸"
  );
}

export function getRetirementTomorrowMessage(
  retirementDate
) {
  return (
    "📅 Your retirement is tomorrow" +
    (retirementDate
      ? ` — ${retirementDate}`
      : "") +
    ". A new and meaningful chapter of life is about " +
    "to begin. Wishing you peace, happiness and " +
    "wonderful moments ahead. 🌸"
  );
}

export function getCustomRetirementReminderMessage(
  days,
  retirementDate
) {
  return (
    `🔔 Retirement Reminder — ${days} ${
      days === 1 ? "Day" : "Days"
    } Before\n\n` +
    "Your retirement milestone is approaching." +
    (retirementDate
      ? ` Retirement Date: ${retirementDate}.`
      : "") +
    " Please take a moment to prepare for this " +
    "important new chapter.\n\n" +
    "AgeVerse.Global"
  );
}

/*
=========================================================
DATE HELPERS
=========================================================
*/

export function getDateKey(
  date = new Date()
) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function getReminderDate(
  retirementTimestamp,
  reminderType,
  customReminderDays = 0
) {
  if (
    !retirementTimestamp ||
    !reminderType ||
    reminderType === "none"
  ) {
    return null;
  }

  const retirementDate =
    new Date(retirementTimestamp);

  if (Number.isNaN(retirementDate.getTime())) {
    return null;
  }

  if (reminderType === "on-day") {
    return new Date(
      retirementDate.getFullYear(),
      retirementDate.getMonth(),
      retirementDate.getDate()
    );
  }

  if (reminderType === "one-day-before") {
    return new Date(
      retirementDate.getFullYear(),
      retirementDate.getMonth(),
      retirementDate.getDate() - 1
    );
  }

  if (reminderType === "custom") {
    const days = Number(customReminderDays);

    if (
      !Number.isInteger(days) ||
      days < 1 ||
      days > 3650
    ) {
      return null;
    }

    return new Date(
      retirementDate.getFullYear(),
      retirementDate.getMonth(),
      retirementDate.getDate() - days
    );
  }

  return null;
}

export function isReminderDayToday(
  retirementTimestamp,
  reminderType,
  customReminderDays = 0,
  currentDate = new Date()
) {
  const reminderDate =
    getReminderDate(
      retirementTimestamp,
      reminderType,
      customReminderDays
    );

  if (!reminderDate) {
    return false;
  }

  return (
    getDateKey(reminderDate) ===
    getDateKey(currentDate)
  );
}

/*
=========================================================
DUPLICATE PROTECTION
=========================================================
*/

function getNotificationKey(
  retirementTimestamp,
  reminderType,
  customReminderDays = 0
) {
  const reminderDate =
    getReminderDate(
      retirementTimestamp,
      reminderType,
      customReminderDays
    );

  if (!reminderDate) {
    return null;
  }

  return (
    "ageverse_retirement_notification_" +
    reminderType +
    "_" +
    String(customReminderDays || 0) +
    "_" +
    getDateKey(reminderDate)
  );
}

function wasNotificationShown(
  retirementTimestamp,
  reminderType,
  customReminderDays
) {
  const key =
    getNotificationKey(
      retirementTimestamp,
      reminderType,
      customReminderDays
    );

  if (!key) {
    return false;
  }

  return (
    localStorage.getItem(key) === "shown"
  );
}

function markNotificationShown(
  retirementTimestamp,
  reminderType,
  customReminderDays
) {
  const key =
    getNotificationKey(
      retirementTimestamp,
      reminderType,
      customReminderDays
    );

  if (!key) {
    return;
  }

  localStorage.setItem(key, "shown");
}

/*
=========================================================
CHECK + SHOW ACTUAL REMINDER
=========================================================
*/

export async function checkRetirementReminder({
  retirementTimestamp,
  reminderType,
  customReminderDays = 0,
  retirementDate = "",
}) {
  if (
    !retirementTimestamp ||
    !reminderType ||
    reminderType === "none"
  ) {
    return false;
  }

  if (
    !isReminderDayToday(
      retirementTimestamp,
      reminderType,
      customReminderDays
    )
  ) {
    return false;
  }

  if (
    wasNotificationShown(
      retirementTimestamp,
      reminderType,
      customReminderDays
    )
  ) {
    return false;
  }

  let title = "";
  let body = "";

  if (reminderType === "on-day") {
    title =
      "🎉 Congratulations on Your Retirement!";

    body =
      getRetirementTodayMessage();
  }

  if (reminderType === "one-day-before") {
    title =
      "📅 Retirement Reminder";

    body =
      getRetirementTomorrowMessage(
        retirementDate
      );
  }

  if (reminderType === "custom") {
    const days =
      Number(customReminderDays);

    if (
      !Number.isInteger(days) ||
      days < 1 ||
      days > 3650
    ) {
      return false;
    }

    title =
      "🔔 Retirement Reminder";

    body =
      getCustomRetirementReminderMessage(
        days,
        retirementDate
      );
  }

  if (!title || !body) {
    return false;
  }

  const shown =
    await showRetirementNotification({
      title,
      body,

      tag:
        "ageverse-retirement-" +
        reminderType +
        "-" +
        String(customReminderDays || 0),
    });

  if (shown) {
    markNotificationShown(
      retirementTimestamp,
      reminderType,
      customReminderDays
    );
  }

  return shown;
}

/*
=========================================================
TEST NOTIFICATION
=========================================================
IMPORTANT:
This is only for development/testing.
It is not connected to retirement dates.
=========================================================
*/

export async function sendRetirementTestNotification() {
  const notification =
    await setupRetirementNotifications();

  if (
    !notification.supported
  ) {
    return {
      success: false,
      message:
        "Browser notifications are not supported.",
    };
  }

  if (
    notification.permission !== "granted"
  ) {
    return {
      success: false,
      message:
        "Notification permission was not granted.",
    };
  }

  const shown =
    await showRetirementNotification({
      title:
        "🎉 AgeVerse Notification Test",

      body:
        "Notification system is working correctly. " +
        "Retirement reminders and wishes can now be " +
        "connected safely.",

      tag:
        "ageverse-retirement-test",
    });

  return {
    success: shown,
    message: shown
      ? "Test notification sent successfully."
      : "Unable to send test notification.",
  };
}
/*
=========================================================
DEVELOPMENT TEST HELPERS
=========================================================
These functions are for testing notification messages
without waiting for an actual retirement date.

They do not affect the production reminder logic.
=========================================================
*/

/*
---------------------------------------------------------
TEST: RETIREMENT DAY
---------------------------------------------------------
*/

export async function testRetirementDayNotification() {
  if (!isNotificationSupported()) {
    return {
      success: false,
      message:
        "Browser notifications are not supported.",
    };
  }

  const permission =
    await requestNotificationPermission();

  if (permission !== "granted") {
    return {
      success: false,
      message:
        "Notification permission was not granted.",
    };
  }

  return showRetirementNotification({
    title:
      "🎉 Congratulations on Your Retirement!",

    body:
      "Wishing you good health, happiness, peace, " +
      "and a fulfilling new chapter ahead.\n\n" +
      "Warm wishes from AgeVerse.Global. 🌸",

    tag:
      "ageverse-test-retirement-day",
  });
}


/*
---------------------------------------------------------
TEST: ONE DAY BEFORE
---------------------------------------------------------
*/

export async function testOneDayBeforeNotification() {
  if (!isNotificationSupported()) {
    return {
      success: false,
      message:
        "Browser notifications are not supported.",
    };
  }

  const permission =
    await requestNotificationPermission();

  if (permission !== "granted") {
    return {
      success: false,
      message:
        "Notification permission was not granted.",
    };
  }

  return showRetirementNotification({
    title:
      "📅 Retirement Reminder",

    body:
      "Your retirement is tomorrow. " +
      "A new and meaningful chapter of life is " +
      "about to begin. Wishing you peace, happiness " +
      "and wonderful moments ahead. 🌸",

    tag:
      "ageverse-test-one-day-before",
  });
}


/*
---------------------------------------------------------
TEST: CUSTOM REMINDER
---------------------------------------------------------
*/

export async function testCustomReminderNotification(
  days = 7
) {
  const reminderDays = Number(days);

  if (
    !Number.isInteger(reminderDays) ||
    reminderDays < 1 ||
    reminderDays > 3650
  ) {
    return {
      success: false,
      message:
        "Test reminder days must be between 1 and 3650.",
    };
  }

  if (!isNotificationSupported()) {
    return {
      success: false,
      message:
        "Browser notifications are not supported.",
    };
  }

  const permission =
    await requestNotificationPermission();

  if (permission !== "granted") {
    return {
      success: false,
      message:
        "Notification permission was not granted.",
    };
  }

  return showRetirementNotification({
    title:
      "🔔 Retirement Reminder",

    body:
      `Your retirement milestone is approaching — ` +
      `${reminderDays} ${
        reminderDays === 1
          ? "day"
          : "days"
      } before retirement.\n\n` +
      "Please take a moment to prepare for this " +
      "important new chapter.\n\n" +
      "AgeVerse.Global",

    tag:
      "ageverse-test-custom-" +
      reminderDays,
  });
}