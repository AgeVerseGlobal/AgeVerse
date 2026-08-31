import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";

import { calculateAge } from "../utils/AgeCalculatorLogic";
import { calculateNextBirthday } from "../utils/birthdayCalculator";

import "./ageCalculator.css";

import ResultCard from "../components/ResultCard";
import DateInput from "../components/DateInput";
import { validateDate } from "../utils/dateValidation";
import CalculatorLayout from "../components/CalculatorLayout";

function AgeCalculator() {

  const { t } = useTranslation();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Today / Specific Date
  const [calculateMode, setCalculateMode] = useState("today");

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [birthday, setBirthday] = useState(null);
  const [resetKey, setResetKey] = useState(0);

  const resultRef = useRef(null);


  /* =====================================================
     DATE CHANGE HANDLERS
     Clear old calculation when input changes
     ===================================================== */

  function handleFromDateChange(value) {

    setFromDate(value);

    // Old result is no longer valid
    setResult(null);
    setBirthday(null);
    setError("");
  }


  function handleToDateChange(value) {

    setToDate(value);

    // Old result is no longer valid
    setResult(null);
    setBirthday(null);
    setError("");
  }


  /* =====================================================
     CALCULATE
     ===================================================== */

  function handleCalculate() {

    setError("");

    if (!fromDate) {

      setError(t("message.select_dates"));

      return;
    }


    /*
      If Today is selected,
      automatically use today's date.
    */

    let calculationToDate = toDate;


    if (calculateMode === "today") {

      const today = new Date();

      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");

      calculationToDate = `${year}-${month}-${day}`;
    }


    /*
      Specific Date mode requires
      the user to select a date.
    */

    if (
      calculateMode === "specific" &&
      !calculationToDate
    ) {

      setError(t("message.select_dates"));

      return;
    }


    const [fy, fm, fd] = fromDate.split("-");
    const [ty, tm, td] = calculationToDate.split("-");


    const fromError = validateDate(
      fd,
      fm,
      fy,
      false
    );

    const toError = validateDate(
      td,
      tm,
      ty,
      true
    );


    if (fromError) {

      setError(
        t("age.date_of_birth") +
        ": " +
        fromError
      );

      return;
    }


    if (toError) {

      setError(
        t("age.calculate_till") +
        ": " +
        toError
      );

      return;
    }


    const start = new Date(fromDate);
    const end = new Date(calculationToDate);


    if (start > end) {

      setError(
        t("message.from_date_greater_than_to_date")
      );

      return;
    }


    const ageData = calculateAge(
      start,
      end
    );


    setResult(ageData);


    setBirthday(
      calculateNextBirthday(
        start,
        end
      )
    );


    setTimeout(() => {

      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });

    }, 300);
  }


  /* =====================================================
     MODE CHANGE
     ===================================================== */

  function handleModeChange(mode) {

    setCalculateMode(mode);

    setError("");

    /*
      When switching to Today,
      clear manually selected date.
    */

    if (mode === "today") {

      setToDate("");
    }


    /*
      Clear old result when calculation mode changes.
    */

    setResult(null);
    setBirthday(null);
  }


  /* =====================================================
     RESET
     ===================================================== */

  function handleReset() {

    setFromDate("");
    setToDate("");

    setCalculateMode("today");

    setResult(null);
    setBirthday(null);
    setError("");

    setResetKey(prev => prev + 1);
  }


  /* =====================================================
     UI
     ===================================================== */

  return (

    <CalculatorLayout

      title={"🎂 " + t("age.title")}

      subtitle={t("age.subtitle")}

      result={

        result ? (

          <ResultCard
          result={result}
          birthday={birthday}
          fromDate={fromDate}
          toDate={
          calculateMode === "today"
          ? new Date().toISOString().split("T")[0]
          : toDate
        }
          onNew={handleReset}
        />

        ) : (

          <div className="age-empty-result">

            <div className="age-empty-result-icon">
              🎂
            </div>

            <h2>
              {t("age.empty_result_title")}
            </h2>

            <p>
              {t("age.empty_result_text")}
            </p>

            <div className="age-empty-result-hint">
              {t("age.empty_result_hint")}
            </div>

          </div>

        )

      }

    >


      {/* =========================
          DATE OF BIRTH
          ========================= */}

      <div className="calculator-field">

        <label>
          📅 {t("age.date_of_birth")}
        </label>


        <DateInput

          value={fromDate}

          onChange={handleFromDateChange}

          resetKey={resetKey}

        />

      </div>


      {/* =========================
          CALCULATE AGE TILL
          ========================= */}

      <div className="calculate-till-section">

        <label className="calculate-till-label">
          Calculate Age Till
        </label>


        {/* MODE SELECTOR */}

        <div className="date-mode-selector">

          <button

            type="button"

            className={
              calculateMode === "today"
                ? "date-mode active"
                : "date-mode"
            }

            onClick={() =>
              handleModeChange("today")
            }

          >
            🟢 {t("age.today")}
          </button>


          <button

            type="button"

            className={
              calculateMode === "specific"
                ? "date-mode active"
                : "date-mode"
            }

            onClick={() =>
              handleModeChange("specific")
            }

          >
            📅 {t("age.specific_date")}
          </button>

        </div>


        {/* SPECIFIC DATE */}

        {calculateMode === "specific" && (

          <div className="specific-date-field">

            <label>
              📅 {t("age.calculate_till")}
            </label>


            <DateInput

              value={toDate}

              onChange={handleToDateChange}

              resetKey={resetKey}

            />

          </div>

        )}


        {/* TODAY INFORMATION */}

        {calculateMode === "today" && (

          <div className="today-info">

            <span className="today-info-icon">
              📅
            </span>


            <div>

              <strong>
                Age will be calculated up to today
              </strong>

              <small>
                The current date will be used automatically.
              </small>

            </div>

          </div>

        )}

      </div>


      {/* =========================
          BUTTONS
          ========================= */}

      <div className="age-calculator-buttons">

        <button

          type="button"

          className="calculate-age-button"

          onClick={handleCalculate}

        >
          {t("common.calculate")}

        </button>


        <button

          type="button"

          className="reset"

          onClick={handleReset}

        >
          {t("common.reset")}

        </button>

      </div>


      {/* =========================
          ERROR
          ========================= */}

      {error && (

        <div className="error">

          {error}

        </div>

      )}

    </CalculatorLayout>
  );
}

export default AgeCalculator;