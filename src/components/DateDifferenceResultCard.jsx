import { useRef } from "react";
import html2canvas from "html2canvas";
import { useTranslation } from "react-i18next";

import {
  formatLocalizedDate,
  getCurrentLocale,
} from "../utils/localizedDate";

import "./DateDifferenceResultCard.css";

import ResultAttribution from "./ResultAttribution";

function SafeValue(
  value,
  fallback = "—"
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return value;
  }

  if (typeof value === "object") {
    if (
      Object.prototype.hasOwnProperty.call(
        value,
        "value"
      )
    ) {
      return SafeValue(
        value.value,
        fallback
      );
    }

    if (
      Object.prototype.hasOwnProperty.call(
        value,
        "result"
      )
    ) {
      return SafeValue(
        value.result,
        fallback
      );
    }

    return fallback;
  }

  return fallback;
}

function DateDifferenceResultCard({
  result,
  fromDate,
  toDate,
}) {
  const { i18n } = useTranslation();

  const cardRef = useRef(null);

  if (!result) return null;

  /*
   * Supports normal result object and also protects
   * against accidental nested { result: {...} } data.
   */
  const data =
    result &&
    typeof result === "object" &&
    result.result &&
    typeof result.result === "object"
      ? result.result
      : result;

  /* =====================================================
     CURRENT LOCALE
     ===================================================== */

  const language =
    i18n.resolvedLanguage ||
    i18n.language ||
    "en";

  const locale =
    getCurrentLocale();

  /* =====================================================
     DATE FORMAT
     ===================================================== */

  function formatDate(dateValue) {
    if (!dateValue) {
      return "";
    }

    const date =
      dateValue instanceof Date
        ? dateValue
        : new Date(
            `${dateValue}T00:00:00`
          );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return String(dateValue);
    }

    return formatLocalizedDate(
      date,
      {
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );
  }

  /* =====================================================
     WEEKDAY FORMAT
     ===================================================== */

  function formatWeekday(dateValue) {
    if (!dateValue) {
      return "—";
    }

    const date =
      dateValue instanceof Date
        ? dateValue
        : new Date(
            Number(dateValue)
          );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    /*
     * IMPORTANT:
     * Weekday is generated at render time using
     * the current locale.
     *
     * Therefore:
     * English → Monday
     * Hindi   → सोमवार
     *
     * and language switching does not require
     * recalculation or page refresh.
     */
    return new Intl.DateTimeFormat(
      locale,
      {
        weekday: "long",
      }
    ).format(date);
  }

  /*
   * New language-independent weekday values.
   *
   * Compatibility fallback is kept so older result
   * objects do not break unexpectedly.
   */
  const fromWeekday =
    data.fromWeekdayDate
      ? formatWeekday(
          data.fromWeekdayDate
        )
      : SafeValue(
          data.fromWeekday,
          "—"
        );

  const toWeekday =
    data.toWeekdayDate
      ? formatWeekday(
          data.toWeekdayDate
        )
      : SafeValue(
          data.toWeekday,
          "—"
        );

  /* =====================================================
     RESULT VALUES
     ===================================================== */

  const years =
    SafeValue(data.years, 0);

  const months =
    SafeValue(data.months, 0);

  const days =
    SafeValue(data.days, 0);

  const totalYears =
    SafeValue(
      data.totalYears,
      0
    );

  const totalMonths =
    SafeValue(
      data.totalMonths,
      0
    );

  const totalWeeks =
    SafeValue(
      data.totalWeeks,
      0
    );

  const totalDays =
    SafeValue(
      data.totalDays,
      0
    );

  const totalHours =
    SafeValue(
      data.totalHours,
      0
    );

  const totalMinutes =
    SafeValue(
      data.totalMinutes,
      0
    );

  const totalSeconds =
    SafeValue(
      data.totalSeconds,
      0
    );

  /* =====================================================
     EXPORT / COPY TEXT
     ===================================================== */

  const resultText = `
Date Difference Result

From: ${formatDate(fromDate)}
To: ${formatDate(toDate)}

Exact Difference:
${years} Years, ${months} Months, ${days} Days

From Day: ${fromWeekday}
To Day: ${toWeekday}

Total Years: ${totalYears}
Total Months: ${totalMonths}
Total Weeks: ${totalWeeks}
Total Days: ${totalDays}
Total Hours: ${totalHours}
Total Minutes: ${totalMinutes}
Total Seconds: ${totalSeconds}

Generated by AgeVerse.Global
`.trim();

  /* =====================================================
     COPY
     ===================================================== */

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        resultText
      );

      alert(
        "Result copied successfully."
      );
    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );
    }
  }

  /* =====================================================
     SHARE
     ===================================================== */

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title:
            "AgeVerse - Date Difference Result",
          text: resultText,
        });
      } else {
        await navigator.clipboard.writeText(
          resultText
        );

        alert(
          "Sharing is not supported here. Result copied instead."
        );
      }
    } catch (error) {
      if (
        error?.name !==
        "AbortError"
      ) {
        console.error(
          "Share failed:",
          error
        );
      }
    }
  }

  /* =====================================================
     DOWNLOAD
     ===================================================== */

  async function handleDownload() {
    try {
      if (!cardRef.current) {
        return;
      }

      const canvas =
        await html2canvas(
          cardRef.current,
          {
            backgroundColor: null,
            scale: 2,
            useCORS: true,
          }
        );

      const image =
        canvas.toDataURL(
          "image/png"
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = image;

      link.download =
        "AgeVerse_Date_Difference_Result.png";

      link.click();
    } catch (error) {
      console.error(
        "Download failed:",
        error
      );
    }
  }

  /* =====================================================
     PRINT
     ===================================================== */

  function handlePrint() {
    window.print();
  }

  /* =====================================================
     UI
     ===================================================== */

  return (
    <div
      className="date-difference-result-card"
      ref={cardRef}
    >
      {/* RESULT HEADER */}

      <div className="dd-result-header">
        <div className="dd-result-icon">
          📅
        </div>

        <div>
          <h2>
            Date Difference Result
          </h2>

          <p>
            Exact difference between the selected dates
          </p>
        </div>
      </div>

      {/* PERIOD */}

      <div className="dd-period-card">
        <div className="dd-period-item">
          <span>
            From Date
          </span>

          <strong>
            {formatDate(
              fromDate
            )}
          </strong>
        </div>

        <div className="dd-period-arrow">
          →
        </div>

        <div className="dd-period-item">
          <span>
            To Date
          </span>

          <strong>
            {formatDate(
              toDate
            )}
          </strong>
        </div>
      </div>

      {/* EXACT DIFFERENCE */}

      <section className="dd-section">
        <h3>
          ⏳ Exact Difference
        </h3>

        <div className="dd-age-boxes">
          <div>
            <strong>
              {years}
            </strong>

            <span>
              Years
            </span>
          </div>

          <div>
            <strong>
              {months}
            </strong>

            <span>
              Months
            </span>
          </div>

          <div>
            <strong>
              {days}
            </strong>

            <span>
              Days
            </span>
          </div>
        </div>
      </section>

      {/* WEEKDAYS */}

      <div className="dd-weekdays">
        <div>
          <span>
            From Day
          </span>

          <strong>
            {fromWeekday}
          </strong>
        </div>

        <div>
          <span>
            To Day
          </span>

          <strong>
            {toWeekday}
          </strong>
        </div>
      </div>

      {/* TOTAL TIME */}

      <section className="dd-section">
        <h3>
          📊 Total Time
        </h3>

        <div className="dd-time-grid">
          <div>
            <strong>
              {totalYears}
            </strong>

            <span>
              Total Years
            </span>
          </div>

          <div>
            <strong>
              {totalMonths}
            </strong>

            <span>
              Total Months
            </span>
          </div>

          <div>
            <strong>
              {totalWeeks}
            </strong>

            <span>
              Total Weeks
            </span>
          </div>

          <div>
            <strong>
              {totalDays}
            </strong>

            <span>
              Total Days
            </span>
          </div>

          <div>
            <strong>
              {totalHours}
            </strong>

            <span>
              Total Hours
            </span>
          </div>

          <div>
            <strong>
              {totalMinutes}
            </strong>

            <span>
              Total Minutes
            </span>
          </div>

          <div>
            <strong>
              {totalSeconds}
            </strong>

            <span>
              Total Seconds
            </span>
          </div>
        </div>
      </section>

      {/* EXISTING ACTIONS */}

      <div className="dd-result-actions">
        <button
          type="button"
          onClick={handleCopy}
        >
          📋 Copy
        </button>

        <button
          type="button"
          onClick={handleShare}
        >
          📤 Share
        </button>

        <button
          type="button"
          onClick={handleDownload}
        >
          📥 Download
        </button>

        <button
          type="button"
          onClick={handlePrint}
        >
          🖨️ Print
        </button>
      </div>

      {/* FOOTER */}

      <div className="dd-result-footer">
        <span>
          ✨
        </span>

        <ResultAttribution
          type="generated"
        />
      </div>
    </div>
  );
}

export default DateDifferenceResultCard;