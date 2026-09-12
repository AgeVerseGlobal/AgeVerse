import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

import "./EventPicker.css";

import CalculatorLayout from "../components/CalculatorLayout";
import DateInput from "../components/DateInput";
import EventResultCard from "../components/EventResultCard";
import EventTimePicker from "../components/EventTimePicker";
import ReminderPicker from "../components/ReminderPicker";
import { ENABLE_REMINDERS } from "../config/features";

import { calculateEvent } from "../utils/eventCalculatorLogic";
import { calculateReminderTime } from "../utils/reminderLogic";
import {
  cancelEventReminder,
  requestEventNotificationPermission,
  scheduleEventReminder,
} from "../utils/eventReminder";

function EventCalculator() {
  const { t } = useTranslation();
  const [eventType, setEventType] = useState("");
  const [customEvent, setCustomEvent] = useState("");

  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");

  const [reminder, setReminder] = useState({
    type: "none",
    amount: null,
    unit: null,
  });

  const [result, setResult] = useState(null);

  const [error, setError] = useState("");

  const [resetKey, setResetKey] = useState(0);

  const resultRef = useRef(null);
  const scheduledReminderIdRef = useRef(null);

  /* =====================================================
     EVENT NAME
     ===================================================== */

  function getEventName() {
    if (eventType === "Custom Event") {
      return (
        customEvent.trim() ||
        "Custom Event"
      );
    }

    return eventType;
  }

  /* =====================================================
     COMPLETE EVENT DATE + TIME
     ===================================================== */

  function getEventDateTime() {
    if (!eventDate || !eventTime) {
      return "";
    }

    return `${eventDate}T${eventTime}`;
  }

  /* =====================================================
     REMINDER LABEL
     ===================================================== */

  function getReminderLabel() {
    if (!reminder || reminder.type === "none") {
      return "No Reminder";
    }

    if (reminder.type === "24h") {
      return "24 Hours Before";
    }

    if (reminder.type === "1h") {
      return "1 Hour Before";
    }

    if (reminder.type === "10m") {
      return "10 Minutes Before";
    }

    if (reminder.type === "custom") {
      const amount = Number(reminder.amount);

      if (!amount || amount <= 0) {
        return "Custom Reminder";
      }

      let unit = reminder.unit;

      if (amount === 1) {
        if (unit === "minutes") {
          unit = "minute";
        }

        if (unit === "hours") {
          unit = "hour";
        }

        if (unit === "days") {
          unit = "day";
        }
      }

      return `${amount} ${unit} Before`;
    }

    return "No Reminder";
  }

  /* =====================================================
     CALCULATE
     ===================================================== */

  async function handleCalculate() {
    setError("");

    if (!eventType) {
      setError("Please select event type.");
      return;
    }

    if (
      eventType === "Custom Event" &&
      !customEvent.trim()
    ) {
      setError(
        "Please enter custom event name."
      );
      return;
    }

    if (!eventDate) {
      setError("Please select event date.");
      return;
    }

    if (!eventTime) {
      setError("Please select event time.");
      return;
    }

    /* ---------------------------------------------
       Validate custom reminder
       --------------------------------------------- */

    if (reminder.type === "custom") {
      const amount = Number(reminder.amount);

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        setError(
          "Please enter a valid custom reminder time."
        );
        return;
      }
    }

    const eventDateTime =
      getEventDateTime();

    const eventDateObject =
      new Date(eventDateTime);

    if (
      Number.isNaN(
        eventDateObject.getTime()
      )
    ) {
      setError(
        "Please enter a valid event date and time."
      );
      return;
    }

    /* ---------------------------------------------
       Calculate reminder
       --------------------------------------------- */

    const reminderDate =
      calculateReminderTime(
        eventDateTime,
        reminder
      );

    /* ---------------------------------------------
       Calculate event
       --------------------------------------------- */

    const data =
      calculateEvent(eventDateTime);

    const currentReminderId = scheduledReminderIdRef.current;
    scheduledReminderIdRef.current = null;

    if (currentReminderId) {
      await cancelEventReminder(currentReminderId);
    }

    const eventName = getEventName();
    const reminderTimestamp = reminderDate
      ? reminderDate.getTime()
      : null;

    setResult({
      ...data,
      eventName,
      eventTime,
      reminderType: reminder.type,
      reminderLabel: getReminderLabel(),
      reminderTimestamp,
      reminderDate: reminderDate
        ? reminderDate.toISOString()
        : "",
    });

    if (reminderTimestamp && reminderTimestamp > Date.now()) {
      const permission =
        await requestEventNotificationPermission();

      if (permission === "granted") {
        try {
          const reminderId =
            await scheduleEventReminder({
              eventName,
              eventTimestamp: eventDateObject.getTime(),
              reminderTimestamp,
            });

          scheduledReminderIdRef.current = reminderId;
        } catch (notificationError) {
          setError(
            notificationError?.message ||
              "Reminder could not be scheduled."
          );
        }
      } else if (permission === "denied") {
        setError(
          "Notification permission is blocked. Please allow notifications for AgeVerseGlobal to receive the reminder."
        );
      } else if (permission === "unsupported") {
        setError(
          "This browser does not support background event reminders."
        );
      }
    }

  }

  /* =====================================================
     LIVE COUNTDOWN
     ===================================================== */

  useEffect(() => {
    let timer;

    if (
      result &&
      eventDate &&
      eventTime
    ) {
      timer = setInterval(() => {
        const eventDateTime =
          `${eventDate}T${eventTime}`;

        const data =
          calculateEvent(
            eventDateTime
          );

        setResult((prev) => {
          if (!prev) {
            return prev;
          }

          return {
            ...prev,
            ...data,
          };
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [
    result,
    eventDate,
    eventTime,
  ]);

  /* =====================================================
     RESET
     ===================================================== */

  function handleReset() {
    if (scheduledReminderIdRef.current) {
      cancelEventReminder(scheduledReminderIdRef.current);
      scheduledReminderIdRef.current = null;
    }

    setEventType("");

    setCustomEvent("");

    setEventDate("");

    setEventTime("");

    setReminder({
      type: "none",
      amount: null,
      unit: null,
    });

    setResult(null);

    setError("");

    setResetKey(
      (prev) => prev + 1
    );
  }

  /* =====================================================
     UI
     ===================================================== */

  return (
    <CalculatorLayout
      title="🎉 Event Calculator"
      subtitle="Countdown for your special moments."
      result={
        result ? (
          <div ref={resultRef}>
            <EventResultCard
              result={result}
            />
          </div>
        ) : (
          <div className="empty-result event-empty-result">
            <div className="event-empty-icon" aria-hidden="true">🎉</div>
            <h2>
              Event Countdown
            </h2>

            <p>
              Select an event and date
              to see countdown.
            </p>
          </div>
        )
      }
    >
      <form
        className="age-card"
        style={{
          width: "100%",
        }}
        onSubmit={(e) => {
          e.preventDefault();
          handleCalculate();
        }}
      >
        {/* =========================================
            EVENT TYPE
            ========================================= */}

        <label>
          🎯 Select Event
        </label>

        <div className="event-picker">
          {[
            ["🎂", "Birthday"],
            ["💍", "Anniversary"],
            ["📝", "Exam"],
            ["✈️", "Trip / Vacation"],
            ["🎉", "Party / Event"],
            ["✍️", "Custom Event"],
          ].map((item) => (
            <div
              key={item[1]}
              className={
                eventType === item[1]
                  ? "event-option active"
                  : "event-option"
              }
              onClick={() =>
                setEventType(
                  item[1]
                )
              }
            >
              <span>
                {item[0]}
              </span>

              <p>
                {item[1]}
              </p>
            </div>
          ))}
        </div>

        {/* =========================================
            CUSTOM EVENT
            ========================================= */}

        {eventType === "Custom Event" && (
          <div className="custom-event-box">
            <label>
              ✍️ Custom Event Name
            </label>

            <input
              type="text"
              placeholder={t("Example: My Wedding, Office Party...")}
              value={customEvent}
              onChange={(e) =>
                setCustomEvent(
                  e.target.value
                )
              }
            />
          </div>
        )}

        {/* =========================================
            EVENT DATE
            ========================================= */}

        <label>
          📅 Event Date
        </label>

        <DateInput
          value={eventDate}
          onChange={setEventDate}
          resetKey={resetKey}
        />

        {/* =========================================
            EVENT TIME
            ========================================= */}

        <EventTimePicker
          value={eventTime}
          onChange={setEventTime}
        />

        {/* =========================================
            REMINDER
            ========================================= */}

        {ENABLE_REMINDERS && (
          <ReminderPicker
            value={reminder}
            onChange={setReminder}
          />
        )}

        {/* =========================================
            CALCULATE
            ========================================= */}

        <button type="submit" className="event-calculate-button">
          Calculate Countdown
        </button>

        {/* =========================================
            RESET
            ========================================= */}

        <button
          type="button"
          className="reset event-reset-button"
          onClick={handleReset}
        >
          Reset
        </button>

        {/* =========================================
            ERROR
            ========================================= */}

        {error && (
          <div className="error">
            {error === "Notification permission is blocked. Please allow notifications for AgeVerseGlobal to receive the reminder."
            ? t("common.notification_permission_blocked")
            : error === "Event reminder service is not configured."
            ? t("common.event_reminder_not_configured")
            : error}
          </div>
        )}
      </form>
    </CalculatorLayout>
  );
}

export default EventCalculator;
