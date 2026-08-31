import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "./ResultCard.css";

import { formatLocalizedDate } from "../utils/localizedDate";

import {
  copyResultImage,
  downloadResultPdf,
  shareResultPdf,
  printResultPdf,
} from "../utils/resultExport";

function ResultCard({
  result,
  birthday,
  fromDate,
  toDate,
  onNew,
}) {
  // Subscribe this component to language changes.
  // This makes localized dates update immediately without refresh.
  const { i18n } = useTranslation();

  const cardRef = useRef(null);
  const [busy, setBusy] = useState("");

  function formatLongDate(dateString, includeWeekday = false) {
    if (!dateString) return "";

    const parts = String(dateString).split("-");

    if (parts.length !== 3) {
      return dateString;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      !Number.isInteger(day) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return dateString;
    }

    // Local date construction avoids UTC timezone shifting.
    const date = new Date(year, month - 1, day);

    if (isNaN(date.getTime())) {
      return dateString;
    }

    return formatLocalizedDate(date, {
      ...(includeWeekday ? { weekday: "long" } : {}),
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  async function handleCopy() {
    try {
      setBusy("copy");

      await copyResultImage(cardRef.current);

    } catch (error) {
      console.error("Copy failed:", error);
      alert("Unable to copy the result image.");
    } finally {
      setBusy("");
    }
  }

  async function handleDownloadPDF() {
    try {
      setBusy("pdf");

      await downloadResultPdf(
        cardRef.current,
        "AgeVerse_Age_Result.pdf"
      );

    } catch (error) {
      console.error("PDF download failed:", error);
      alert("Unable to create PDF.");
    } finally {
      setBusy("");
    }
  }

  async function handleSharePDF() {
    try {
      setBusy("share");

      await shareResultPdf(
        cardRef.current,
        "AgeVerse_Age_Result.pdf",
        "AgeVerse Age Result"
      );

    } catch (error) {
      console.error("Share failed:", error);

      // User cancelled share dialog — don't show an error.
      if (error?.name !== "AbortError") {
        alert("Unable to share the result PDF.");
      }
    } finally {
      setBusy("");
    }
  }

  async function handlePrint() {
    try {
      setBusy("print");

      await printResultPdf(cardRef.current);

    } catch (error) {
      console.error("Print failed:", error);
      alert(
        error?.message ||
        "Unable to print the result."
      );
    } finally {
      setBusy("");
    }
  }

  // Keep the component subscribed to the active language.
  // The value itself is intentionally not otherwise used.
  void i18n.language;

  const isBusy = busy !== "";

  return (
    <div
      className="result-card"
      ref={cardRef}
    >

      {/* ================================
          CALCULATION PERIOD
      ================================= */}

      <div className="result-header">

        <div className="calculation-period">

          <div>
            <span>📅 From</span>

            <strong>
              {formatLongDate(fromDate)}
            </strong>
          </div>

          <div>
            <span>📅 Till</span>

            <strong>
              {formatLongDate(toDate)}
            </strong>
          </div>

        </div>

      </div>


      {/* ================================
          AGE
      ================================= */}

      <h2>🎂 Your Age</h2>

      <div className="age-boxes">

        <div>
          <strong>{result.years}</strong>
          <span>Years</span>
        </div>

        <div>
          <strong>{result.months}</strong>
          <span>Months</span>
        </div>

        <div>
          <strong>{result.days}</strong>
          <span>Days</span>
        </div>

      </div>


      {/* ================================
          TOTAL TIME
      ================================= */}

      <h2>📊 Total Time</h2>

      <div className="time-grid">

        <div>
          {result.totalMonths}
          <br />
          Months
        </div>

        <div>
          {result.totalWeeks}
          <br />
          Weeks
        </div>

        <div>
          {result.totalDays}
          <br />
          Days
        </div>

        <div>
          {result.totalHours}
          <br />
          Hours
        </div>

        <div>
          {result.totalMinutes}
          <br />
          Minutes
        </div>

        <div>
          {result.totalSeconds}
          <br />
          Seconds
        </div>

      </div>


      {/* ================================
          BIRTH DAY
      ================================= */}

      <h3>
        📅 Born On : {formatLongDate(fromDate, true)}
      </h3>


      {/* ================================
          NEXT BIRTHDAY
      ================================= */}

      {birthday && (

        <div className="birthday-box">

          🎂 Next Birthday

          <br />

          {birthday.days} Days Remaining

        </div>

      )}


      {/* =================================
          5 RESULT ACTION BUTTONS
      ================================= */}

      <div
        className="result-actions"
        data-export-ignore="true"
      >

        <button
          type="button"
          onClick={handleCopy}
          disabled={isBusy}
        >
          {busy === "copy"
            ? "⏳"
            : "📋"}{" "}
          Copy
        </button>


        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={isBusy}
        >
          {busy === "pdf"
            ? "⏳"
            : "📄"}{" "}
          Download PDF
        </button>


        <button
          type="button"
          onClick={handleSharePDF}
          disabled={isBusy}
        >
          {busy === "share"
            ? "⏳"
            : "📤"}{" "}
          Share PDF
        </button>


        <button
          type="button"
          onClick={handlePrint}
          disabled={isBusy}
        >
          {busy === "print"
            ? "⏳"
            : "🖨️"}{" "}
          Print
        </button>


        <button
          type="button"
          className="result-new-button"
          onClick={onNew}
          disabled={isBusy}
        >
          🔄 New
        </button>

      </div>

    </div>
  );
}

export default ResultCard;