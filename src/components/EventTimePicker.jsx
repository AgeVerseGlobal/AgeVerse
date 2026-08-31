import "../styles/EventTimePicker.css";

function EventTimePicker({ value, onChange }) {
  return (
    <div className="event-time-picker">

      <div className="event-time-header">

        <div className="event-time-icon">
          ⏰
        </div>

        <div className="event-time-heading">
          <h3>Event Time</h3>

          <p>
            Choose when your event starts
          </p>
        </div>

      </div>

      <div className="event-time-input-box">

        <span className="event-time-input-icon">
          🕐
        </span>

        <input
          type="time"
          value={value || ""}
          onChange={(e) =>
            onChange(e.target.value)
          }
          aria-label="Event time"
        />

      </div>

    </div>
  );
}

export default EventTimePicker;