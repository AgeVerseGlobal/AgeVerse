import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function BmiGauge({ bmi }) {
  const { t } = useTranslation();

  const [position, setPosition] = useState(45);

  useEffect(() => {
    const value = Number(bmi);

    if (!Number.isFinite(value)) {
      setPosition(45);
      return;
    }

    let calculatedPosition;

    if (value <= 15) {
      calculatedPosition = 0;
    } else if (value < 18.5) {
      calculatedPosition =
        ((value - 15) / 3.5) * 25;
    } else if (value < 25) {
      calculatedPosition =
        25 +
        ((value - 18.5) / 6.5) * 30;
    } else if (value < 30) {
      calculatedPosition =
        55 +
        ((value - 25) / 5) * 20;
    } else if (value < 35) {
      calculatedPosition =
        75 +
        ((value - 30) / 5) * 25;
    } else {
      calculatedPosition = 100;
    }

    setPosition(
      Math.min(
        100,
        Math.max(0, calculatedPosition)
      )
    );
  }, [bmi]);

  const value = Number(bmi);

  const statusKey =
    value < 18.5
      ? "Underweight"
      : value < 25
      ? "Healthy"
      : value < 30
      ? "Overweight"
      : "Obesity";

  const messageKey =
    value < 18.5
      ? "bmi_gauge.underweight_message"
      : value < 25
      ? "bmi_gauge.healthy_message"
      : value < 30
      ? "bmi_gauge.overweight_message"
      : "bmi_gauge.obesity_message";

  const status = t(statusKey);
  const message = t(messageKey);

  const statusClass =
    value < 18.5
      ? "bmi-underweight"
      : value < 25
      ? "bmi-healthy"
      : value < 30
      ? "bmi-overweight"
      : "bmi-obesity";

  return (
    <div className="bmi-gauge-card">

      {/* =========================
          BMI GAUGE HEADER
      ========================== */}

      <div className="bmi-gauge-title">

        <img
          src={`${import.meta.env.BASE_URL}images/bmi-gauge.jpg`}
          alt={t("BMI Gauge")}
          className="bmi-gauge-logo"
        />

        <div className="bmi-gauge-heading">
          <span>{t("BMI Gauge")}</span>
          <small>{t("Body Mass Index")}</small>
        </div>

      </div>


      {/* =========================
          BMI VALUE
      ========================== */}

      <div className="bmi-value">
        {Number.isFinite(value)
          ? value.toFixed(1)
          : "--"}
      </div>


      {/* =========================
          BMI STATUS
      ========================== */}

      <div
        className={`bmi-status ${statusClass}`}
      >
        {status}
      </div>


      {/* =========================
          BMI SCALE
      ========================== */}

      <div className="bmi-scale-wrapper">

        <div className="bmi-scale">

          {/* Dynamic Pointer */}

          <div
            className="bmi-pointer"
            style={{
              left: `${position}%`
            }}
          >
            <span>▼</span>
          </div>

        </div>


        {/* Scale Values */}

        <div className="bmi-scale-numbers">

          <span>15</span>

          <span>18.5</span>

          <span>25</span>

          <span>30</span>

          <span>35+</span>

        </div>


        {/* Category Labels */}

        <div className="bmi-colors">

          <span className="bmi-label-under">
            {t("Underweight")}
          </span>

          <span className="bmi-label-healthy">
            {t("Healthy")}
          </span>

          <span className="bmi-label-over">
            {t("Overweight")}
          </span>

          <span className="bmi-label-obesity">
            {t("Obesity")}
          </span>

        </div>

      </div>


      {/* =========================
          BMI MESSAGE
      ========================== */}

      <div className="bmi-message">
        <span>✨</span>
        <p>{message}</p>
      </div>

    </div>
  );
}

export default BmiGauge;