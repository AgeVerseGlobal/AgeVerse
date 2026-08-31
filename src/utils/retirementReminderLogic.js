/*
=========================================================
AGEVERSE — RETIREMENT REMINDER LOGIC
Day-based reminder only.
=========================================================
*/

import { formatLocalizedDate, formatLocalizedWeekday } from "./localizedDate";


export function getReminderDays(reminder) {

  if (
    !reminder ||
    reminder.type === "none"
  ) {
    return 0;
  }


  if (reminder.type === "30d") {
    return 30;
  }


  if (reminder.type === "7d") {
    return 7;
  }


  if (reminder.type === "1d") {
    return 1;
  }


  if (reminder.type === "custom") {

    const days =
      Number(reminder.days);

    if (
      !Number.isFinite(days) ||
      days <= 0
    ) {
      return 0;
    }

    return days;
  }


  return 0;
}


/*
=========================================================
CALCULATE REMINDER DATE
=========================================================
*/

export function calculateRetirementReminder(
  retirementDateISO,
  reminder
) {

  if (
    !retirementDateISO ||
    !reminder
  ) {
    return null;
  }


  const days =
    getReminderDays(reminder);


  if (days <= 0) {
    return null;
  }


  const retirementDate =
    new Date(
      `${retirementDateISO}T00:00:00`
    );


  if (
    Number.isNaN(
      retirementDate.getTime()
    )
  ) {
    return null;
  }


  const reminderDate =
    new Date(
      retirementDate.getTime() -
      days * 24 * 60 * 60 * 1000
    );


  return {

    days,

    dateISO:
      toISODate(reminderDate),

    formattedDate:
      formatDate(reminderDate),

    weekday:
      formatLocalizedWeekday(reminderDate),

    passed:
      reminderDate.getTime() <=
      Date.now()

  };
}


/*
=========================================================
REMINDER LABEL
=========================================================
*/

export function getReminderLabel(
  reminder
) {

  const days =
    getReminderDays(reminder);


  if (days <= 0) {
    return "No Reminder";
  }


  if (days === 1) {
    return "1 Day Before";
  }


  return `${days} Days Before`;
}


/*
=========================================================
FORMAT
=========================================================
*/

function formatDate(date) {

  return formatLocalizedDate(date, {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

}


function toISODate(date) {

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}