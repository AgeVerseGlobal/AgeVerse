import { useState, useRef } from "react";
import "./DateDifferenceCalculator.css";

import CalculatorLayout from "../components/CalculatorLayout";
import DateInput from "../components/DateInput";
import DateDifferenceResultCard from "../components/DateDifferenceResultCard";

import { calculateDateDifference } from "../utils/dateDifferenceLogic";

function DateDifferenceCalculator() {

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [resetKey, setResetKey] = useState(0);

  const resultRef = useRef(null);


  /* =========================================================
     DATE VALIDATION
     Date Difference Calculator specific validation.
     Future dates are allowed.
     ========================================================= */

  function validateDateInput(dateString, label) {

    if (!dateString) {
      return `${label} is required.`;
    }

    const parts = dateString.split("-");

    if (parts.length !== 3) {
      return `${label} is incomplete.`;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);


    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      !Number.isInteger(day)
    ) {
      return `${label} is invalid.`;
    }


    if (year < 1 || year > 9999) {
      return `${label} has an invalid year.`;
    }


    if (month < 1 || month > 12) {
      return `${label} has an invalid month.`;
    }


    if (day < 1 || day > 31) {
      return `${label} has an invalid day.`;
    }


    /*
      JavaScript Date automatically converts invalid
      dates such as 30/02/2026 into another date.

      Therefore we compare the Date components back
      with the original values.
    */

    const date = new Date(
      year,
      month - 1,
      day
    );


    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return `${label} is not a valid calendar date.`;
    }


    return "";
  }


  /* =========================================================
     CALCULATE
     ========================================================= */

  function handleCalculate() {

    setError("");


    /* ---------------------------------------------------------
       REQUIRED INPUT
       --------------------------------------------------------- */

    if (!fromDate || !toDate) {

      setError("Please select both dates.");

      return;
    }


    /* ---------------------------------------------------------
       VALIDATE FROM DATE
       --------------------------------------------------------- */

    const fromError = validateDateInput(
      fromDate,
      "From Date"
    );

    if (fromError) {

      setError(fromError);

      return;
    }


    /* ---------------------------------------------------------
       VALIDATE TO DATE
       --------------------------------------------------------- */

    const toError = validateDateInput(
      toDate,
      "To Date"
    );

    if (toError) {

      setError(toError);

      return;
    }


    /* ---------------------------------------------------------
       CREATE DATE OBJECTS
       --------------------------------------------------------- */

    const from = new Date(`${fromDate}T00:00:00`);
    const to = new Date(`${toDate}T00:00:00`);


    /* ---------------------------------------------------------
       DATE ORDER
       
       Date Difference Calculator should work regardless
       of which date is entered first.

       Earlier date becomes start.
       Later date becomes end.
       --------------------------------------------------------- */

    let startDate = fromDate;
    let endDate = toDate;


    if (from > to) {

      startDate = toDate;
      endDate = fromDate;
    }


    /* ---------------------------------------------------------
       CALCULATE DIFFERENCE
       --------------------------------------------------------- */

    const data = calculateDateDifference(
      startDate,
      endDate
    );


    setResult(data);


    /* ---------------------------------------------------------
       SCROLL TO RESULT
       --------------------------------------------------------- */

    setTimeout(() => {

      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });

    }, 300);
  }


  /* =========================================================
     RESET
     ========================================================= */

  function handleReset() {

    setFromDate("");
    setToDate("");

    setResult(null);
    setError("");

    setResetKey((prev) => prev + 1);
  }


  /* =========================================================
     UI
     ========================================================= */

  return (

    <CalculatorLayout

      title="📅 Date Difference Calculator"

      subtitle="Find exact difference between any two dates."

      result={

        result ? (

          <div ref={resultRef}>

            <DateDifferenceResultCard
            result={result}
            fromDate={fromDate}
          toDate={toDate}
        />

          </div>

        ) : (

          <div className="date-difference-empty">

            <div className="date-difference-empty-icon">
              📅
            </div>

            <h2>
              Date Difference
            </h2>

            <p>
              Select two dates to calculate the exact difference.
            </p>

          </div>

        )

      }

    >

      <form

        className="date-difference-card"

        onSubmit={(e) => {

          e.preventDefault();

          handleCalculate();

        }}

      >

        {/* FROM DATE */}

        <label>
          📅 From Date
        </label>

        <DateInput
          value={fromDate}
          onChange={setFromDate}
          resetKey={resetKey}
        />


        {/* TO DATE */}

        <label>
          📅 To Date
        </label>

        <DateInput
          value={toDate}
          onChange={setToDate}
          resetKey={resetKey}
        />


        {/* BUTTONS */}

        <div className="date-difference-buttons">

       <button
          type="submit"
          className="date-difference-calculate"
      >
           Calculate Difference
        </button>


        <button
          type="button"
          className="date-difference-reset"
          onClick={handleReset}
      >
         Reset
      </button>

        </div>


        {/* ERROR */}

        {error && (

          <div className="date-difference-error">
            {error}
          </div>

        )}

      </form>

    </CalculatorLayout>
  );
}

export default DateDifferenceCalculator;