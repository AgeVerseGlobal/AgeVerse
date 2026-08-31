import { useEffect, useRef, useState } from "react";
import "./PetDateInput.css";

/*
=========================================================
  AGEVERSE — PET DATE INPUT
  Premium DD / MM / YYYY Input

  IMPORTANT:
  Parent value format:
  YYYY-MM-DD

  Example:
  15/08/2020 → 2020-08-15

  This component is intentionally isolated
  for Pet Age Calculator only.
=========================================================
*/

function PetDateInput({
  value,
  onChange,
  resetKey,
}) {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const dayRef = useRef(null);
  const monthRef = useRef(null);
  const yearRef = useRef(null);

  /*
  =======================================================
    RESET
  =======================================================
  */

  useEffect(() => {
    setDay("");
    setMonth("");
    setYear("");
  }, [resetKey]);

  /*
  =======================================================
    SYNC PARENT VALUE → INPUTS

    Expected:
    YYYY-MM-DD
  =======================================================
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
  =======================================================
    STRICT DATE VALIDATION
  =======================================================
  */

  function isValidDate(
    dayValue,
    monthValue,
    yearValue
  ) {
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
  =======================================================
    SEND DATE TO PARENT

    Only complete DD/MM/YYYY is sent.

    Invalid complete dates are also sent so that
    existing Pet Age Calculator validation can
    handle them.

    Example:
    30/02/2026
    becomes:
    2026-02-30
  =======================================================
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

    const fullDate =
      `${newYear}-${newMonth}-${newDay}`;

    /*
      Keep invalid date available to the parent.
    */

    if (
      !isValidDate(
        newDay,
        newMonth,
        newYear
      )
    ) {
      onChange(fullDate);
      return;
    }

    onChange(fullDate);
  }

  /*
  =======================================================
    DAY
  =======================================================
  */

  function handleDay(event) {
    const inputValue =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 2);

    setDay(inputValue);

    if (inputValue.length === 2) {
      const number = Number(inputValue);

      if (
        number >= 1 &&
        number <= 31
      ) {
        monthRef.current?.focus();
      }
    }

    updateDate(
      inputValue,
      month,
      year
    );
  }

  /*
  =======================================================
    MONTH
  =======================================================
  */

  function handleMonth(event) {
    const inputValue =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 2);

    setMonth(inputValue);

    if (inputValue.length === 2) {
      const number = Number(inputValue);

      if (
        number >= 1 &&
        number <= 12
      ) {
        yearRef.current?.focus();
      }
    }

    updateDate(
      day,
      inputValue,
      year
    );
  }

  /*
  =======================================================
    YEAR
  =======================================================
  */

  function handleYear(event) {
    const inputValue =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 4);

    setYear(inputValue);

    updateDate(
      day,
      month,
      inputValue
    );
  }

  /*
  =======================================================
    UI
  =======================================================
  */

  return (
    <div className="pet-date-input-wrapper">

      {/* DAY */}

      <input
        ref={dayRef}
        className="pet-date-part"
        type="text"
        placeholder="DD"
        maxLength={2}
        inputMode="numeric"
        autoComplete="off"
        value={day}
        onChange={handleDay}
        aria-label="Day"
      />

      <span className="pet-date-separator">
        /
      </span>

      {/* MONTH */}

      <input
        ref={monthRef}
        className="pet-date-part"
        type="text"
        placeholder="MM"
        maxLength={2}
        inputMode="numeric"
        autoComplete="off"
        value={month}
        onChange={handleMonth}
        aria-label="Month"
      />

      <span className="pet-date-separator">
        /
      </span>

      {/* YEAR */}

      <input
        ref={yearRef}
        className="pet-date-part pet-date-year"
        type="text"
        placeholder="YYYY"
        maxLength={4}
        inputMode="numeric"
        autoComplete="off"
        value={year}
        onChange={handleYear}
        aria-label="Year"
      />

    </div>
  );
}

export default PetDateInput;