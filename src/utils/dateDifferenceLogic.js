function calculateDateDifference(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return {
      years: 0,
      months: 0,
      days: 0,

      /*
       * Keep these as dates, not translated weekday strings.
       * DateDifferenceResultCard formats them according
       * to the currently selected language.
       */
      fromWeekdayDate: null,
      toWeekdayDate: null,

      totalYears: 0,
      totalMonths: 0,
      totalWeeks: 0,
      totalDays: 0,
      totalHours: 0,
      totalMinutes: 0,
      totalSeconds: 0,
    };
  }

  // Make sure start is earlier than end
  let from = start;
  let to = end;

  if (from > to) {
    [from, to] = [to, from];
  }

  // -----------------------------------------
  // EXACT YEARS / MONTHS / DAYS
  // -----------------------------------------

  let years =
    to.getFullYear() -
    from.getFullYear();

  let months =
    to.getMonth() -
    from.getMonth();

  let days =
    to.getDate() -
    from.getDate();

  if (days < 0) {
    months--;

    const previousMonthLastDay =
      new Date(
        to.getFullYear(),
        to.getMonth(),
        0
      ).getDate();

    days += previousMonthLastDay;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  // -----------------------------------------
  // TOTAL DIFFERENCE
  // -----------------------------------------

  const milliseconds =
    to.getTime() -
    from.getTime();

  const totalSeconds = Math.floor(
    milliseconds / 1000
  );

  const totalMinutes = Math.floor(
    milliseconds / (1000 * 60)
  );

  const totalHours = Math.floor(
    milliseconds / (1000 * 60 * 60)
  );

  const totalDays = Math.floor(
    milliseconds / (1000 * 60 * 60 * 24)
  );

  const totalWeeks = Math.floor(
    totalDays / 7
  );

  const totalMonths =
    years * 12 + months;

  const totalYears =
    Math.floor(
      totalDays / 365.2425
    );

  // -----------------------------------------
  // RETURN CLEAN, LANGUAGE-INDEPENDENT DATA
  // -----------------------------------------

  return {
    years,
    months,
    days,

    /*
     * IMPORTANT:
     * Do not convert these to "Monday",
     * "सोमवार", etc. here.
     *
     * The ResultCard will format them using
     * the currently selected language.
     */
    fromWeekdayDate: from.getTime(),
    toWeekdayDate: to.getTime(),

    totalYears,
    totalMonths,
    totalWeeks,
    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds,
  };
}

export {
  calculateDateDifference,
};