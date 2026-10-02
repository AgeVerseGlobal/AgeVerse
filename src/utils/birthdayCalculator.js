export function calculateNextBirthday(birthDate, currentDate) {
  const birthMonth = birthDate.getMonth();
  const birthDay = birthDate.getDate();

  let nextBirthday = new Date(
    currentDate.getFullYear(),
    birthMonth,
    birthDay
  );

  /*
   * If this year's birthday has already passed,
   * move to next year.
   */
  if (nextBirthday < currentDate) {
    nextBirthday = new Date(
      currentDate.getFullYear() + 1,
      birthMonth,
      birthDay
    );
  }

  /*
   * Handle 29 February birthdays.
   * In a non-leap year, use 28 February.
   */
  if (
    birthMonth === 1 &&
    birthDay === 29 &&
    nextBirthday.getMonth() !== 1
  ) {
    nextBirthday = new Date(
      nextBirthday.getFullYear(),
      1,
      28
    );
  }

  const difference =
    nextBirthday.getTime() - currentDate.getTime();

  const days = Math.max(
    0,
    Math.ceil(
      difference / (1000 * 60 * 60 * 24)
    )
  );

  const months = Math.floor(days / 30);

  const remainingDays = days % 30;

  return {
    date: nextBirthday,
    days,
    months,
    remainingDays
  };
}