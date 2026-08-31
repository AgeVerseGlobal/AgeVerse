/* =========================================================
   AGEVERSE — REMINDER LOGIC
   ========================================================= */


/*
 * Convert reminder setting into minutes.
 */
export function getReminderMinutes(reminder) {

  if (
    !reminder ||
    reminder.type === "none"
  ) {
    return 0;
  }


  if (reminder.type === "24h") {

    return 24 * 60;

  }


  if (reminder.type === "1h") {

    return 60;

  }


  if (reminder.type === "10m") {

    return 10;

  }


  if (reminder.type === "custom") {

    const amount =
      Number(reminder.amount);


    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {

      return 0;

    }


    if (
      reminder.unit === "days"
    ) {

      return amount * 24 * 60;

    }


    if (
      reminder.unit === "hours"
    ) {

      return amount * 60;

    }


    if (
      reminder.unit === "minutes"
    ) {

      return amount;

    }


    return 0;

  }


  return 0;
}


/*
 * Calculate exact reminder date/time.
 */
export function calculateReminderTime(
  eventDateTime,
  reminder
) {

  if (!eventDateTime) {

    return null;

  }


  const minutes =
    getReminderMinutes(
      reminder
    );


  if (minutes <= 0) {

    return null;

  }


  const eventTime =
    new Date(eventDateTime);


  if (
    Number.isNaN(
      eventTime.getTime()
    )
  ) {

    return null;

  }


  return new Date(
    eventTime.getTime() -
    minutes * 60 * 1000
  );

}


/*
 * Check whether reminder time has arrived.
 */
export function isReminderDue(
  eventDateTime,
  reminder,
  currentTime = new Date()
) {

  const reminderTime =
    calculateReminderTime(
      eventDateTime,
      reminder
    );


  if (!reminderTime) {

    return false;

  }


  return (
    currentTime.getTime() >=
    reminderTime.getTime()
  );

}