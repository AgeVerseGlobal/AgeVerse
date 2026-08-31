import { useEffect, useRef, useState } from "react";
import "./DateInput.css";

function DateInput({ value, onChange, resetKey }) {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const dayRef = useRef(null);
  const monthRef = useRef(null);
  const yearRef = useRef(null);

  /*
   * RESET
   *
   * resetKey changes whenever parent calculator
   * presses Reset.
   */
  useEffect(() => {
    setDay("");
    setMonth("");
    setYear("");
  }, [resetKey]);

  /*
   * SYNC PARENT VALUE → INPUTS
   *
   * Expected format:
   * YYYY-MM-DD
   */
  useEffect(() => {
    if (!value) {
      return;
    }

    const parts = value.split("-");

    if (parts.length !== 3) {
      return;
    }

    const newYear = parts[0];
    const newMonth = parts[1];
    const newDay = parts[2];

    setYear((current) =>
      current === newYear ? current : newYear
    );

    setMonth((current) =>
      current === newMonth ? current : newMonth
    );

    setDay((current) =>
      current === newDay ? current : newDay
    );
  }, [value]);

  /*
   * STRICT DATE VALIDATION
   *
   * Prevents invalid dates such as:
   * 30/02/2026
   * 31/02/2026
   * 31/04/2026
   *
   * Allows:
   * 29/02/2024
   *
   * Rejects:
   * 29/02/2026
   */
  function isValidDate(dayValue, monthValue, yearValue) {
    const dayNumber = Number(dayValue);
    const monthNumber = Number(monthValue);
    const yearNumber = Number(yearValue);

    if (
      !Number.isInteger(dayNumber) ||
      !Number.isInteger(monthNumber) ||
      !Number.isInteger(yearNumber)
    ) {
      return false;
    }

    if (
      yearNumber < 1 ||
      monthNumber < 1 ||
      monthNumber > 12
    ) {
      return false;
    }

    const daysInMonth = new Date(
      yearNumber,
      monthNumber,
      0
    ).getDate();

    if (
      dayNumber < 1 ||
      dayNumber > daysInMonth
    ) {
      return false;
    }

    /*
     * Final safety check.
     */
    const date = new Date(
      yearNumber,
      monthNumber - 1,
      dayNumber
    );

    return (
      date.getFullYear() === yearNumber &&
      date.getMonth() === monthNumber - 1 &&
      date.getDate() === dayNumber
    );
  }

  /*
   * SEND COMPLETE VALID DATE TO PARENT
   *
   * Important:
   * Incomplete date is NOT treated as an error.
   *
   * Parent receives a date only when:
   * DD = 2 digits
   * MM = 2 digits
   * YYYY = 4 digits
   * AND the date is genuine.
   */
  function updateDate(
    newDay,
    newMonth,
    newYear
  ) {
    if (
      newDay.length !== 2 ||
      newMonth.length !== 2 ||
      newYear.length !== 4
    ) {
      return;
    }

    if (
  !isValidDate(
    newDay,
    newMonth,
    newYear
  )
) {
  /*
   * IMPORTANT:
   * Do not convert an invalid date into an empty value.
   *
   * The parent calculator must receive the entered
   * date so its existing validation can identify it
   * as an invalid date.
   *
   * Example:
   * 30/02/2026 → 2026-02-30
   */
  onChange(
    `${newYear}-${newMonth}-${newDay}`
  );

  return;
}

    const fullDate =
      `${newYear}-${newMonth}-${newDay}`;

    onChange(fullDate);
  }

  /*
   * DAY
   */
  function handleDay(event) {
    const value =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 2);

    setDay(value);

    /*
     * Move to month after entering a valid
     * two-digit day.
     */
    if (value.length === 2) {
      const number = Number(value);

      if (
        number >= 1 &&
        number <= 31
      ) {
        monthRef.current?.focus();
      }
    }

    updateDate(
      value,
      month,
      year
    );
  }

  /*
   * MONTH
   */
  function handleMonth(event) {
    const value =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 2);

    setMonth(value);

    /*
     * Move to year after entering a valid
     * two-digit month.
     */
    if (value.length === 2) {
      const number = Number(value);

      if (
        number >= 1 &&
        number <= 12
      ) {
        yearRef.current?.focus();
      }
    }

    updateDate(
      day,
      value,
      year
    );
  }

  /*
   * YEAR
   */
  function handleYear(event) {
    const value =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 4);

    setYear(value);

    updateDate(
      day,
      month,
      value
    );
  }

  return (
    <div className="date-input-wrapper">

      {/* DAY */}

      <input
        ref={dayRef}
        className="date-part"
        type="text"
        placeholder="DD"
        maxLength={2}
        inputMode="numeric"
        value={day}
        onChange={handleDay}
        aria-label="Day"
      />

      <span className="date-separator">
        /
      </span>

      {/* MONTH */}

      <input
        ref={monthRef}
        className="date-part"
        type="text"
        placeholder="MM"
        maxLength={2}
        inputMode="numeric"
        value={month}
        onChange={handleMonth}
        aria-label="Month"
      />

      <span className="date-separator">
        /
      </span>

      {/* YEAR */}

      <input
        ref={yearRef}
        className="date-part year"
        type="text"
        placeholder="YYYY"
        maxLength={4}
        inputMode="numeric"
        value={year}
        onChange={handleYear}
        aria-label="Year"
      />

    </div>
  );
}

export default DateInput;