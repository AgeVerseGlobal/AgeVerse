import { useTranslation } from "react-i18next";
/* =========================================================
   AGEVERSE — UTILITY — UNIT CONVERTER
   COMPLETE FINAL JSX
========================================================= */

import {
  useMemo,
  useRef,
  useState,
} from "react";

import CalculatorLayout from "../components/CalculatorLayout";
import ResultAttribution from "../components/ResultAttribution";

import {
  convertUnit,
  formatUnitValue,
  getUnitCategories,
  getUnitNames,
  getUnitSymbol,
} from "../utils/UnitConverterLogic";

import {
  copyUnitConverterImage,
  downloadUnitConverterPDF,
  shareUnitConverterPDF,
} from "../utils/UnitConverterExport";

import {
  printUnitConverterResult,
} from "../utils/UnitConverterPrint";

import "../styles/UnitConverter.css";


function UnitConverter() {

  const { t } = useTranslation();

  /* =====================================================
     RESULT CARD REFERENCE
  ===================================================== */

  const resultCardRef = useRef(null);


  /* =====================================================
     CATEGORIES
  ===================================================== */

  const categories = useMemo(
    () => getUnitCategories(),
    []
  );


  /* =====================================================
     STATE
  ===================================================== */

  const [category, setCategory] =
    useState("length");

  const initialUnits =
    getUnitNames("length");


  const [fromUnit, setFromUnit] =
    useState(
      initialUnits[2] ||
      initialUnits[0]
    );


  const [toUnit, setToUnit] =
    useState(
      initialUnits[3] ||
      initialUnits[1] ||
      initialUnits[0]
    );


  const [inputValue, setInputValue] =
    useState("");


  const [result, setResult] =
    useState(null);


  const [error, setError] =
    useState("");


  const [actionMessage, setActionMessage] =
    useState("");


  /* =====================================================
     CURRENT CATEGORY UNITS
  ===================================================== */

  const units =
    getUnitNames(category);


  /* =====================================================
     CATEGORY CHANGE
  ===================================================== */

  function handleCategoryChange(event) {

    const nextCategory =
      event.target.value;


    const nextUnits =
      getUnitNames(
        nextCategory
      );


    setCategory(
      nextCategory
    );


    setFromUnit(
      nextUnits[0]
    );


    setToUnit(
      nextUnits[1] ||
      nextUnits[0]
    );


    setInputValue("");
    setResult(null);
    setError("");
    setActionMessage("");
  }


  /* =====================================================
     SWAP UNITS
  ===================================================== */

  function handleSwap() {

    setFromUnit(
      toUnit
    );


    setToUnit(
      fromUnit
    );


    setResult(null);
    setError("");
    setActionMessage("");
  }


  /* =====================================================
     CALCULATE
  ===================================================== */

  function handleCalculate(event) {

    event.preventDefault();


    setError("");
    setResult(null);
    setActionMessage("");


    if (
      inputValue === "" ||
      inputValue === null
    ) {

      setError(
        "Please enter a value to convert."
      );

      return;
    }


    const numericValue =
      Number(inputValue);


    if (
      !Number.isFinite(
        numericValue
      )
    ) {

      setError(
        "Please enter a valid number."
      );

      return;
    }


    try {

      const converted =
        convertUnit(
          category,
          numericValue,
          fromUnit,
          toUnit
        );


      setResult({

        input:
          numericValue,

        converted,

        category,

        fromUnit,

        toUnit,

        fromSymbol:
          getUnitSymbol(
            category,
            fromUnit
          ),

        toSymbol:
          getUnitSymbol(
            category,
            toUnit
          ),

      });


    } catch (conversionError) {

      console.error(
        conversionError
      );


      setError(
        "Unable to convert the selected units."
      );
    }
  }


  /* =====================================================
     RESET
  ===================================================== */

  function handleReset() {

    const defaultUnits =
      getUnitNames(
        "length"
      );


    setCategory(
      "length"
    );


    setFromUnit(
      defaultUnits[2] ||
      defaultUnits[0]
    );


    setToUnit(
      defaultUnits[3] ||
      defaultUnits[1] ||
      defaultUnits[0]
    );


    setInputValue("");
    setResult(null);
    setError("");
    setActionMessage("");
  }


  /* =====================================================
     COPY IMAGE
  ===================================================== */

  async function handleCopy() {

    if (
      !result ||
      !resultCardRef.current
    ) {
      return;
    }


    setActionMessage(
      "Preparing image..."
    );


    try {

      await copyUnitConverterImage(
        resultCardRef.current
      );


      setActionMessage(
        "✓ Result image copied successfully."
      );


    } catch (error) {

      console.error(
        "Unit Converter Copy Error:",
        error
      );


      setActionMessage(
        "Image copy is not supported by this browser. Please use Download PDF."
      );
    }
  }


  /* =====================================================
     DOWNLOAD PDF
  ===================================================== */

  async function handleDownload() {

    if (
      !result ||
      !resultCardRef.current
    ) {
      return;
    }


    setActionMessage(
      "Preparing PDF..."
    );


    try {

      await downloadUnitConverterPDF(
        resultCardRef.current
      );


      setActionMessage(
        "✓ PDF downloaded successfully."
      );


    } catch (error) {

      console.error(
        "Unit Converter PDF Error:",
        error
      );


      setActionMessage(
        "Unable to generate PDF."
      );
    }
  }


  /* =====================================================
     SHARE PDF
  ===================================================== */

  async function handleShare() {

    if (
      !result ||
      !resultCardRef.current
    ) {
      return;
    }


    setActionMessage(
      "Preparing PDF for sharing..."
    );


    try {

      const shared =
        await shareUnitConverterPDF(
          resultCardRef.current
        );


      if (shared) {

        setActionMessage(
          "✓ Result PDF shared successfully."
        );


      } else {

        setActionMessage(
          "Sharing is not supported here, so the PDF was downloaded instead."
        );
      }


    } catch (error) {

      if (
        error?.name ===
        "AbortError"
      ) {

        setActionMessage("");

        return;
      }


      console.error(
        "Unit Converter Share Error:",
        error
      );


      setActionMessage(
        "Unable to share the PDF."
      );
    }
  }


  /* =====================================================
     PRINT
  ===================================================== */

  function handlePrint() {

    if (
      !result ||
      !resultCardRef.current
    ) {
      return;
    }


    setActionMessage(
      "Opening print preview..."
    );


    try {

      printUnitConverterResult(
        resultCardRef.current
      );


    } catch (error) {

      console.error(
        "Unit Converter Print Error:",
        error
      );


      setActionMessage(
        "Unable to open print preview."
      );
    }
  }


  /* =====================================================
     CURRENT CATEGORY
  ===================================================== */

  const currentCategory =
    categories.find(
      (item) =>
        item.key === category
    );


  /* =====================================================
     UI
  ===================================================== */

  return (

    <CalculatorLayout

      title="📏 Unit Converter"

      subtitle={t("unit_converter.subtitle")}

      result={

        result ? (

          /* =================================================
             RESULT CARD
          ================================================= */

          <div
            className="unit-converter-result-card"
            ref={resultCardRef}
          >

            {/* ===============================================
               RESULT HEADER
            =============================================== */}

            <div className="unit-converter-result-header">

              <div className="unit-converter-result-icon">

                {
                  currentCategory?.icon ||
                  "📏"
                }

              </div>


              <div>

                <h2>
                  {t("Unit Conversion Result")}
                </h2>

                <p>
                  {t("AgeVerse Utility • Unit Converter")}
                </p>

              </div>

            </div>


            {/* ===============================================
               INPUT SUMMARY
            =============================================== */}

            <div className="unit-converter-summary-title">

              📌 Input Summary

            </div>


            <div className="unit-converter-summary-grid">

              {/* CATEGORY */}

              <div className="unit-converter-summary-box">

                <span>
                  {t("Category")}
                </span>

                <strong>

                  {t(currentCategory?.title || category)}

                </strong>

              </div>


              {/* FROM */}

              <div className="unit-converter-summary-box">

                <span>
                  {t("From")}
                </span>

                <strong>

                  {
                    formatUnitValue(
                      result.input
                    )
                  }{" "}

                  {
                    result.fromSymbol
                  }

                </strong>

                <small>
                  {result.fromUnit}
                </small>

              </div>


              {/* TO */}

              <div className="unit-converter-summary-box">

                <span>
                  {t("To")}
                </span>

                <strong>
                  {t(result.toUnit)}
                </strong>

                <small>
                  {result.toSymbol}
                </small>

              </div>

            </div>


            {/* ===============================================
               MAIN RESULT
            =============================================== */}

            <div className="unit-converter-main-result">

              <span>
                Converted Value
              </span>


              <strong>

                {
                  formatUnitValue(
                    result.converted
                  )
                }

              </strong>


              <small>

                {result.toSymbol}{" "}
                {result.toUnit}

              </small>

            </div>


            {/* ===============================================
               EQUATION
            =============================================== */}

            <div className="unit-converter-equation">

              <span>
                Conversion
              </span>


              <strong>

                {
                  formatUnitValue(
                    result.input
                  )
                }{" "}

                {result.fromSymbol}

                {" = "}

                {
                  formatUnitValue(
                    result.converted
                  )
                }{" "}

                {result.toSymbol}

              </strong>

            </div>


            {/* ===============================================
               IMPORTANT NOTE
            =============================================== */}

            <div className="unit-converter-important">

              <strong>
                ℹ️ Important
              </strong>


              <p>
                {t("unit_converter.result_note")}
              </p>

            </div>


            {/* ===============================================
               FOOTER
            =============================================== */}

            <div className="unit-converter-result-footer">
        <ResultAttribution type="generated" />
      </div>


            {/* ===============================================
               ACTION BUTTONS
            =============================================== */}

            <div className="unit-converter-result-actions">

              <button
                type="button"
                onClick={
                  handleCopy
                }
              >

                📋 Copy Result

              </button>


              <button
                type="button"
                onClick={
                  handleDownload
                }
              >

                📥 Download PDF

              </button>


              <button
                type="button"
                onClick={
                  handleShare
                }
              >

                📤 Share PDF

              </button>


              <button
                type="button"
                onClick={
                  handlePrint
                }
              >

                🖨️ Print

              </button>

            </div>


            {/* ===============================================
               ACTION MESSAGE
            =============================================== */}

            {
              actionMessage && (

                <div className="unit-converter-action-message">

                  {actionMessage}

                </div>

              )
            }

          </div>

        ) : (

          /* =================================================
             EMPTY RESULT
          ================================================= */

          <div className="unit-converter-empty-result">

            <div>
              📏
            </div>


            <h2>
              Unit Converter
            </h2>


            <p>
              {t("unit_converter.intro")}
            </p>


            <span>

              Your result will appear here.

            </span>

          </div>

        )

      }

    >


      {/* =====================================================
          INPUT FORM
      ===================================================== */}

      <form
        className="unit-converter-card"
        onSubmit={
          handleCalculate
        }
      >


        {/* ===================================================
            CATEGORY
        =================================================== */}

        <div className="unit-converter-field">

          <label>
            🧮 Conversion Category
          </label>


          <select
            value={category}
            onChange={
              handleCategoryChange
            }
          >

            {
              categories.map(
                (item) => (

                  <option
                    key={item.key}
                    value={item.key}
                  >

                    {item.icon}{" "}
                    {item.title}

                  </option>

                )
              )
            }

          </select>

        </div>


        {/* ===================================================
            FROM UNIT + SWAP + TO UNIT
            VALUE IS NOW BELOW THIS ROW
        =================================================== */}

        <div className="unit-converter-unit-row">


          {/* ===============================================
             FROM UNIT
          =============================================== */}

          <div className="unit-converter-field">

            <label>
              From Unit
            </label>


            <select
              value={fromUnit}
              onChange={(event) => {

                setFromUnit(
                  event.target.value
                );

                setResult(null);
                setError("");
                setActionMessage("");

              }}
            >

              {
                units.map(
                  (unit) => (

                    <option
                      key={unit}
                      value={unit}
                    >

                      {t(unit)} (
                      {
                        getUnitSymbol(
                          category,
                          unit
                        )
                      }
                      )

                    </option>

                  )
                )
              }

            </select>

          </div>


          {/* ===============================================
             SWAP BUTTON
          =============================================== */}

          <button
            type="button"
            className="unit-converter-swap"
            onClick={
              handleSwap
            }
            aria-label="Swap units"
            title="Swap units"
          >

            ⇄

          </button>


          {/* ===============================================
             TO UNIT
          =============================================== */}

          <div className="unit-converter-field">

            <label>
              To Unit
            </label>


            <select
              value={toUnit}
              onChange={(event) => {

                setToUnit(
                  event.target.value
                );

                setResult(null);
                setError("");
                setActionMessage("");

              }}
            >

              {
                units.map(
                  (unit) => (

                    <option
                      key={unit}
                      value={unit}
                    >

                      {t(unit)} (
                      {
                        getUnitSymbol(
                          category,
                          unit
                        )
                      }
                      )

                    </option>

                  )
                )
              }

            </select>

          </div>

        </div>


        {/* ===================================================
            VALUE — BELOW FROM / TO
        =================================================== */}

        <div className="unit-converter-field unit-converter-value-field">

          <label>
            🔢 Value
          </label>


          <input
            type="number"
            inputMode="decimal"
            step="any"
            value={inputValue}
            onChange={(event) => {

              setInputValue(
                event.target.value
              );

              setResult(null);
              setError("");
              setActionMessage("");

            }}
            placeholder="Enter value"
          />

        </div>


        {/* ===================================================
            ERROR
        =================================================== */}

        {
          error && (

            <div
              className="unit-converter-error"
              role="alert"
            >

              ⚠️ {error}

            </div>

          )
        }


        {/* ===================================================
            CALCULATE + RESET
        =================================================== */}

        <div className="unit-converter-buttons">


          <button
            type="submit"
            className="unit-converter-calculate"
          >

            📏 Convert

          </button>


          <button
            type="button"
            className="unit-converter-reset"
            onClick={
              handleReset
            }
          >

            ↻ Reset

          </button>

        </div>


        {/* ===================================================
            HOW IT WORKS
        =================================================== */}

        <div className="unit-converter-info">

          <strong>
            💡 How it works
          </strong>


          <p>
            {t("unit_converter.instructions")}
          </p>

        </div>


      </form>

    </CalculatorLayout>

  );
}


export default UnitConverter;