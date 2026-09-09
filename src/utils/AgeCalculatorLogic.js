import { formatLocalizedDate } from "./localizedDate";
export function calculateAge(startDate, endDate) {
  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();
  let days = endDate.getDate() - startDate.getDate();

  if (days < 0) {
    months--;

    const previousMonth = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      0
    );

    days += previousMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  // Total difference in milliseconds
  const difference = endDate.getTime() - startDate.getTime();

  const totalDays = Math.floor(
    difference / (1000 * 60 * 60 * 24)
  );

  const totalHours = Math.floor(
    difference / (1000 * 60 * 60)
  );

  const totalMinutes = Math.floor(
    difference / (1000 * 60)
  );

  const totalSeconds = Math.floor(
    difference / 1000
  );

  const totalMonths =
    years * 12 + months;

  const totalWeeks =
    Math.floor(totalDays / 7);

  return {
    years,
    months,
    days,

    totalMonths,
    totalWeeks,

    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds,

    // Keep compatibility with your existing ResultCard
    Days: totalDays,

    birthDay: formatLocalizedDate(startDate, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  };
}