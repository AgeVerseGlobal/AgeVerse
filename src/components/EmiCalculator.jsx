import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../styles/EmiCalculator.css";

import ResultAttribution from "./ResultAttribution";
/* =========================================================
   NUMBER FORMATTER
========================================================= */

const formatNumber = (value, decimals = 2) => {
  if (!Number.isFinite(value)) return "—";

  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/* =========================================================
   CURRENCY
========================================================= */

const formatCurrency = (value) => {
  if (!Number.isFinite(value)) return "—";
  return `₹${formatNumber(value)}`;
};

/* =========================================================
   EMI CALCULATOR
========================================================= */

const EmiCalculator = () => {
  const { t } = useTranslation();
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("8.5");
  const [tenure, setTenure] = useState("");
  const [tenureType, setTenureType] = useState("years");

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [actionMessage, setActionMessage] = useState("");
  const [pdfMessage, setPdfMessage] = useState("");

  const resultRef = useRef(null);

  /* =======================================================
     TENURE
  ======================================================= */

  const tenureMonths = useMemo(() => {
    const value = Number(tenure);

    if (!Number.isFinite(value) || value <= 0) {
      return 0;
    }

    if (tenureType === "years") {
      return Math.round(value * 12);
    }

    return Math.round(value);
  }, [tenure, tenureType]);

  /* =======================================================
     CALCULATE EMI
  ======================================================= */

  const calculate = () => {
    setError("");
    setActionMessage("");
    setPdfMessage("");

    if (loanAmount.trim() === "") {
      setError("Please enter the loan amount.");
      setResult(null);
      return;
    }

    if (tenure.trim() === "") {
      setError("Please enter the loan tenure.");
      setResult(null);
      return;
    }

    const principal = Number(loanAmount);
    const annualRate = Number(interestRate);
    const months = tenureMonths;

    if (
      !Number.isFinite(principal) ||
      principal <= 0
    ) {
      setError("Please enter a valid loan amount greater than 0.");
      setResult(null);
      return;
    }

    if (
      !Number.isFinite(annualRate) ||
      annualRate < 0 ||
      annualRate > 100
    ) {
      setError("Please enter a valid interest rate between 0% and 100%.");
      setResult(null);
      return;
    }

    if (!months || months <= 0 || months > 1200) {
      setError("Please enter a valid loan tenure.");
      setResult(null);
      return;
    }

    const monthlyRate = annualRate / 12 / 100;

    let emi;

    /* -------------------------------------------------------
       ZERO INTEREST
    ------------------------------------------------------- */

    if (monthlyRate === 0) {
      emi = principal / months;
    }

    /* -------------------------------------------------------
       NORMAL EMI
    ------------------------------------------------------- */

    else {
      const power = Math.pow(1 + monthlyRate, months);

      emi =
        (principal * monthlyRate * power) /
        (power - 1);
    }

    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;

    const principalPercentage =
      totalPayment > 0
        ? (principal / totalPayment) * 100
        : 0;

    const interestPercentage =
      totalPayment > 0
        ? (totalInterest / totalPayment) * 100
        : 0;

    const equation =
      monthlyRate === 0
        ? `₹${formatNumber(principal)} ÷ ${months} months = ₹${formatNumber(emi)}`
        : `P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1)`;

    setResult({
      principal,
      annualRate,
      months,
      monthlyRate,
      emi,
      totalPayment,
      totalInterest,
      principalPercentage,
      interestPercentage,
      equation,
    });
  };

  /* =======================================================
     RESET
  ======================================================= */

  const reset = () => {
    setLoanAmount("");
    setInterestRate("8.5");
    setTenure("");
    setTenureType("years");

    setResult(null);
    setError("");
    setActionMessage("");
    setPdfMessage("");
  };

  /* =======================================================
     RESULT TEXT
  ======================================================= */

  const resultText = result
    ? [
        "AgeVerse.Global",
        "EMI Calculator",
        "",
        "Loan Summary",
        "",
        `Loan Amount: ₹${formatNumber(result.principal)}`,
        `Interest Rate: ${formatNumber(result.annualRate)}% p.a.`,
        `Loan Tenure: ${result.months} months`,
        "",
        `Monthly EMI: ₹${formatNumber(result.emi)}`,
        `Total Interest: ₹${formatNumber(result.totalInterest)}`,
        `Total Payment: ₹${formatNumber(result.totalPayment)}`,
        "",
        `Principal: ${formatNumber(result.principalPercentage)}%`,
        `Interest: ${formatNumber(result.interestPercentage)}%`,
        "",
        `Formula: ${result.equation}`,
      ].join("\n")
    : "";

  /* =======================================================
     RESULT CANVAS
  ======================================================= */

  const createResultCanvas = async () => {
    if (!resultRef.current) {
      throw new Error("Result card not found.");
    }

    return html2canvas(resultRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: resultRef.current.scrollWidth,
    });
  };

  /* =======================================================
     COPY AS IMAGE
  ======================================================= */

  const copyResult = async () => {
    if (!result) return;

    setActionMessage("");
    setPdfMessage("");

    try {
      const canvas = await createResultCanvas();

      if (
        navigator.clipboard &&
        window.ClipboardItem
      ) {
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png")
        );

        if (blob) {
          const item = new ClipboardItem({
            "image/png": blob,
          });

          await navigator.clipboard.write([
            item,
          ]);

          setActionMessage(
            "✓ Result image copied successfully."
          );

          return;
        }
      }

      /* ---------------------------------------------------
         FALLBACK
      --------------------------------------------------- */

      await navigator.clipboard?.writeText(
        resultText
      );

      setActionMessage(
        "✓ Image copy is not supported here. Result text copied instead."
      );
    } catch {
      try {
        await navigator.clipboard.writeText(
          resultText
        );

        setActionMessage(
          "✓ Image copy is not supported here. Result text copied instead."
        );
      } catch {
        setActionMessage(
          "Unable to copy the result."
        );
      }
    }
  };

  /* =======================================================
     CREATE PDF
  ======================================================= */

  const createPdf = async () => {
    const canvas = await createResultCanvas();

    const imgData = canvas.toDataURL(
      "image/jpeg",
      0.95
    );

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    const margin = 8;

    const availableWidth =
      pageWidth - margin * 2;

    const imageRatio =
      canvas.height / canvas.width;

    let imageWidth = availableWidth;
    let imageHeight =
      imageWidth * imageRatio;

    /* ---------------------------------------------------
       SCALE TO A4
    --------------------------------------------------- */

    const maxHeight =
      pageHeight - margin * 2;

    if (imageHeight > maxHeight) {
      imageHeight = maxHeight;
      imageWidth =
        imageHeight / imageRatio;
    }

    const x =
      (pageWidth - imageWidth) / 2;

    const y = margin;

    pdf.addImage(
      imgData,
      "JPEG",
      x,
      y,
      imageWidth,
      imageHeight,
      undefined,
      "FAST"
    );

    return pdf;
  };

  /* =======================================================
     DOWNLOAD PDF
  ======================================================= */

  const downloadPdf = async () => {
    if (!result) return;

    setPdfMessage("");
    setActionMessage("");

    try {
      const pdf = await createPdf();

      pdf.save(
        "AgeVerse-EMI-Calculator-Result.pdf"
      );

      setPdfMessage(
        "✓ PDF downloaded successfully."
      );
    } catch {
      setPdfMessage(
        "Unable to create PDF."
      );
    }
  };

  /* =======================================================
     SHARE PDF
  ======================================================= */

  const sharePdf = async () => {
    if (!result) return;

    setPdfMessage("");
    setActionMessage("");

    try {
      const pdf = await createPdf();

      const blob = pdf.output("blob");

      const file = new File(
        [blob],
        "AgeVerse-EMI-Calculator-Result.pdf",
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
            "AgeVerse.Global — EMI Calculator",
          text:
            "EMI Calculator Result",
          files: [file],
        });

        return;
      }

      /* ---------------------------------------------------
         FALLBACK
      --------------------------------------------------- */

      pdf.save(
        "AgeVerse-EMI-Calculator-Result.pdf"
      );

      setPdfMessage(
        "PDF sharing is not supported here. PDF downloaded instead."
      );
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }

      setPdfMessage(
        "Unable to share PDF on this device."
      );
    }
  };

  /* =======================================================
     PRINT
  ======================================================= */

  const printResult = async () => {
    if (!result) return;

    setPdfMessage("");
    setActionMessage("");

    try {
      const canvas =
        await createResultCanvas();

      const image =
        canvas.toDataURL(
          "image/png"
        );

      const printWindow =
        window.open(
          "",
          "_blank",
          "width=900,height=1100"
        );

      if (!printWindow) {
        setPdfMessage(
          "Please allow pop-ups to print the result."
        );

        return;
      }

      printWindow.document.open();

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>AgeVerse EMI Calculator Result</title>

          <style>
            @page {
              size: A4 portrait;
              margin: 8mm;
            }

            * {
              box-sizing: border-box;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              background: #ffffff;
            }

            body {
              width: 100%;
              display: flex;
              justify-content: center;
              align-items: flex-start;
            }

            .print-wrapper {
              width: 100%;
              text-align: center;
            }

            img {
              display: block;
              width: 100%;
              max-width: 194mm;
              height: auto;
              margin: 0 auto;
            }
          </style>
        </head>

        <body>

          <div class="print-wrapper">
            <img src="${image}" />
          </div>

          <script>
            window.onload = function () {
              setTimeout(function () {
                window.print();
              }, 300);
            };

            window.onafterprint = function () {
              setTimeout(function () {
                window.close();
              }, 300);
            };
          <\/script>

        </body>
        </html>
      `);

      printWindow.document.close();
    } catch {
      setPdfMessage(
        "Unable to print the result."
      );
    }
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="emi-calculator-page">

      <div className="emi-calculator-layout">

        {/* =================================================
            INPUT CARD
        ================================================= */}

        <section className="emi-calculator-card">

          <div className="emi-calculator-header">

            <div className="emi-calculator-icon">
              💳
            </div>

            <div>
              <h1>
                EMI Calculator
              </h1>

              <p>
                Calculate your monthly EMI,
                total interest and total
                repayment amount.
              </p>
            </div>

          </div>

          {/* LOAN AMOUNT */}

          <div className="emi-calculator-field emi-main-field">

            <label htmlFor="emiLoanAmount">
              Loan Amount
            </label>

            <input
              id="emiLoanAmount"
              type="number"
              inputMode="decimal"
              min="0"
              value={loanAmount}
              placeholder="e.g. 500000"
              onChange={(event) =>
                setLoanAmount(
                  event.target.value
                )
              }
            />

          </div>

          {/* INTEREST */}

          <div className="emi-calculator-field">

            <label htmlFor="emiInterestRate">
              Interest Rate (% p.a.)
            </label>

            <input
              id="emiInterestRate"
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.01"
              value={interestRate}
              placeholder="e.g. 8.5"
              onChange={(event) =>
                setInterestRate(
                  event.target.value
                )
              }
            />

          </div>

          {/* TENURE */}

          <div className="emi-calculator-field">

            <label htmlFor="emiTenure">
              Loan Tenure
            </label>

            <div className="emi-tenure-row">

              <input
                id="emiTenure"
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={tenure}
                placeholder={
                  tenureType === "years"
                    ? "e.g. 5"
                    : "e.g. 60"
                }
                onChange={(event) =>
                  setTenure(
                    event.target.value
                  )
                }
              />

              <select
                value={tenureType}
                onChange={(event) => {
                  setTenureType(
                    event.target.value
                  );
                  setResult(null);
                  setActionMessage("");
                  setPdfMessage("");
                }}
              >
                <option value="years">
                  Years
                </option>

                <option value="months">
                  Months
                </option>
              </select>

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div
              className="emi-calculator-error"
              role="alert"
            >
              ⚠️ {error}
            </div>
          )}

          {/* BUTTONS */}

          <div className="emi-calculator-buttons">

            <button
              type="button"
              className="emi-calculator-calculate"
              onClick={calculate}
            >
              🧮 Calculate EMI
            </button>

            <button
              type="button"
              className="emi-calculator-reset"
              onClick={reset}
            >
              🔄 Reset
            </button>

          </div>

          {/* QUICK TIP */}

          <div className="emi-calculator-info">

            <div className="emi-calculator-info-title">
              💡 Quick Tip
            </div>

            <p>
              Enter the loan amount, annual
              interest rate and repayment
              tenure to calculate your monthly
              EMI and complete repayment
              summary.
            </p>

          </div>

        </section>

        {/* =================================================
            RESULT
        ================================================= */}

        <section className="emi-calculator-result-section">

          {!result ? (

            <div className="emi-calculator-empty-result">

              <div className="emi-calculator-empty-icon">
                💳
              </div>

              <h2>
                Your EMI Result Will Appear Here
              </h2>

              <p>
                Enter your loan details and tap
                <strong>
                  {" "}Calculate EMI
                </strong>
                {" "}to see your complete
                repayment summary.
              </p>

              <div className="emi-calculator-empty-points">
                <span>⚡ Fast</span>
                <span>✓ Accurate</span>
                <span>📊 Detailed</span>
              </div>

            </div>

          ) : (

            <div
              ref={resultRef}
              className="emi-calculator-result-card"
            >

              {/* RESULT HEADER */}

              <div className="emi-calculator-result-header">

                <div className="emi-calculator-result-icon">
                  ✓
                </div>

                <div>
                  <h2>
                    EMI Calculation Result
                  </h2>

                  <p>
                    Your complete loan repayment summary
                  </p>
                </div>

              </div>

              {/* INPUT DETAILS */}

              <div className="emi-calculator-input-summary">

                <div className="emi-calculator-section-heading">
                  💳 Loan Input Details
                </div>

                <div className="emi-calculator-summary-grid">

                  <div className="emi-calculator-summary-item">
                    <span>
                      Loan Amount
                    </span>

                    <strong>
                      {formatCurrency(
                        result.principal
                      )}
                    </strong>
                  </div>

                  <div className="emi-calculator-summary-item">
                    <span>
                      Interest Rate
                    </span>

                    <strong>
                      {formatNumber(
                        result.annualRate
                      )}% p.a.
                    </strong>
                  </div>

                  <div className="emi-calculator-summary-item">
                    <span>
                      Loan Tenure
                    </span>

                    <strong>
                      {result.months} Months
                    </strong>
                  </div>

                  <div className="emi-calculator-summary-item">
                    <span>
                      Monthly Interest
                    </span>

                    <strong>
                      {formatNumber(
                        result.monthlyRate * 100,
                        4
                      )}%
                    </strong>
                  </div>

                </div>

              </div>

              {/* MAIN EMI */}

              <div className="emi-calculator-main-result">

                <span>
                  Monthly EMI
                </span>

                <strong>
                  {formatCurrency(
                    result.emi
                  )}
                </strong>

                <small>
                  ✓ Amount payable every month
                </small>

              </div>

              {/* REPAYMENT SUMMARY */}

              <div className="emi-calculator-summary-card">

                <div className="emi-calculator-section-heading">
                  💰 Repayment Summary
                </div>

                <div className="emi-repayment-grid">

                  <div className="emi-repayment-item">
                    <span>
                      Principal Amount
                    </span>

                    <strong>
                      {formatCurrency(
                        result.principal
                      )}
                    </strong>
                  </div>

                  <div className="emi-repayment-item">
                    <span>
                      Total Interest
                    </span>

                    <strong>
                      {formatCurrency(
                        result.totalInterest
                      )}
                    </strong>
                  </div>

                  <div className="emi-repayment-item emi-repayment-full">
                    <span>
                      Total Payment
                    </span>

                    <strong>
                      {formatCurrency(
                        result.totalPayment
                      )}
                    </strong>
                  </div>

                </div>

              </div>

              {/* FLOW */}

              <div className="emi-calculator-flow">

                <div className="emi-calculator-section-heading">
                  🧮 Repayment Flow
                </div>

                <div className="emi-flow-box">

                  <div className="emi-flow-row">

                    <span>
                      Principal
                    </span>

                    <strong>
                      {formatCurrency(
                        result.principal
                      )}
                    </strong>

                  </div>

                  <div className="emi-flow-operator">
                    +
                  </div>

                  <div className="emi-flow-row">

                    <span>
                      Interest
                    </span>

                    <strong>
                      {formatCurrency(
                        result.totalInterest
                      )}
                    </strong>

                  </div>

                  <div className="emi-flow-arrow">
                    ↓
                  </div>

                  <div className="emi-flow-result">

                    <span>
                      Total Repayment
                    </span>

                    <strong>
                      {formatCurrency(
                        result.totalPayment
                      )}
                    </strong>

                  </div>

                </div>

              </div>

              {/* PRINCIPAL / INTEREST */}

              <div className="emi-calculator-share-summary">

                <div className="emi-calculator-section-heading">
                  📊 Payment Composition
                </div>

                <div className="emi-composition-grid">

                  <div>
                    <span>
                      Principal
                    </span>

                    <strong>
                      {formatNumber(
                        result.principalPercentage
                      )}%
                    </strong>
                  </div>

                  <div>
                    <span>
                      Interest
                    </span>

                    <strong>
                      {formatNumber(
                        result.interestPercentage
                      )}%
                    </strong>
                  </div>

                </div>

              </div>

              {/* FORMULA */}

              <div className="emi-calculator-equation">

                <div className="emi-calculator-equation-label">
                  📐 EMI Formula
                </div>

                <strong>
                  {result.equation}
                </strong>

                <small>
                  EMI = P × r × (1+r)ⁿ ÷ ((1+r)ⁿ−1)
                </small>

              </div>

              {/* NOTE */}

              <div className="emi-calculator-important">

                <strong>
                  {t("ℹ️ Calculation Note")}
                </strong>

                <p>
                  {t("calculation_notes.emi")}
                </p>

              </div>

              {/* ACTIONS */}

              <div className="emi-calculator-result-actions">

                <button
                  type="button"
                  className="emi-action-copy"
                  onClick={copyResult}
                >
                  📋 Copy
                </button>

                <button
                  type="button"
                  className="emi-action-pdf"
                  onClick={downloadPdf}
                >
                  📄 Download PDF
                </button>

                <button
                  type="button"
                  className="emi-action-share"
                  onClick={sharePdf}
                >
                  📤 Share PDF
                </button>

                <button
                  type="button"
                  className="emi-action-print"
                  onClick={printResult}
                >
                  🖨️ Print
                </button>

                <button
                  type="button"
                  className="emi-action-new"
                  onClick={reset}
                >
                  🔄 New
                </button>

              </div>

              {/* MESSAGES */}

              {actionMessage && (
                <div className="emi-calculator-action-message">
                  {actionMessage}
                </div>
              )}

              {pdfMessage && (
                <div className="emi-calculator-pdf-message">
                  {pdfMessage}
                </div>
              )}

              {/* FOOTER */}

              <div className="emi-calculator-result-footer">
        <ResultAttribution type="calculated" />
      </div>

            </div>

          )}

        </section>

      </div>

    </main>
  );
};

export default EmiCalculator;