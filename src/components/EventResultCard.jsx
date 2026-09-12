import { useRef } from "react";

import "./EventResultCard.css";

import { useTranslation } from "react-i18next";

import {
  formatLocalizedDate,
  formatLocalizedWeekday,
  getCurrentLocale,
} from "../utils/localizedDate";

import ResultAttribution from "./ResultAttribution";

function EventResultCard({ result }) {
  const { t } = useTranslation();

  const cardRef = useRef(null);

  if (!result) return null;

  /* =====================================================
     CURRENT LANGUAGE
     ===================================================== */

  const locale = getCurrentLocale();

  /* =====================================================
     EVENT DATE FORMAT
     ===================================================== */

  function formatEventDate(dateValue) {
    if (!dateValue) {
      return "";
    }

    if (typeof dateValue === "number" && Number.isFinite(dateValue)) {
      const timestampDate = new Date(dateValue);
      if (!Number.isNaN(timestampDate.getTime())) {
        return formatLocalizedDate(timestampDate, {
          month: "long",
          day: "2-digit",
          year: "numeric",
        });
      }
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

    return formatLocalizedDate(
      date,
      formatOptions
    );
  }

  /* =====================================================
     REMINDER DATE FORMAT
     ===================================================== */

  function formatReminderDate() {
    let timestamp = result.reminderTimestamp;

    if (!timestamp && result.reminderDate) {
      const parsed = new Date(result.reminderDate);
      if (!Number.isNaN(parsed.getTime())) {
        timestamp = parsed.getTime();
      }
    }

    if (!Number.isFinite(Number(timestamp))) {
      return "";
    }

    const date = new Date(Number(timestamp));
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat(locale, {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
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
            {t("common.event_countdown")}
          </p>
        </div>
      </div>

      {/* =================================================
          EVENT INFORMATION
          ================================================= */}

      <div className="event-info-grid">
        <div className="event-info-item">
          <span className="event-info-label">
            📅 {t("common.event_date")}
          </span>

          <strong>
            {formatEventDate(
              result.eventDateTimestamp ?? result.eventDate
            )}
          </strong>
        </div>

        <div className="event-info-item">
          <span className="event-info-label">
            ⏰ {t("common.event_time")}
          </span>

          <strong>
            {result.eventTime ||
              t("common.not_specified")}
          </strong>
        </div>

        <div className="event-info-item">
          <span className="event-info-label">
            📆 {t("common.weekday")}
          </span>

          <strong>
            {result.eventDateTimestamp ? formatLocalizedWeekday(new Date(result.eventDateTimestamp)) : result.weekday}
          </strong>
        </div>
      </div>

      {/* =================================================
          COUNTDOWN
          ================================================= */}

      {result.status === "upcoming" ? (
        <>
          <div className="countdown-heading">
            ⏳ {t("common.time_remaining")}
          </div>

          <div className="event-countdown-grid">
            <div className="countdown-box">
              <strong>
                {result.days ?? 0}
              </strong>

              <span>
                {t("common.days")}
              </span>
            </div>

            <div className="countdown-box">
              <strong>
                {result.hours ?? 0}
              </strong>

              <span>
                {t("common.hours")}
              </span>
            </div>

            <div className="countdown-box">
              <strong>
                {result.minutes ?? 0}
              </strong>

              <span>
                {t("common.minutes")}
              </span>
            </div>

            <div className="countdown-box">
              <strong>
                {result.seconds ?? 0}
              </strong>

              <span>
                {t("common.seconds")}
              </span>
            </div>
          </div>

          <div className="event-status upcoming">
            ⏳ {t("common.upcoming_event")}
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
                {t("common.reminder_set")}
              </strong>
            </div>

            <div className="event-reminder-result-content">
              <div>
                <span>
                  {t("common.reminder")}
                </span>

                <strong>
                  {result.reminderLabel ||
                    t("common.reminder_set")}
                </strong>
              </div>

              {reminderDisplay && (
                <div>
                  <span>
                    {t("common.reminder_time")}
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