import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../styles/DogAgeCalculator.css";
import PetDateInput from "../components/PetDateInput";
import { formatLocalizedDate } from "../utils/localizedDate";

import ResultAttribution from "../components/ResultAttribution";
/* =========================================================
   NUMBER FORMATTER
========================================================= */

const formatNumber = (value) => {
  if (!Number.isFinite(value)) return "—";

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(value);
};

/* =========================================================
   DOG AGE CALCULATOR
========================================================= */

const DogAgeCalculator = () => {
  const { t } = useTranslation();
  const [birthDate, setBirthDate] = useState("");

  const [calculationDate, setCalculationDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [copied, setCopied] = useState(false);
  const [pdfMessage, setPdfMessage] = useState("");

  /* =======================================================
     HUMAN AGE EQUIVALENT

     Approximation:
     Year 1  ≈ 15 human years
     Year 2  ≈ 24 human years
     Every additional year ≈ 4 human years

     This is a practical estimate and not a veterinary
     diagnostic calculation.
  ======================================================= */

  const calculateHumanAge = (dogYears) => {
    if (dogYears <= 1) {
      return dogYears * 15;
    }

    if (dogYears <= 2) {
      return 15 + (dogYears - 1) * 9;
    }

    return 24 + (dogYears - 2) * 4;
  };

  /* =======================================================
     CALCULATE AGE
  ======================================================= */

  const calculateDogAge = () => {
    setError("");
    setCopied(false);
    setPdfMessage("");

    if (!birthDate) {
      setError("Please select your dog's birth date.");
      setResult(null);
      return;
    }

    if (!calculationDate) {
      setError("Please select the calculation date.");
      setResult(null);
      return;
    }

    const birth = new Date(`${birthDate}T00:00:00`);
    const target = new Date(`${calculationDate}T00:00:00`);

    if (
      Number.isNaN(birth.getTime()) ||
      Number.isNaN(target.getTime())
    ) {
      setError("Please enter valid dates.");
      setResult(null);
      return;
    }

    if (birth > target) {
      setError(
        "Birth date cannot be later than the calculation date."
      );
      setResult(null);
      return;
    }

    /* -----------------------------------------------------
       EXACT CALENDAR AGE
    ----------------------------------------------------- */

    let years =
      target.getFullYear() -
      birth.getFullYear();

    let months =
      target.getMonth() -
      birth.getMonth();

    let days =
      target.getDate() -
      birth.getDate();

    if (days < 0) {
      months--;

      const previousMonth = new Date(
        target.getFullYear(),
        target.getMonth(),
        0
      );

      days += previousMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    /* -----------------------------------------------------
       TOTAL DAYS
    ----------------------------------------------------- */

    const differenceMs =
      target.getTime() -
      birth.getTime();

    const totalDays = Math.floor(
      differenceMs /
        (1000 * 60 * 60 * 24)
    );

    /* -----------------------------------------------------
       APPROXIMATE DECIMAL DOG AGE
    ----------------------------------------------------- */

    const decimalDogAge =
      years +
      months / 12 +
      days / 365.25;

    /* -----------------------------------------------------
       HUMAN EQUIVALENT
    ----------------------------------------------------- */

    const humanAge =
      calculateHumanAge(decimalDogAge);

    const humanYears =
      Math.floor(humanAge);

    const humanMonths =
      Math.floor(
        (humanAge - humanYears) * 12
      );

    /* -----------------------------------------------------
       DOG AGE CATEGORY
    ----------------------------------------------------- */

    let category = "";

    if (decimalDogAge < 1) {
      category = "Puppy";
    } else if (decimalDogAge < 3) {
      category = "Young Dog";
    } else if (decimalDogAge < 7) {
      category = "Adult Dog";
    } else {
      category = "Senior Dog";
    }

    /* -----------------------------------------------------
       BIRTHDAY INFORMATION
    ----------------------------------------------------- */

    const nextBirthday = new Date(
      target.getFullYear(),
      birth.getMonth(),
      birth.getDate()
    );

    if (nextBirthday < target) {
      nextBirthday.setFullYear(
        target.getFullYear() + 1
      );
    }

    const daysToNextBirthday = Math.ceil(
      (nextBirthday.getTime() -
        target.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const calculationText = t("dog_age.calculation_text", {
      years,
      months,
      days,
      humanAge: formatNumber(humanAge),
    });

    setResult({
      birthDate,
      calculationDate,
      years,
      months,
      days,
      totalDays,
      decimalDogAge,
      humanAge,
      humanYears,
      humanMonths,
      category,
      daysToNextBirthday,
      calculationText,
    });
  };

  /* =======================================================
     RESET
  ======================================================= */

  const reset = () => {
    setBirthDate("");

    setCalculationDate(
      new Date().toISOString().split("T")[0]
    );

    setResult(null);
    setError("");
    setCopied(false);
    setPdfMessage("");
  };

  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const displayDate = (dateString) => {
    if (!dateString) return "—";

    const date = new Date(
      `${dateString}T00:00:00`
    );

    return formatLocalizedDate(date, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  /* =======================================================
     RESULT TEXT
  ======================================================= */

  const resultText = useMemo(() => {
    if (!result) return "";

    return [
      "AgeVerse.Global",
      "Dog Age Calculator",
      "",
      "Input Details",
      `Birth Date: ${displayDate(
        result.birthDate
      )}`,
      `Calculation Date: ${displayDate(
        result.calculationDate
      )}`,
      "",
      "Age Result",
      `Dog Age: ${result.years} ${t("Years")} ${result.months} ${t("Months")} ${result.days} ${t("Days")}`,
      `Total Days: ${formatNumber(
        result.totalDays
      )}`,
      `Approximate Human Age: ${formatNumber(
        result.humanAge
      )} Years`,
      `Age Category: ${t(result.category)}`,
      "",
      `Calculation: ${result.calculationText}`,
    ].join("\n");
  }, [result]);

  /* =======================================================
     COPY RESULT AS IMAGE
  ======================================================= */

  const copyResult = async () => {
    if (!result) return;

    setError("");
    setCopied(false);
    setPdfMessage("");

    try {
      const element = document.getElementById(
        "dog-age-result-export"
      );

      if (!element) {
        setError("Result element not found.");
        return;
      }

      const canvas = await html2canvas(
        element,
        {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          allowTaint: false,
          logging: false,
          width: element.scrollWidth,
          height: element.scrollHeight,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
        }
      );

      const blob = await new Promise(
        (resolve, reject) => {
          canvas.toBlob(
            (generatedBlob) => {
              if (generatedBlob) {
                resolve(generatedBlob);
              } else {
                reject(
                  new Error(
                    "Canvas image creation failed."
                  )
                );
              }
            },
            "image/png",
            1
          );
        }
      );

      if (!blob) {
        throw new Error(
          "Unable to create result image."
        );
      }

      const canCopyImage =
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.write ===
          "function" &&
        typeof window !== "undefined" &&
        typeof window.ClipboardItem !==
          "undefined";

      if (canCopyImage) {
        try {
          const clipboardItem =
            new window.ClipboardItem({
              "image/png": blob,
            });

          await navigator.clipboard.write([
            clipboardItem,
          ]);

          setCopied(true);

          window.setTimeout(() => {
            setCopied(false);
          }, 2500);

          return;
        } catch (clipboardError) {
          console.warn(
            "Image clipboard copy failed:",
            clipboardError
          );
        }
      }

      /* FALLBACK DOWNLOAD */

      const url =
        URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = url;
      anchor.download =
        "AgeVerse-Dog-Age-Result.png";

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      setCopied(true);

      setPdfMessage(
        "Image clipboard is not supported by this browser, so the result image was downloaded instead."
      );

      window.setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch (copyError) {
      console.error(
        "Dog age result image error:",
        copyError
      );

      setError(
        "Unable to create result image. Please try again."
      );
    }
  };

  /* =======================================================
     CREATE PDF
  ======================================================= */

  const createPdfBlob = async () => {
    if (!result) return null;

    const element = document.getElementById(
      "dog-age-result-export"
    );

    if (!element) {
      setPdfMessage(
        "Result element not found."
      );
      return null;
    }

    const canvas = await html2canvas(
      element,
      {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: false,
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      }
    );

    const imageData =
      canvas.toDataURL(
        "image/jpeg",
        0.95
      );

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    const margin = 8;

    const availableWidth =
      pageWidth - margin * 2;

    const availableHeight =
      pageHeight - margin * 2;

    const imageRatio =
      canvas.width / canvas.height;

    let imageWidth =
      availableWidth;

    let imageHeight =
      imageWidth / imageRatio;

    if (
      imageHeight >
      availableHeight
    ) {
      imageHeight =
        availableHeight;

      imageWidth =
        imageHeight * imageRatio;
    }

    const x =
      (pageWidth - imageWidth) / 2;

    const y =
      (pageHeight - imageHeight) / 2;

    pdf.addImage(
      imageData,
      "JPEG",
      x,
      y,
      imageWidth,
      imageHeight,
      undefined,
      "FAST"
    );

    return pdf.output("blob");
  };

  /* =======================================================
     DOWNLOAD PDF
  ======================================================= */

  const downloadPdf = async () => {
    if (!result) return;

    try {
      setPdfMessage(
        "Preparing PDF..."
      );

      const blob =
        await createPdfBlob();

      if (!blob) return;

      const url =
        URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = url;

      anchor.download =
        "AgeVerse-Dog-Age-Calculator-Result.pdf";

      document.body.appendChild(anchor);

      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);

      setPdfMessage(
        "PDF downloaded successfully."
      );
    } catch (pdfError) {
      console.error(pdfError);

      setPdfMessage(
        "Unable to download PDF."
      );
    }
  };

  /* =======================================================
     SHARE PDF
  ======================================================= */

  const sharePdf = async () => {
    if (!result) return;

    try {
      setPdfMessage(
        "Preparing PDF..."
      );

      const blob =
        await createPdfBlob();

      if (!blob) return;

      const file = new File(
        [blob],
        "AgeVerse-Dog-Age-Calculator-Result.pdf",
        {
          type: "application/pdf",
        }
      );

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [file],
        })
      ) {
        await navigator.share({
          title:
            "AgeVerse.Global — Dog Age Calculator",
          text:
            "Dog Age Calculator Result",
          files: [file],
        });

        setPdfMessage("");
        return;
      }

      setPdfMessage(
        "PDF sharing is not supported on this device."
      );
    } catch (shareError) {
      console.error(shareError);

      if (
        shareError?.name ===
        "AbortError"
      ) {
        setPdfMessage("");
        return;
      }

      setPdfMessage(
        "Unable to share PDF."
      );
    }
  };

  /* =======================================================
     PRINT
  ======================================================= */

  const printResult = () => {
    if (!result) return;

    window.print();
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="dog-age-calculator-page">

      <div className="dog-age-calculator-layout">

        {/* =================================================
            INPUT CARD
        ================================================= */}

        <section className="dog-age-calculator-card">

          <div className="dog-age-calculator-header">

            <div className="dog-age-calculator-icon">
              🐶
            </div>

            <div>
              <h1>
                Dog Age Calculator
              </h1>

              <p>
                Calculate your dog's exact age and
                approximate human-age equivalent.
              </p>
            </div>

          </div>

          {/* BIRTH DATE */}

          <div className="dog-age-calculator-field">

            <label htmlFor="dogBirthDate">
              Dog's Birth Date
            </label>

            <PetDateInput
              value={birthDate}
              onChange={setBirthDate}
            />

          </div>

          {/* CALCULATION DATE */}

          <div className="dog-age-calculator-field">

            <label htmlFor="dogCalculationDate">
              Calculate Age On
            </label>

            <PetDateInput
              value={calculationDate}
              onChange={setCalculationDate}
            />

          </div>

          {/* INFORMATION */}

          <div className="dog-age-info-section">

            <div className="dog-age-section-heading">
              🐾 About Dog Age
            </div>

            <div className="dog-age-info-title">
              Human Age Equivalent
            </div>

            <div className="dog-age-info-description">
              {t("dog_age.info_description")}
            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div
              className="dog-age-calculator-error"
              role="alert"
            >
              ⚠️ {error}
            </div>
          )}

          {/* BUTTONS */}

          <div className="dog-age-calculator-buttons">

            <button
              type="button"
              className="dog-age-calculator-calculate"
              onClick={calculateDogAge}
            >
              🧮 Calculate
            </button>

            <button
              type="button"
              className="dog-age-calculator-reset"
              onClick={reset}
            >
              🔄 Reset
            </button>

          </div>

          {/* QUICK TIP */}

          <div className="dog-age-calculator-tip">

            <div className="dog-age-calculator-tip-title">
              💡 Quick Tip
            </div>

            <p>
              {t("Human-age conversion is only an approximation. Regular veterinary care, nutrition and exercise are important for your dog's health.")}
            </p>

          </div>

        </section>

        {/* =================================================
            RESULT
        ================================================= */}

        <section className="dog-age-result-section">

          {!result ? (

            <div className="dog-age-empty-result">

              <div className="dog-age-empty-icon">
                🐶
              </div>

              <h2>
                Your Result Will Appear Here
              </h2>

              <p>
                Select your dog's birth date and the
                date on which you want to calculate
                the age, then tap
                <strong> Calculate </strong>
                to see the complete result.
              </p>

              <div className="dog-age-empty-points">
                <span>🎂 Exact Age</span>
                <span>🐾 Human Equivalent</span>
                <span>📊 {t("Age Category")}</span>
              </div>

            </div>

          ) : (

            <div
              className="dog-age-result-card"
              id="dog-age-result-export"
            >

              {/* HEADER */}

              <div className="dog-age-result-header">

                <div className="dog-age-result-icon">
                  ✓
                </div>

                <div>
                  <h2>
                    Dog Age Calculation Result
                  </h2>

                  <p>
                    Age & Human Equivalent Projection
                  </p>
                </div>

              </div>

              {/* INPUT DETAILS */}

              <div className="dog-age-input-summary">

                <div className="dog-age-section-heading">
                  🧾 Input Details
                </div>

                <div className="dog-age-input-grid">

                  <div className="dog-age-summary-item">
                    <span>
                      Birth Date
                    </span>

                    <strong>
                      {displayDate(
                        result.birthDate
                      )}
                    </strong>
                  </div>

                  <div className="dog-age-summary-item">
                    <span>
                      Calculate On
                    </span>

                    <strong>
                      {displayDate(
                        result.calculationDate
                      )}
                    </strong>
                  </div>

                  <div className="dog-age-summary-item">
                    <span>
                      Age Category
                    </span>

                    <strong>
                      {t(result.category)}
                    </strong>
                  </div>

                  <div className="dog-age-summary-item">
                    <span>
                      Total Days
                    </span>

                    <strong>
                      {formatNumber(
                        result.totalDays
                      )}
                    </strong>
                  </div>

                </div>

              </div>

              {/* MAIN AGE */}

              <div className="dog-age-main-result">

                <span>
                  Your Dog's Exact Age
                </span>

                <strong>
                  {result.years} {t("Years")} {" "}
                  {result.months} {t("Months")} {" "}
                  {result.days} {t("Days")}
                </strong>

                <small>
                  ✓ Calculated between the selected dates
                </small>

              </div>

              {/* HUMAN EQUIVALENT */}

              <div className="dog-age-human-result">

                <span>
                  🧑 Approximate Human Age
                </span>

                <strong>
                  {formatNumber(
                    result.humanAge
                  )} {t("Years")}
                </strong>

                <small>
                  {t("Approximately")} {" "}
                  {result.humanYears} {t("Years")} {" "}
                  {result.humanMonths} {t("Months")}
                </small>

              </div>

              {/* METRICS */}

              <div className="dog-age-result-metrics">

                <div className="dog-age-metric-card">

                  <span>
                    🎂 Dog Age
                  </span>

                  <strong>
                    {result.years} {t("Years")} {" "}
                    {result.months} {t("Months")} {" "}
                    {result.days} {t("Days")}
                  </strong>

                </div>

                <div className="dog-age-metric-card">

                  <span>
                    📅 Total Days
                  </span>

                  <strong>
                    {formatNumber(
                      result.totalDays
                    )}
                  </strong>

                </div>

                <div className="dog-age-metric-card">

                  <span>
                    🐾 {t("Category")}
                  </span>

                  <strong>
                    {t(result.category)}
                  </strong>

                </div>

              </div>

              {/* AGE FLOW */}

              <div className="dog-age-flow-section">

                <div className="dog-age-section-heading">
                  📊 Age Summary
                </div>

                <div className="dog-age-flow-box">

                  <div className="dog-age-flow-item">

                    <span>
                      Birth Date
                    </span>

                    <strong>
                      {displayDate(
                        result.birthDate
                      )}
                    </strong>

                  </div>

                  <div className="dog-age-flow-arrow">
                    →
                  </div>

                  <div className="dog-age-flow-item">

                    <span>
                      Dog Age
                    </span>

                    <strong>
                      {result.years} {t("Years")} {" "}
                      {result.months} {t("Months")} {" "}
                      {result.days} {t("Days")}
                    </strong>

                  </div>

                  <div className="dog-age-flow-arrow">
                    →
                  </div>

                  <div className="dog-age-flow-result">

                    <span>
                      Human Equivalent
                    </span>

                    <strong>
                      {formatNumber(
                        result.humanAge
                      )} {t("Years")}
                    </strong>

                  </div>

                </div>

              </div>

              {/* NEXT BIRTHDAY */}

              <div className="dog-age-next-birthday">

                <strong>
                  🎉 Next Birthday
                </strong>

                <p>
                  Approximately{" "}
                  <b>
                    {formatNumber(
                      result.daysToNextBirthday
                    )}
                  </b>{" "}
                  {t("dog_age.days_remaining_suffix")}
                </p>

              </div>

              {/* CALCULATION */}

              <div className="dog-age-equation">

                <div>
                  📐 Calculation
                </div>

                <strong>
                  {result.calculationText}
                </strong>

              </div>

              {/* NOTE */}

              <div className="dog-age-important">

                <strong>
                  {t("ℹ️ Calculation Note")}
                </strong>

                <p>
                  {t("calculation_notes.dog_age")}
                </p>

              </div>

              {/* ACTIONS */}

              <div className="dog-age-result-actions">

                <button
                  type="button"
                  onClick={copyResult}
                  className="dog-age-action-copy"
                >
                  📋 Copy Image
                </button>

                <button
                  type="button"
                  onClick={downloadPdf}
                  className="dog-age-action-pdf"
                >
                  📄 Download PDF
                </button>

                <button
                  type="button"
                  onClick={sharePdf}
                  className="dog-age-action-share"
                >
                  📤 Share PDF
                </button>

                <button
                  type="button"
                  onClick={printResult}
                  className="dog-age-action-print"
                >
                  🖨️ Print
                </button>

                <button
                  type="button"
                  onClick={reset}
                  className="dog-age-action-new"
                >
                  🔄 New
                </button>

              </div>

              {/* MESSAGES */}

              {copied && (
                <div className="dog-age-action-message">
                  ✓ Result image copied successfully.
                </div>
              )}

              {pdfMessage && (
                <div className="dog-age-pdf-message">
                  {pdfMessage}
                </div>
              )}

              {/* FOOTER */}

              <div className="dog-age-result-footer">
        <ResultAttribution type="generated" />
      </div>

            </div>

          )}

        </section>

      </div>

    </main>
  );
};

export default DogAgeCalculator;