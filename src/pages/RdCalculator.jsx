import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../styles/RdCalculator.css";

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
   CURRENCY
========================================================= */

const currency = (value) => `₹${formatNumber(value)}`;

/* =========================================================
   RD CALCULATOR
   Standard estimate:
   - Monthly recurring deposit
   - Annual interest rate
   - Quarterly compounding
========================================================= */

const RdCalculator = () => {
  const { t } = useTranslation();
  const [monthlyDeposit, setMonthlyDeposit] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [years, setYears] = useState("");

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [copied, setCopied] = useState(false);
  const [pdfMessage, setPdfMessage] = useState("");

  /* =======================================================
     CALCULATE RD
  ======================================================= */

  const calculateRd = () => {
    setError("");
    setCopied(false);
    setPdfMessage("");

    if (monthlyDeposit.trim() === "") {
      setError("Please enter your monthly RD deposit.");
      setResult(null);
      return;
    }

    if (annualRate.trim() === "") {
      setError("Please enter the expected annual interest rate.");
      setResult(null);
      return;
    }

    if (years.trim() === "") {
      setError("Please enter the RD investment period.");
      setResult(null);
      return;
    }

    const deposit = Number(monthlyDeposit);
    const rate = Number(annualRate);
    const investmentYears = Number(years);

    if (!Number.isFinite(deposit) || deposit <= 0) {
      setError("Please enter a valid monthly RD deposit.");
      setResult(null);
      return;
    }

    if (
      !Number.isFinite(rate) ||
      rate < 0 ||
      rate > 30
    ) {
      setError(
        "Please enter a valid annual interest rate between 0% and 30%."
      );
      setResult(null);
      return;
    }

    if (
      !Number.isFinite(investmentYears) ||
      investmentYears <= 0 ||
      investmentYears > 100
    ) {
      setError(
        "Please enter a valid investment period between 1 and 100 years."
      );
      setResult(null);
      return;
    }

    const totalMonths = Math.round(investmentYears * 12);

    /*
      RD interest is generally compounded quarterly.

      For a practical calculator estimate, each monthly
      installment is allowed to earn interest according
      to the completed quarterly periods remaining until
      maturity.
    */

    const quarterlyRate = rate / 400;

    let maturityValue = 0;
    let totalInvested = 0;

    const monthlyBreakdown = [];
    const yearlyBreakdown = [];

    for (let month = 1; month <= totalMonths; month++) {
      totalInvested += deposit;

      const remainingMonths = totalMonths - month;

      const completedQuarters =
        Math.floor(remainingMonths / 3);

      const installmentMaturity =
        deposit *
        Math.pow(
          1 + quarterlyRate,
          completedQuarters
        );

      maturityValue += installmentMaturity;

      monthlyBreakdown.push({
        month,
        deposit,
        cumulativeInvested: totalInvested,
        estimatedValue: maturityValue,
        estimatedReturns:
          maturityValue - totalInvested,
      });

      if (month % 12 === 0 || month === totalMonths) {
        const completedYears = Math.ceil(month / 12);

        const previousYear =
          yearlyBreakdown.length > 0
            ? yearlyBreakdown[
                yearlyBreakdown.length - 1
              ]
            : null;

        const previousCumulative =
          previousYear
            ? previousYear.cumulativeInvested
            : 0;

        yearlyBreakdown.push({
          year: completedYears,
          monthlyDeposit: deposit,
          invested:
            totalInvested -
            previousCumulative,
          cumulativeInvested: totalInvested,
          value: maturityValue,
          returns:
            maturityValue - totalInvested,
        });
      }
    }

    const estimatedReturns =
      maturityValue - totalInvested;

    const effectiveGrowth =
      totalInvested === 0
        ? 0
        : (estimatedReturns / totalInvested) * 100;

    const calculationText = t("rd.calculation_projection", {
      amount: currency(monthlyDeposit),
      years: formatNumber(investmentYears),
      rate: formatNumber(rate),
    });

    setResult({
      monthlyDeposit: deposit,
      annualRate: rate,
      years: investmentYears,
      totalMonths,
      totalInvested,
      estimatedReturns,
      maturityValue,
      effectiveGrowth,
      yearlyBreakdown,
      monthlyBreakdown,
      calculationText,
    });
  };

  /* =======================================================
     RESET
  ======================================================= */

  const reset = () => {
    setMonthlyDeposit("");
    setAnnualRate("");
    setYears("");

    setResult(null);
    setError("");
    setCopied(false);
    setPdfMessage("");
  };

  /* =======================================================
     RESULT TEXT
  ======================================================= */

  const resultText = useMemo(() => {
    if (!result) return "";

    return [
      "AgeVerse.Global",
      "RD Calculator",
      "",
      "Input Details",
      `Monthly RD Deposit: ${currency(
        result.monthlyDeposit
      )}`,
      `Expected Annual Interest Rate: ${formatNumber(
        result.annualRate
      )}%`,
      `Investment Period: ${formatNumber(
        result.years
      )} Years`,
      `Compounding: Quarterly`,
      "",
      "Investment Result",
      `Total Deposited: ${currency(
        result.totalInvested
      )}`,
      `Estimated Interest: ${currency(
        result.estimatedReturns
      )}`,
      `Maturity Value: ${currency(
        result.maturityValue
      )}`,
      "",
      `Calculation: ${result.calculationText}`,
    ].join("\n");
  }, [result]);

 /* =======================================================
   COPY RESULT AS IMAGE
   Robust clipboard + fallback download
======================================================= */

const copyResult = async () => {
  if (!result) return;

  setError("");
  setCopied(false);
  setPdfMessage("");

  try {
    const element = document.getElementById(
      "rd-result-export"
    );

    if (!element) {
      setError("Result element not found.");
      return;
    }

    /* -----------------------------------------------
       CREATE IMAGE
    ------------------------------------------------ */

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: false,
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    /* -----------------------------------------------
       CONVERT CANVAS TO PNG
    ------------------------------------------------ */

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (generatedBlob) => {
          if (generatedBlob) {
            resolve(generatedBlob);
          } else {
            reject(
              new Error("Canvas image creation failed.")
            );
          }
        },
        "image/png",
        1
      );
    });

    if (!blob) {
      throw new Error(
        "Unable to create result image."
      );
    }

    /* -----------------------------------------------
       TRY IMAGE CLIPBOARD
    ------------------------------------------------ */

    const canCopyImage =
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.write === "function" &&
      typeof window !== "undefined" &&
      typeof window.ClipboardItem !== "undefined";

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
        setPdfMessage("");

        window.setTimeout(() => {
          setCopied(false);
        }, 2500);

        return;
      } catch (clipboardError) {
        console.warn(
          "Image clipboard copy failed:",
          clipboardError
        );

        /*
          Clipboard permission/browser restriction.
          Continue to PNG download fallback.
        */
      }
    }

    /* -----------------------------------------------
       FALLBACK — DOWNLOAD RESULT IMAGE
    ------------------------------------------------ */

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download =
      "AgeVerse-RD-Result.png";

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);

    setCopied(true);

    setPdfMessage(
      "Image copied is not supported by this browser, so the result image was downloaded instead."
    );

    window.setTimeout(() => {
      setCopied(false);
    }, 2500);

  } catch (copyError) {
    console.error(
      "RD result image error:",
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
      "rd-result-export"
    );

    if (!element) {
      setPdfMessage(
        "Result element not found."
      );
      return null;
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      windowWidth: element.scrollWidth,
    });

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
        "AgeVerse-RD-Calculator-Result.pdf";

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
        "AgeVerse-RD-Calculator-Result.pdf",
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
            "AgeVerse.Global — RD Calculator",
          text:
            "RD Calculator Result",
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
    <main className="rd-calculator-page">

      <div className="rd-calculator-layout">

        {/* =================================================
            INPUT CARD
        ================================================= */}

        <section className="rd-calculator-card">

          <div className="rd-calculator-header">

            <div className="rd-calculator-icon">
              💰
            </div>

            <div>
              <h1>
                RD Calculator
              </h1>

              <p>
                Calculate your recurring deposit,
                estimated interest and maturity value.
              </p>
            </div>

          </div>

          {/* MONTHLY DEPOSIT */}

          <div className="rd-calculator-field">

            <label htmlFor="rdMonthlyDeposit">
              Monthly RD Deposit
            </label>

            <input
              id="rdMonthlyDeposit"
              type="number"
              inputMode="decimal"
              min="1"
              value={monthlyDeposit}
              placeholder={t("Currency Placeholder")}
              onChange={(event) =>
                setMonthlyDeposit(
                  event.target.value
                )
              }
            />

          </div>

          {/* INTEREST */}

          <div className="rd-calculator-field">

            <label htmlFor="rdAnnualRate">
              Expected Annual Interest Rate (%)
            </label>

            <input
              id="rdAnnualRate"
              type="number"
              inputMode="decimal"
              min="0"
              max="30"
              step="0.1"
              value={annualRate}
              placeholder={t("Percentage Placeholder")}
              onChange={(event) =>
                setAnnualRate(
                  event.target.value
                )
              }
            />

          </div>

          {/* YEARS */}

          <div className="rd-calculator-field">

            <label htmlFor="rdInvestmentYears">
              Investment Period (Years)
            </label>

            <input
              id="rdInvestmentYears"
              type="number"
              inputMode="decimal"
              min="1"
              max="100"
              step="1"
              value={years}
              placeholder={t("Year/Month")}
              onChange={(event) =>
                setYears(
                  event.target.value
                )
              }
            />

          </div>

          {/* COMPOUNDING INFO */}

          <div className="rd-compounding-section">

            <div className="rd-section-heading">
              🏦 Interest Compounding
            </div>

            <div className="rd-compounding-title">
              Quarterly Compounding
            </div>

            <div className="rd-compounding-description">
              RD maturity is estimated using quarterly
              compounding, commonly used for recurring
              deposit calculations.
            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div
              className="rd-calculator-error"
              role="alert"
            >
              ⚠️ {error}
            </div>
          )}

          {/* BUTTONS */}

          <div className="rd-calculator-buttons">

            <button
              type="button"
              className="rd-calculator-calculate"
              onClick={calculateRd}
            >
              🧮 Calculate
            </button>

            <button
              type="button"
              className="rd-calculator-reset"
              onClick={reset}
            >
              🔄 Reset
            </button>

          </div>

          {/* QUICK TIP */}

          <div className="rd-calculator-info">

            <div className="rd-calculator-info-title">
              💡 {t("Quick Tip")}
            </div>

            <p>{t("RD maturity is estimated using quarterly compounding, commonly used for recurring deposit calculations.")}</p>

          </div>

        </section>

        {/* =================================================
            RESULT SECTION
        ================================================= */}

        <section className="rd-calculator-result-section">

          {!result ? (

            <div className="rd-calculator-empty-result">

              <div className="rd-calculator-empty-icon">
                💰
              </div>

              <h2>
                Your Result Will Appear Here
              </h2>

              <p>
                Enter your monthly RD deposit,
                expected interest rate and investment
                period, then tap
                <strong> Calculate </strong>
                to see your complete RD projection.
              </p>

              <div className="rd-calculator-empty-points">
                <span>📊 Projection</span>
                <span>✓ Accurate</span>
                <span>💰 Maturity</span>
              </div>

            </div>

          ) : (

            <div
              className="rd-calculator-result-card"
              id="rd-result-export"
            >

              {/* RESULT HEADER */}

              <div className="rd-result-header">

                <div className="rd-result-icon">
                  ✓
                </div>

                <div>
                  <h2>
                    RD Calculation Result
                  </h2>

                  <p>
                    Recurring Deposit & Maturity Projection
                  </p>
                </div>

              </div>

              {/* INPUT DETAILS */}

              <div className="rd-input-summary">

                <div className="rd-section-heading">
                  🧾 Input Details
                </div>

                <div className="rd-input-summary-grid">

                  <div className="rd-summary-item">
                    <span>
                      Monthly RD Deposit
                    </span>

                    <strong>
                      {currency(
                        result.monthlyDeposit
                      )}
                    </strong>
                  </div>

                  <div className="rd-summary-item">
                    <span>
                      Annual Interest
                    </span>

                    <strong>
                      {formatNumber(
                        result.annualRate
                      )}%
                    </strong>
                  </div>

                  <div className="rd-summary-item">
                    <span>
                      Investment Period
                    </span>

                    <strong>
                      {formatNumber(
                        result.years
                      )} Years
                    </strong>
                  </div>

                  <div className="rd-summary-item">
                    <span>
                      Compounding
                    </span>

                    <strong>
                      Quarterly
                    </strong>
                  </div>

                </div>

              </div>

              {/* MAIN RESULT */}

              <div className="rd-main-result">

                <span>
                  Estimated Maturity Value
                </span>

                <strong>
                  {currency(
                    result.maturityValue
                  )}
                </strong>

                <small>
                  ✓ Estimated future value of your RD
                </small>

              </div>

              {/* THREE RESULT CARDS */}

              <div className="rd-result-metrics">

                <div className="rd-metric-card">

                  <span>
                    💵 Total Deposited
                  </span>

                  <strong>
                    {currency(
                      result.totalInvested
                    )}
                  </strong>

                </div>

                <div className="rd-metric-card">

                  <span>
                    📈 Estimated Interest
                  </span>

                  <strong>
                    {currency(
                      result.estimatedReturns
                    )}
                  </strong>

                </div>

                <div className="rd-metric-card">

                  <span>
                    📊 Interest Growth
                  </span>

                  <strong>
                    {formatNumber(
                      result.effectiveGrowth
                    )}%
                  </strong>

                </div>

              </div>

              {/* INVESTMENT FLOW */}

              <div className="rd-calculation-flow">

                <div className="rd-section-heading">
                  📊 Investment Flow
                </div>

                <div className="rd-flow-box">

                  <div className="rd-flow-item">

                    <span>
                      Total Deposited
                    </span>

                    <strong>
                      {currency(
                        result.totalInvested
                      )}
                    </strong>

                  </div>

                  <div className="rd-flow-plus">
                    +
                  </div>

                  <div className="rd-flow-item">

                    <span>
                      Estimated Interest
                    </span>

                    <strong>
                      {currency(
                        result.estimatedReturns
                      )}
                    </strong>

                  </div>

                  <div className="rd-flow-arrow">
                    →
                  </div>

                  <div className="rd-flow-result">

                    <span>
                      Maturity Value
                    </span>

                    <strong>
                      {currency(
                        result.maturityValue
                      )}
                    </strong>

                  </div>

                </div>

              </div>

              {/* YEARLY BREAKDOWN */}

              <div className="rd-breakdown">

                <div className="rd-section-heading">
                  📅 Year-Wise Projection
                </div>

                <div className="rd-table-wrapper">

                  <table className="rd-year-table">

                    <thead>

                      <tr>
                        <th>Year</th>
                        <th>Monthly RD</th>
                        <th>Invested</th>
                        <th>Total Deposited</th>
                        <th>Estimated Value</th>
                        <th>Interest</th>
                      </tr>

                    </thead>

                    <tbody>

                      {result.yearlyBreakdown.map(
                        (row) => (

                          <tr key={row.year}>

                            <td>
                              {row.year}
                            </td>

                            <td>
                              {currency(
                                row.monthlyDeposit
                              )}
                            </td>

                            <td>
                              {currency(
                                row.invested
                              )}
                            </td>

                            <td>
                              {currency(
                                row.cumulativeInvested
                              )}
                            </td>

                            <td>
                              {currency(
                                row.value
                              )}
                            </td>

                            <td>
                              {currency(
                                row.returns
                              )}
                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

              {/* CALCULATION */}

              <div className="rd-equation">

                <div>
                  📐 Calculation
                </div>

                <strong>
                  {result.calculationText}
                </strong>

              </div>

              {/* IMPORTANT NOTE */}

              <div className="rd-important">

                <strong>
                  {t("ℹ️ Calculation Note")}
                </strong>

                <p>
                  {t("calculation_notes.rd")}
                </p>

              </div>

              {/* ACTION BUTTONS */}

              <div className="rd-result-actions">

                <button
                  type="button"
                  onClick={copyResult}
                  className="rd-action-copy"
                >
                  📋 Copy Image
                </button>

                <button
                  type="button"
                  onClick={downloadPdf}
                  className="rd-action-pdf"
                >
                  📄 Download PDF
                </button>

                <button
                  type="button"
                  onClick={sharePdf}
                  className="rd-action-share"
                >
                  📤 Share PDF
                </button>

                <button
                  type="button"
                  onClick={printResult}
                  className="rd-action-print"
                >
                  🖨️ Print
                </button>

                <button
                  type="button"
                  onClick={reset}
                  className="rd-action-new"
                >
                  🔄 New
                </button>

              </div>

              {/* MESSAGES */}

              {copied && (
                <div className="rd-action-message">
                  ✓ Result image copied successfully.
                </div>
              )}

              {pdfMessage && (
                <div className="rd-pdf-message">
                  {pdfMessage}
                </div>
              )}

              {/* FOOTER */}

              <div className="rd-result-footer">
        <ResultAttribution type="generated" />
      </div>

            </div>

          )}

        </section>

      </div>

    </main>
  );
};

export default RdCalculator;