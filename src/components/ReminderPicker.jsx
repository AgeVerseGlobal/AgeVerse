import { useEffect, useState } from "react";
import "../styles/ReminderPicker.css";

function ReminderPicker({
  value,
  onChange,
}) {

  const selectedType =
    value?.type || "none";


  const [customAmount, setCustomAmount] =
    useState(
      value?.type === "custom" &&
      value?.amount
        ? String(value.amount)
        : ""
    );


  const [customUnit, setCustomUnit] =
    useState(
      value?.type === "custom" &&
      value?.unit
        ? value.unit
        : "minutes"
    );


  /*
   * Keep local custom fields synchronized
   * with parent state.
   */
  useEffect(() => {

    if (
      value?.type === "custom"
    ) {

      setCustomAmount(
        value.amount
          ? String(value.amount)
          : ""
      );

      setCustomUnit(
        value.unit || "minutes"
      );

    } else {

      setCustomAmount("");

      setCustomUnit("minutes");

    }

  }, [
    value?.type,
    value?.amount,
    value?.unit,
  ]);


  /*
   * Preset reminder
   */
  function handlePresetChange(
    preset
  ) {

    if (preset === "custom") {

      onChange({
        type: "custom",
        amount:
          customAmount
            ? Number(customAmount)
            : null,
        unit: customUnit,
      });

      return;
    }


    onChange({
      type: preset,
      amount: null,
      unit: null,
    });

  }


  /*
   * Custom amount
   */
  function handleCustomAmount(e) {

    const amount =
      e.target.value
        .replace(/\D/g, "")
        .slice(0, 4);


    setCustomAmount(amount);


    onChange({

      type: "custom",

      amount:
        amount
          ? Number(amount)
          : null,

      unit: customUnit,

    });

  }


  /*
   * Custom unit
   */
  function handleCustomUnit(e) {

    const unit =
      e.target.value;


    setCustomUnit(unit);


    onChange({

      type: "custom",

      amount:
        customAmount
          ? Number(customAmount)
          : null,

      unit,

    });

  }


  return (

    <div className="event-reminder-box">

      {/* =================================================
          HEADER
          ================================================= */}

      <div className="reminder-header">

        <div className="reminder-icon">
          🔔
        </div>


        <div className="reminder-heading">

          <h3>
            Reminder
          </h3>

          <p>
            Get notified before your event
          </p>

        </div>

      </div>


      {/* =================================================
          OPTIONS
          ================================================= */}

      <div className="reminder-options">

        {/* NO REMINDER */}

        <button
          type="button"
          className={
            selectedType === "none"
              ? "reminder-option active"
              : "reminder-option"
          }
          onClick={() =>
            handlePresetChange("none")
          }
        >

          <span className="reminder-option-icon">
            🔕
          </span>

          <span className="reminder-option-text">
            No Reminder
          </span>

        </button>


        {/* 24 HOURS */}

        <button
          type="button"
          className={
            selectedType === "24h"
              ? "reminder-option active"
              : "reminder-option"
          }
          onClick={() =>
            handlePresetChange("24h")
          }
        >

          <span className="reminder-option-icon">
            🗓️
          </span>

          <span className="reminder-option-text">
            24 Hours Before
          </span>

        </button>


        {/* 1 HOUR */}

        <button
          type="button"
          className={
            selectedType === "1h"
              ? "reminder-option active"
              : "reminder-option"
          }
          onClick={() =>
            handlePresetChange("1h")
          }
        >

          <span className="reminder-option-icon">
            ⏰
          </span>

          <span className="reminder-option-text">
            1 Hour Before
          </span>

        </button>


        {/* 10 MINUTES */}

        <button
          type="button"
          className={
            selectedType === "10m"
              ? "reminder-option active"
              : "reminder-option"
          }
          onClick={() =>
            handlePresetChange("10m")
          }
        >

          <span className="reminder-option-icon">
            ⚡
          </span>

          <span className="reminder-option-text">
            10 Minutes Before
          </span>

        </button>


        {/* CUSTOM */}

        <button
          type="button"
          className={
            selectedType === "custom"
              ? "reminder-option active"
              : "reminder-option"
          }
          onClick={() =>
            handlePresetChange("custom")
          }
        >

          <span className="reminder-option-icon">
            ⚙️
          </span>

          <span className="reminder-option-text">
            Custom
          </span>

        </button>

      </div>


      {/* =================================================
          CUSTOM REMINDER
          ================================================= */}

      {selectedType === "custom" && (

        <div className="custom-reminder-box">

          <div className="custom-reminder-title">
            ⚙️ Set Custom Reminder
          </div>


          <div className="custom-reminder-controls">

            <input
              type="number"
              min="1"
              max="9999"
              step="1"
              placeholder="Enter amount"
              value={customAmount}
              onChange={
                handleCustomAmount
              }
              inputMode="numeric"
            />


            <select
              value={customUnit}
              onChange={
                handleCustomUnit
              }
            >

              <option value="minutes">
                Minutes Before
              </option>

              <option value="hours">
                Hours Before
              </option>

              <option value="days">
                Days Before
              </option>

            </select>

          </div>

        </div>

      )}

    </div>

  );
}

export default ReminderPicker;