import { useEffect, useState } from "react";

import "../styles/RetirementResultCard.css";
import "../styles/RetirementCalculator.css";

import CalculatorLayout from "../components/CalculatorLayout";
import DateInput from "../components/DateInput";
import RetirementResultCard from "../components/RetirementResultCard";
import { useTranslation } from "react-i18next";
import {
  calculateRetirement,
  isValidDateString,
} from "../utils/retirementCalculatorLogic";

import {
  setupRetirementNotifications,
  checkRetirementReminder,
} from "../utils/retirementNotification";


function RetirementCalculator() {
  
  const { t } = useTranslation();
  const [birthDate, setBirthDate] = useState("");

  const [retirementAge, setRetirementAge] =
    useState(60);

  /*
   * Reminder types:
   *
   * none
   * on-day
   * one-day-before
   * custom
   */
  const [retirementReminder, setRetirementReminder] =
    useState("none");

  /*
   * Custom reminder days.
   */
  const [customReminderDays, setCustomReminderDays] =
    useState(7);

  const [result, setResult] = useState(null);

  const [error, setError] = useState("");

  const [resetKey, setResetKey] = useState(0);


  /*
   * =========================================================
   * NOTIFICATION SETUP + IMMEDIATE CHECK
   * =========================================================
   *
   * Notification errors must never break the calculator.
   */
  async function handleRetirementNotification(data) {
    if (!data) {
      return;
    }

    if (
      !data.reminderType ||
      data.reminderType === "none"
    ) {
      return;
    }

    try {
      const notification =
        await setupRetirementNotifications();

      if (
        !notification ||
        !notification.supported ||
        notification.permission !== "granted"
      ) {
        return;
      }

      await checkRetirementReminder({
        retirementTimestamp:
          data.retirementTimestamp,

        reminderType:
          data.reminderType,

        customReminderDays:
          data.customReminderDays || 0,

        retirementDate:
          data.retirementDate,
      });
    } catch (notificationError) {
      console.error(
        "Retirement notification error:",
        notificationError
      );
    }
  }


  /*
   * =========================================================
   * CURRENT REMINDER CHECK
   * =========================================================
   */
  async function checkCurrentRetirementReminder(
    data
  ) {
    if (
      !data ||
      !data.reminderType ||
      data.reminderType === "none"
    ) {
      return;
    }

    try {
      await checkRetirementReminder({
        retirementTimestamp:
          data.retirementTimestamp,

        reminderType:
          data.reminderType,

        customReminderDays:
          data.customReminderDays || 0,

        retirementDate:
          data.retirementDate,
      });
    } catch (reminderError) {
      console.error(
        "Retirement reminder check failed:",
        reminderError
      );
    }
  }


  /*
   * =========================================================
   * CALCULATE RETIREMENT
   * =========================================================
   */
  async function calculate() {
    setError("");


    /*
     * DATE REQUIRED
     */
    if (!birthDate) {
      setResult(null);

      setError(
        "Please enter your date of birth."
      );

      return;
    }


    /*
     * STRICT DATE VALIDATION
     */
    if (!isValidDateString(birthDate)) {
      setResult(null);

      setError(
        "Please enter a valid date of birth."
      );

      return;
    }


    /*
     * RETIREMENT AGE VALIDATION
     */
    const age = Number(
      retirementAge
    );

    if (
      !Number.isFinite(age) ||
      age < 1 ||
      age > 100
    ) {
      setResult(null);

      setError(
        "Retirement age must be between 1 and 100 years."
      );

      return;
    }


    /*
     * CUSTOM REMINDER VALIDATION
     */
    let reminderDays = 0;

    if (
      retirementReminder === "custom"
    ) {
      reminderDays =
        Number(customReminderDays);

      if (
        !Number.isInteger(
          reminderDays
        ) ||
        reminderDays < 1 ||
        reminderDays > 3650
      ) {
        setResult(null);

        setError(
          "Custom reminder must be between 1 and 3650 days."
        );

        return;
      }
    }


    /*
     * CALCULATE
     *
     * The fourth argument is important for
     * custom reminders.
     */
    const data =
      calculateRetirement(
        birthDate,
        age,
        retirementReminder,
        reminderDays
      );


    if (!data) {
      setResult(null);

      setError(
        "Unable to calculate retirement date."
      );

      return;
    }


    /*
     * Preserve reminder information explicitly.
     */
    const finalResult = {
  ...data,

  birthDate: birthDate,

  reminderType:
    retirementReminder,

  customReminderDays:
    retirementReminder === "custom"
      ? reminderDays
      : 0,
};

    /*
     * Show result first.
     */
    setResult(finalResult);


    /*
     * Then initialize/check notification.
     *
     * Notification failure cannot affect
     * the displayed result.
     */
    await handleRetirementNotification(
      finalResult
    );
  }


  /*
   * =========================================================
   * LIVE COUNTDOWN
   * =========================================================
   */
  useEffect(() => {
    if (
      !result ||
      !birthDate
    ) {
      return undefined;
    }


    const timer =
      setInterval(() => {
        const reminderDays =
          retirementReminder === "custom"
            ? Number(
                customReminderDays
              )
            : 0;


        const data =
          calculateRetirement(
            birthDate,
            Number(retirementAge),
            retirementReminder,
            reminderDays
          );


        if (data) {
  setResult({
    ...data,

    birthDate: birthDate,

    reminderType:
      retirementReminder,

    customReminderDays:
      retirementReminder === "custom"
        ? reminderDays
        : 0,
  });
}
      }, 1000);


    return () => {
      clearInterval(timer);
    };
  }, [
    birthDate,
    retirementAge,
    retirementReminder,
    customReminderDays,
    result !== null,
  ]);


  /*
   * =========================================================
   * REMINDER CHECK EFFECT
   * =========================================================
   *
   * Reminder is day-based, so once per minute is enough.
   *
   * It also checks when the user returns to the tab.
   */
  useEffect(() => {
    if (!result) {
      return undefined;
    }


    /*
     * Immediate check.
     */
    checkCurrentRetirementReminder(
      result
    );


    /*
     * Periodic check.
     */
    const timer =
      setInterval(() => {
        checkCurrentRetirementReminder(
          result
        );
      }, 60 * 1000);


    /*
     * Check again when tab becomes visible.
     */
    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        "visible"
      ) {
        checkCurrentRetirementReminder(
          result
        );
      }
    }


    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );


    return () => {
      clearInterval(timer);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [result]);


  /*
   * =========================================================
   * RESET
   * =========================================================
   */
  function handleReset() {
    setBirthDate("");

    setRetirementAge(60);

    setRetirementReminder(
      "none"
    );

    setCustomReminderDays(7);

    setResult(null);

    setError("");

    /*
     * Reset DateInput component.
     */
    setResetKey(
      (previous) =>
        previous + 1
    );
  }


  /*
   * =========================================================
   * REMINDER SELECTOR
   * =========================================================
   */
  function selectReminder(type) {
    setRetirementReminder(type);

    setError("");

    /*
     * Previous result belongs to the old reminder
     * setting, so clear it until Calculate is pressed.
     */
    setResult(null);
  }


  /*
   * =========================================================
   * UI
   * =========================================================
   */
  return (
    <CalculatorLayout
      title="👴 Retirement Calculator"
      subtitle={t("retirement.calculate_subtitle")}
      result={
        result ? (
          <RetirementResultCard
            result={result}
          />
        ) : (
          <div className="retirement-empty-result">

            <div className="retirement-empty-icon">
              👴
            </div>

            <h2>
              Retirement Planning
            </h2>

            <p>
              Select your date of birth to calculate
              your retirement date and remaining time.
            </p>

            <div className="retirement-empty-hint">
              Enter your details above to begin.
            </div>

          </div>
        )
      }
    >

      <form
        className="retirement-card"
        onSubmit={(event) => {
          event.preventDefault();
          calculate();
        }}
      >

        {/* =================================================
            DATE OF BIRTH
        ================================================= */}

        <div className="retirement-field">

          <label>
            🎂 Date of Birth
          </label>

          <DateInput
            value={birthDate}
            onChange={(value) => {
              setBirthDate(value);
              setError("");
              setResult(null);
            }}
            resetKey={resetKey}
          />

        </div>


        {/* =================================================
            RETIREMENT AGE
        ================================================= */}

        <div className="retirement-field">

          <label>
            🏢 Retirement Age
          </label>

          <div className="retirement-number-wrapper">

            <span className="retirement-number-icon">
              🎯
            </span>

            <input
              type="number"
              min="1"
              max="100"
              value={retirementAge}
              onChange={(event) => {
                setRetirementAge(
                  event.target.value
                );

                setError("");
                setResult(null);
              }}
            />

            <span className="retirement-number-unit">
              Years
            </span>

          </div>

        </div>


        {/* =================================================
            RETIREMENT REMINDER
        ================================================= */}

        <div className="retirement-reminder-box">

          <div className="retirement-reminder-header">

            <div className="retirement-reminder-icon">
              🔔
            </div>

            <div>

              <h3>
                Retirement Day Reminder
              </h3>

              <p>
                {t("retirement.reminder_description")}
              </p>

            </div>

          </div>


          <div className="retirement-reminder-options">

            {/* NO REMINDER */}

            <button
              type="button"
              className={`retirement-reminder-option ${
                retirementReminder === "none"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                selectReminder(
                  "none"
                )
              }
            >
              🔕 No Reminder
            </button>


            {/* RETIREMENT DAY */}

            <button
              type="button"
              className={`retirement-reminder-option ${
                retirementReminder === "on-day"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                selectReminder(
                  "on-day"
                )
              }
            >
              🎉 Retirement Day
            </button>


            {/* ONE DAY BEFORE */}

            <button
              type="button"
              className={`retirement-reminder-option ${
                retirementReminder ===
                "one-day-before"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                selectReminder(
                  "one-day-before"
                )
              }
            >
              📅 1 Day Before
            </button>


            {/* CUSTOM */}

            <button
              type="button"
              className={`retirement-reminder-option ${
                retirementReminder === "custom"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                selectReminder(
                  "custom"
                )
              }
            >
              ⚙️ Custom
            </button>

          </div>


          {/* =================================================
              CUSTOM REMINDER
          ================================================= */}

          {retirementReminder === "custom" && (

            <div className="retirement-custom-reminder">

              <label
                htmlFor="custom-retirement-days"
              >
                ⏰ Remind me before retirement
              </label>

              <div className="retirement-custom-input">

                <input
                  id="custom-retirement-days"
                  type="number"
                  min="1"
                  max="3650"
                  step="1"
                  value={
                    customReminderDays
                  }
                  placeholder="Enter days"
                  onChange={(event) => {

                    setCustomReminderDays(
                      event.target.value
                    );

                    setError("");
                    setResult(null);
                  }}
                  inputMode="numeric"
                />

                <span>
                  days before
                </span>

              </div>

            </div>
          )}

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            className="retirement-error"
            role="alert"
          >
            ⚠️ {error}
          </div>
        )}


        {/* =================================================
            BUTTONS
        ================================================= */}

        <div className="retirement-buttons">

          <button
            type="submit"
            className="retirement-calculate-button"
          >
            Calculate Retirement
          </button>


          <button
            type="button"
            className="retirement-reset-button"
            onClick={handleReset}
          >
            Reset
          </button>

        </div>

      </form>

    </CalculatorLayout>
  );
}

export default RetirementCalculator;