import { useRef } from "react";

import "./EventResultCard.css";

import { useTranslation } from "react-i18next";

import {
  formatLocalizedDate,
  getCurrentLocale,
} from "../utils/localizedDate";

import ResultAttribution from "./ResultAttribution";

function EventResultCard({ result }) {
  const { i18n } = useTranslation();

  const cardRef = useRef(null);

  if (!result) return null;

  /* =====================================================
     CURRENT LANGUAGE
     ===================================================== */

  const language =
    i18n.resolvedLanguage ||
    i18n.language ||
    "en";

  const locale = getCurrentLocale();

  /* =====================================================
     EVENT DATE FORMAT
     ===================================================== */

  function formatEventDate(dateValue) {
    if (!dateValue) {
      return "";
    }

    const value =
      String(dateValue).trim();

    const formatOptions = {
      month: "long",
      day: "2-digit",
      year: "numeric",
    };

    /* YYYY-MM-DD */

    if (
      /^\d{4}-\d{2}-\d{2}$/.test(
        value
      )
    ) {
      const [
        year,
        month,
        day,
      ] = value
        .split("-")
        .map(Number);

      const date = new Date(
        year,
        month - 1,
        day
      );

      return formatLocalizedDate(
        date,
        formatOptions
      );
    }

    /* MM/DD/YYYY */

    const slashMatch =
      value.match(
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
      );

    if (slashMatch) {
      const month =
        Number(slashMatch[1]);

      const day =
        Number(slashMatch[2]);

      const year =
        Number(slashMatch[3]);

      const date = new Date(
        year,
        month - 1,
        day
      );

      return formatLocalizedDate(
        date,
        formatOptions
      );
    }

    /* Fallback */

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleDateString(
      locale,
      formatOptions
    );
  }

  /* =====================================================
     REMINDER DATE FORMAT
     ===================================================== */

  function formatReminderDate() {
    /*
     * reminderTimestamp is the source of truth.
     * This means the display always follows the
     * currently selected language.
     */

    let timestamp =
      result.reminderTimestamp;

    /*
     * Compatibility fallback for older result objects.
     */
    if (
      !timestamp &&
      result.reminderDate
    ) {
      const parsed =
        new Date(
          result.reminderDate
        );

      if (
        !Number.isNaN(
          parsed.getTime()
        )
      ) {
        timestamp =
          parsed.getTime();
      }
    }

    if (!timestamp) {
      return "";
    }

    const date =
      new Date(
        Number(timestamp)
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    const parts =
      new Intl.DateTimeFormat(
        locale,
        {
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }
      ).formatToParts(date);

    if (language !== "hi") {
      return parts
        .map(
          (part) =>
            part.value
        )
        .join("");
    }

    /*
     * Hindi:
     *
     * 9 बजे पूर्वाह्न
     * 8 बजे अपराह्न
     */

    let hour = "";
    let minute = "";
    let dayPeriod = "";
    let otherParts = "";

    parts.forEach((part) => {
      if (part.type === "hour") {
        hour = part.value;
      } else if (
        part.type === "minute"
      ) {
        minute = part.value;
      } else if (
        part.type === "dayPeriod"
      ) {
        const value =
          part.value.toLowerCase();

        dayPeriod =
          value === "am"
            ? "पूर्वाह्न"
            : value === "pm"
              ? "अपराह्न"
              : part.value;
      } else {
        otherParts +=
          part.value;
      }
    });

    /*
     * Get the date portion separately so that
     * Hindi month names remain correctly localized.
     */
    const datePart =
      new Intl.DateTimeFormat(
        "hi-IN",
        {
          month: "long",
          day: "numeric",
          year: "numeric",
        }
      ).format(date);

    /*
     * Whole hour:
     * 9 बजे पूर्वाह्न
     *
     * With minutes:
     * 9:30 बजे पूर्वाह्न
     */
    const timePart =
      minute === "00"
        ? `${hour} बजे`
        : `${hour}:${minute} बजे`;

    return `${datePart}, ${timePart} ${dayPeriod}`;
  }

  const reminderDisplay =
    formatReminderDate();

  return (
    <div
      className="event-result-card"
      ref={cardRef}
    >
      {/* =================================================
          RESULT HEADER
          ================================================= */}

      <div className="event-result-header">
        <div className="event-result-icon">
          🎉
        </div>

        <div className="event-result-title">
          <h2>
            {result.eventName}
          </h2>

          <p>
            Event Countdown
          </p>
        </div>
      </div>

      {/* =================================================
          EVENT INFORMATION
          ================================================= */}

      <div className="event-info-grid">
        <div className="event-info-item">
          <span className="event-info-label">
            📅 Event Date
          </span>

          <strong>
            {formatEventDate(
              result.eventDate
            )}
          </strong>
        </div>

        <div className="event-info-item">
          <span className="event-info-label">
            ⏰ Event Time
          </span>

          <strong>
            {result.eventTime ||
              "Not specified"}
          </strong>
        </div>

        <div className="event-info-item">
          <span className="event-info-label">
            📆 Weekday
          </span>

          <strong>
            {result.weekday}
          </strong>
        </div>
      </div>

      {/* =================================================
          COUNTDOWN
          ================================================= */}

      {result.status === "upcoming" ? (
        <>
          <div className="countdown-heading">
            ⏳ Time Remaining
          </div>

          <div className="event-countdown-grid">
            <div className="countdown-box">
              <strong>
                {result.days ?? 0}
              </strong>

              <span>
                Days
              </span>
            </div>

            <div className="countdown-box">
              <strong>
                {result.hours ?? 0}
              </strong>

              <span>
                Hours
              </span>
            </div>

            <div className="countdown-box">
              <strong>
                {result.minutes ?? 0}
              </strong>

              <span>
                Minutes
              </span>
            </div>

            <div className="countdown-box">
              <strong>
                {result.seconds ?? 0}
              </strong>

              <span>
                Seconds
              </span>
            </div>
          </div>

          <div className="event-status upcoming">
            ⏳ Upcoming Event
          </div>
        </>
      ) : (
        <div className="event-status completed">
          ✅ Event Completed
        </div>
      )}

      {/* =================================================
          REMINDER INFORMATION
          ================================================= */}

      {result.reminderType &&
        result.reminderType !== "none" && (
          <div className="event-reminder-result">
            <div className="event-reminder-result-header">
              <span>
                🔔
              </span>

              <strong>
                Reminder Set
              </strong>
            </div>

            <div className="event-reminder-result-content">
              <div>
                <span>
                  Reminder
                </span>

                <strong>
                  {result.reminderLabel ||
                    "Reminder Set"}
                </strong>
              </div>

              {reminderDisplay && (
                <div>
                  <span>
                    Reminder Time
                  </span>

                  <strong>
                    {reminderDisplay}
                  </strong>
                </div>
              )}
            </div>
          </div>
        )}

      {/* =================================================
          FOOTER
          ================================================= */}

      <div className="event-result-footer">
        <ResultAttribution
          type="generated"
        />
      </div>
    </div>
  );
}

export default EventResultCard;