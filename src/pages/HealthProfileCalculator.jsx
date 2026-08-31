import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";

import CalculatorLayout from "../components/CalculatorLayout";
import HealthProfileResultCard from "../components/HealthProfileResultCard";

import { calculateHealthProfile } from "../utils/healthProfileLogic";

import "../styles/HealthProfile.css";

function HealthProfileCalculator() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const [activity, setActivity] = useState(
    "Moderately Active"
  );

  const [diet, setDiet] = useState(
    "Vegetarian"
  );

  const [goal, setGoal] = useState(
    "Maintain Weight"
  );

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const resultRef = useRef(null);

  /* =========================
     CALCULATE
  ========================= */

  function handleCalculate() {
    setError("");

    const ageValue = Number(age);
    const heightValue = Number(height);
    const weightValue = Number(weight);

    /* Required fields */

    if (
      !age ||
      !height ||
      !weight ||
      !gender
    ) {
      setError(
        "Please fill all required details."
      );

      return;
    }

    /* Age validation */

    if (
      ageValue < 5 ||
      ageValue > 120
    ) {
      setError(
        "Please enter a valid age between 5 and 120 years."
      );

      return;
    }

    /* Height validation */

    if (
      heightValue < 100 ||
      heightValue > 250
    ) {
      setError(
        "Please enter a valid height between 100 and 250 cm."
      );

      return;
    }

    /* Weight validation */

    if (
      weightValue < 20 ||
      weightValue > 300
    ) {
      setError(
        "Please verify your weight. Please enter a value between 20 and 300 kg."
      );

      return;
    }

    /* Calculate */

    const data = calculateHealthProfile({
      name: name.trim(),
      gender,
      age: ageValue,
      height: heightValue,
      weight: weightValue,
      activity,
      diet,
      goal
    });

    setResult(data);

    /* Scroll to result */

    setTimeout(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 300);
  }

  /* =========================
     RESET
  ========================= */

  function handleReset() {
    setName("");
    setGender("");
    setAge("");
    setHeight("");
    setWeight("");

    setActivity(
      "Moderately Active"
    );

    setDiet(
      "Vegetarian"
    );

    setGoal(
      "Maintain Weight"
    );

    setResult(null);
    setError("");
  }

  return (
    <CalculatorLayout
      title="🏥 Complete Health Profile"
      subtitle="BMI • BMR • Calories • Water • Nutrition"

      result={
        result ? (
          <div ref={resultRef}>
            <HealthProfileResultCard
              result={result}
            />
          </div>
        ) : (
          <div className="health-empty-result">
            <div className="health-empty-result-icon">
              🏥
            </div>

            <h2>
              Health & Wellness
            </h2>

            <p>
              Fill in your details to calculate your complete wellness result.
            </p>
          </div>
        )
      }
    >

      <div className="health-container">

        <div className="health-card">

          {/* =================================
              PERSONAL DETAILS
          ================================= */}

          <h2>
            👤 Personal Details
          </h2>

          <div className="health-grid">

            {/* NAME */}

            <div className="health-field">

              <label>
                {t("🪪 Your Name")}
              </label>

              <input
              type="text"
              placeholder={t("Enter your name")}
              value={name}
              onChange={(e) =>
              setName(e.target.value)
            }
          />

            </div>

            {/* AGE */}

            <div className="health-field">

              <label>
                🎂 Age
              </label>

              <input
                type="number"
                min="5"
                max="120"
                placeholder="Enter age"
                value={age}
                onChange={(e) =>
                  setAge(e.target.value)
                }
              />

            </div>

          </div>


          {/* =================================
              GENDER
          ================================= */}

          <h2>
            ⚧ Gender
          </h2>

          <div className="option-group">

            <button
              type="button"
              className={
                gender === "Male"
                  ? "option active"
                  : "option"
              }
              onClick={() =>
                setGender("Male")
              }
            >
              👨 Male
            </button>

            <button
              type="button"
              className={
                gender === "Female"
                  ? "option active"
                  : "option"
              }
              onClick={() =>
                setGender("Female")
              }
            >
              👩 Female
            </button>

            <button
              type="button"
              className={
                gender === "Other"
                  ? "option active"
                  : "option"
              }
              onClick={() =>
                setGender("Other")
              }
            >
              ⚧ Other
            </button>

          </div>


          {/* =================================
              BODY MEASUREMENTS
          ================================= */}

          <h2>
            📏 Body Measurements
          </h2>

          <div className="health-grid">

            {/* HEIGHT */}

            <div className="health-field">

              <label>
                📏 Height (cm)
              </label>

              <input
                type="number"
                min="100"
                max="250"
                placeholder="e.g. 170"
                value={height}
                onChange={(e) =>
                  setHeight(e.target.value)
                }
              />

            </div>

            {/* WEIGHT */}

            <div className="health-field">

              <label>
                ⚖️ Weight (kg)
              </label>

              <input
                type="number"
                min="20"
                max="300"
                placeholder="e.g. 65"
                value={weight}
                onChange={(e) =>
                  setWeight(e.target.value)
                }
              />

            </div>

          </div>


          {/* =================================
              ACTIVITY LEVEL
          ================================= */}

          <h2>
            🏃 Activity Level
          </h2>

          <div className="option-list">

            {/* SEDENTARY */}

            <button
              type="button"
              className={
                activity === "Sedentary"
                  ? "activity-card active"
                  : "activity-card"
              }
              onClick={() =>
                setActivity("Sedentary")
              }
            >
              🪑 Sedentary

              <small>
                Little or no exercise
              </small>
            </button>


            {/* LIGHTLY ACTIVE */}

            <button
              type="button"
              className={
                activity === "Lightly Active"
                  ? "activity-card active"
                  : "activity-card"
              }
              onClick={() =>
                setActivity("Lightly Active")
              }
            >
              🚶 Lightly Active

              <small>
                Light exercise
                <br />
                1–3 days/week
              </small>
            </button>


            {/* MODERATELY ACTIVE */}

            <button
              type="button"
              className={
                activity === "Moderately Active"
                  ? "activity-card active"
                  : "activity-card"
              }
              onClick={() =>
                setActivity(
                  "Moderately Active"
                )
              }
            >
              🏃 Moderately Active

              <small>
                Exercise 3–5
                <br />
                days/week
              </small>
            </button>


            {/* VERY ACTIVE */}

            <button
              type="button"
              className={
                activity === "Very Active"
                  ? "activity-card active"
                  : "activity-card"
              }
              onClick={() =>
                setActivity("Very Active")
              }
            >
              💪 Very Active

              <small>
                Hard exercise
                <br />
                6–7 days/week
              </small>
            </button>


            {/* EXTRA ACTIVE */}

            <button
              type="button"
              className={
                activity === "Extra Active"
                  ? "activity-card active"
                  : "activity-card"
              }
              onClick={() =>
                setActivity("Extra Active")
              }
            >
              🏋️ Extra Active

              <small>
                Very hard training /
                <br />
                physical work
              </small>
            </button>

          </div>


          {/* =================================
              DIET PREFERENCE
          ================================= */}

          <h2>
            🥗 Diet Preference
          </h2>

          <div className="option-group">

            {/* VEGETARIAN */}

            <button
              type="button"
              className={
                diet === "Vegetarian"
                  ? "option active veg"
                  : "option"
              }
              onClick={() =>
                setDiet("Vegetarian")
              }
            >
              🥗 Vegetarian
            </button>


            {/* NON VEGETARIAN */}

            <button
              type="button"
              className={
                diet === "Non Vegetarian"
                  ? "option active nonveg"
                  : "option"
              }
              onClick={() =>
                setDiet("Non Vegetarian")
              }
            >
              🍗 Non-Vegetarian
            </button>


            {/* VEGAN */}

            <button
              type="button"
              className={
                diet === "Vegan"
                  ? "option active vegan"
                  : "option"
              }
              onClick={() =>
                setDiet("Vegan")
              }
            >
              🌱 Vegan
            </button>

          </div>


          {/* =================================
              YOUR GOAL
          ================================= */}

          <h2>
            🎯 Your Goal
          </h2>

          <div className="option-group">

            {/* LOSE */}

            <button
              type="button"
              className={
                goal === "Lose Weight"
                  ? "option active"
                  : "option"
              }
              onClick={() =>
                setGoal("Lose Weight")
              }
            >
              ⬇️ Lose Weight
            </button>


            {/* MAINTAIN */}

            <button
              type="button"
              className={
                goal === "Maintain Weight"
                  ? "option active"
                  : "option"
              }
              onClick={() =>
                setGoal(
                  "Maintain Weight"
                )
              }
            >
              ⚖️ Maintain
            </button>


            {/* GAIN */}

            <button
              type="button"
              className={
                goal === "Gain Weight"
                  ? "option active"
                  : "option"
              }
              onClick={() =>
                setGoal("Gain Weight")
              }
            >
              ⬆️ Gain Weight
            </button>

          </div>


          {/* =================================
              ACTION BUTTONS
          ================================= */}

          <div className="health-buttons">

            <button
              type="button"
              className="health-primary"
              onClick={handleCalculate}
            >
              ✨ Calculate Wellness
              <span className="button-arrow">
                →
              </span>
            </button>

            <button
              type="button"
              className="health-reset"
              onClick={handleReset}
            >
              ↻ Reset
            </button>

          </div>


          {/* =================================
              ERROR
          ================================= */}

          {error && (
            <div className="health-error">
              ⚠️ {error}
            </div>
          )}

        </div>

      </div>

    </CalculatorLayout>
  );
}

export default HealthProfileCalculator;