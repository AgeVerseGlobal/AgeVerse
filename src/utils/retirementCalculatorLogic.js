/*
=========================================================
AGEVERSE — RETIREMENT CALCULATOR LOGIC
Stable Calculation + Custom Reminder Support
=========================================================
*/

import {
  formatLocalizedDate,
  formatLocalizedWeekday,
  getCurrentLocale,
} from "./localizedDate";

/*
=========================================================
STRICT DATE VALIDATION
=========================================================
*/

export function isValidDateString(dateString) {
  if (!dateString) {
    return false;
  }

  const parts = dateString.split("-");

  if (parts.length !== 3) {
    return false;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return false;
  }

  if (
    year < 1 ||
    month < 1 ||
    month > 12
  ) {
    return false;
  }

  const daysInMonth = new Date(
    year,
    month,
    0
  ).getDate();

  if (
    day < 1 ||
    day > daysInMonth
  ) {
    return false;
  }

  /*
   * Final safety check
   */
  const date = new Date(
    year,
    month - 1,
    day
  );

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}


/*
=========================================================
RETIREMENT DATE CALCULATION
=========================================================

Rule:

If DOB is the 1st of a month:
Retirement = last day of previous month

Otherwise:
Retirement = last day of DOB month

Example:

DOB 01/08/1970
Retirement = 31/07/2030

DOB 15/08/1970
Retirement = 31/08/2030
=========================================================
*/

function calculateRetirementDate(
  birthDate,
  retirementAge
) {
  const [
    year,
    month,
    day
  ] = birthDate
    .split("-")
    .map(Number);

  const retirementYear =
    year + retirementAge;

  if (day === 1) {
    return new Date(
      retirementYear,
      month - 1,
      0,
      0,
      0,
      0,
      0
    );
  }

  return new Date(
    retirementYear,
    month,
    0,
    0,
    0,
    0,
    0
  );
}


/*
=========================================================
REMINDER DAYS
=========================================================
*/

function getReminderDays(
  reminderType,
  customReminderDays
) {
  if (reminderType === "none") {
    return 0;
  }

  if (reminderType === "on-day") {
    return 0;
  }

  if (reminderType === "one-day-before") {
    return 1;
  }

  if (reminderType === "custom") {
    const days = Number(
      customReminderDays
    );

    if (
      !Number.isInteger(days) ||
      days < 1 ||
      days > 3650
    ) {
      return 0;
    }

    return days;
  }

  return 0;
}


/*
=========================================================
REMINDER DATE
=========================================================
*/

function calculateReminderDate(
  retirementDate,
  reminderType,
  customReminderDays
) {
  if (!retirementDate) {
    return null;
  }

  /*
   * Retirement day itself
   */
  if (reminderType === "on-day") {
    return new Date(
      retirementDate.getFullYear(),
      retirementDate.getMonth(),
      retirementDate.getDate(),
      0,
      0,
      0,
      0
    );
  }

  const days = getReminderDays(
    reminderType,
    customReminderDays
  );

  if (days <= 0) {
    return null;
  }

  return new Date(
    retirementDate.getFullYear(),
    retirementDate.getMonth(),
    retirementDate.getDate() - days,
    0,
    0,
    0,
    0
  );
}


/*
=========================================================
DATE FORMAT
=========================================================
*/


function formatDate(date) {
  return formatLocalizedDate(date, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}


/*
=========================================================
DATE + TIME FORMAT
=========================================================
*/

function formatDateTime(date) {
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  const locale = getCurrentLocale();

  const parts = new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);

  if (getCurrentLocale() === "hi-IN") {
    const formatted = parts
      .map((part) => {
        if (part.type === "dayPeriod") {
          const value = part.value.toLowerCase();

          if (value === "am") {
            return "पूर्वाह्न";
          }

          if (value === "pm") {
            return "अपराह्न";
          }
        }

        return part.value;
      })
      .join("");

    return formatted
      .replace(/बजे\s+बजे/g, "बजे")
      .replace(
        /(\d{1,2}:\d{2})\s+(पूर्वाह्न|अपराह्न)\s+बजे/,
        "$1 बजे $2"
      );
  }

  return parts
    .map((part) => part.value)
    .join("");
}


/*
=========================================================
WEEKDAY
=========================================================
*/

function getDay(date) {
  return formatLocalizedWeekday(date);
}


/*
=========================================================
REMINDER LABEL
=========================================================
*/

function getReminderLabel(
  reminderType,
  customReminderDays
) {
  if (reminderType === "none") {
    return "No Reminder";
  }

  if (reminderType === "on-day") {
    return "Retirement Day";
  }

  if (reminderType === "one-day-before") {
    return "1 Day Before";
  }

  if (reminderType === "custom") {
    const days = Number(
      customReminderDays
    );

    if (
      Number.isInteger(days) &&
      days >= 1
    ) {
      return `${days} Days Before`;
    }
  }

  return "No Reminder";
}


/*
=========================================================
RETIREMENT WISH
=========================================================
*/

function getRetirementWish() {
  return (
    "🎉 Congratulations on reaching this important " +
    "milestone! May your retirement bring you " +
    "happiness, good health, peace and plenty of " +
    "beautiful moments with your loved ones. " +
    "Wishing you a wonderful and fulfilling " +
    "retirement journey! 🌸"
  );
}


/*
=========================================================
MAIN RETIREMENT CALCULATOR
=========================================================
*/

export function calculateRetirement(
  birthDate,
  retirementAge = 60,
  reminderType = "none",
  customReminderDays = 0
) {
  /*
   * Strict DOB validation
   */
  if (
    !isValidDateString(
      birthDate
    )
  ) {
    return null;
  }

  /*
   * Retirement age validation
   */
  const age = Number(
    retirementAge
  );

  if (
    !Number.isFinite(age) ||
    age < 1 ||
    age > 100
  ) {
    return null;
  }

  /*
   * Custom reminder validation
   */
  if (reminderType === "custom") {
    const days = Number(
      customReminderDays
    );

    if (
      !Number.isInteger(days) ||
      days < 1 ||
      days > 3650
    ) {
      return null;
    }
  }

  /*
   * Calculate retirement date
   */
  const retirementDate =
    calculateRetirementDate(
      birthDate,
      age
    );

  const now = new Date();

  /*
   * Reminder date
   */
  const reminderDate =
    calculateReminderDate(
      retirementDate,
      reminderType,
      customReminderDays
    );

  /*
   * Reminder label
   */
  const reminderLabel =
    getReminderLabel(
      reminderType,
      customReminderDays
    );

  /*
   * =======================================================
   * RETIREMENT COMPLETED
   * =======================================================
   */

  if (
    retirementDate.getTime() <=
    now.getTime()
  ) {
    return {
      status: "completed",

      retirementDate:
        formatDate(
          retirementDate
        ),

      retirementDay:
        getDay(
          retirementDate
        ),

      retirementTimestamp:
        retirementDate.getTime(),

      reminderType,

      customReminderDays:
        reminderType === "custom"
          ? Number(
              customReminderDays
            )
          : 0,

      reminderLabel,

      reminderDate:
        reminderDate
          ? formatDateTime(
              reminderDate
            )
          : "",

      reminderTimestamp:
        reminderDate
          ? reminderDate.getTime()
          : null,

      message:
        "Your retirement date has already passed.",

      wishingMessage:
        getRetirementWish(),
    };
  }


  /*
   * =======================================================
   * CALENDAR DIFFERENCE
   * =======================================================
   */

  let years =
    retirementDate.getFullYear() -
    now.getFullYear();

  let months =
    retirementDate.getMonth() -
    now.getMonth();

  let days =
    retirementDate.getDate() -
    now.getDate();

  if (days < 0) {
    months--;

    const previousMonthDays =
      new Date(
        retirementDate.getFullYear(),
        retirementDate.getMonth(),
        0
      ).getDate();

    days += previousMonthDays;
  }

  if (months < 0) {
    years--;
    months += 12;
  }


  /*
   * =======================================================
   * EXACT COUNTDOWN
   * =======================================================
   */

  const difference =
    retirementDate.getTime() -
    now.getTime();

  const totalSeconds =
    Math.max(
      0,
      Math.floor(
        difference / 1000
      )
    );

  const hours =
    Math.floor(
      (totalSeconds % 86400) /
        3600
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) /
        60
    );

  const seconds =
    totalSeconds % 60;


  /*
   * =======================================================
   * FINAL RESULT
   * =======================================================
   */

  return {
    status: "upcoming",

    retirementDate:
      formatDate(
        retirementDate
      ),

    retirementDay:
      getDay(
        retirementDate
      ),

    retirementTimestamp:
      retirementDate.getTime(),

    years,
    months,
    days,

    hours,
    minutes,
    seconds,

    reminderType,

    customReminderDays:
      reminderType === "custom"
        ? Number(
            customReminderDays
          )
        : 0,

    reminderLabel,

    reminderDate:
      reminderDate
        ? formatDateTime(
            reminderDate
          )
        : "",

    reminderTimestamp:
      reminderDate
        ? reminderDate.getTime()
        : null,

    wishingMessage:
      getRetirementWish(),
  };
}


/*
=========================================================
PUBLIC HELPER
=========================================================
*/

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
    new Date(
      retirementTimestamp
    );

  if (
    Number.isNaN(
      retirementDate.getTime()
    )
  ) {
    return null;
  }

  return calculateReminderDate(
    retirementDate,
    reminderType,
    customReminderDays
  );
}


/*
=========================================================
DATE KEY
=========================================================
*/

export function getDateKey(
  date = new Date()
) {
  return [
    date.getFullYear(),

    String(
      date.getMonth() + 1
    ).padStart(2, "0"),

    String(
      date.getDate()
    ).padStart(2, "0"),
  ].join("-");
}


/*
=========================================================
CHECK REMINDER DATE
=========================================================
*/

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
    getDateKey(
      reminderDate
    ) ===
    getDateKey(
      currentDate
    )
  );
}


/*
=========================================================
EXPORT REMINDER LABEL
=========================================================
*/

export function getRetirementReminderLabel(
  reminderType,
  customReminderDays = 0
) {
  return getReminderLabel(
    reminderType,
    customReminderDays
  );
}