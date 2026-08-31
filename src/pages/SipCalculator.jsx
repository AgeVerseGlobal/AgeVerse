import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../styles/SipCalculator.css";

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
   SIP FREQUENCIES
========================================================= */

const SIP_FREQUENCIES = {
  weekly: {
    label: "Weekly",
    periodsPerYear: 52,
  },
  monthly: {
    label: "Monthly",
    periodsPerYear: 12,
  },
  quarterly: {
    label: "Quarterly",
    periodsPerYear: 4,
  },
  halfYearly: {
    label: "Half-Yearly",
    periodsPerYear: 2,
  },
  annual: {
    label: "Annual",
    periodsPerYear: 1,
  },
};

/* =========================================================
   SIP CALCULATOR
========================================================= */

const SipCalculator = () => {
  const { t } = useTranslation();
  const [sipAmount, setSipAmount] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [annualReturn, setAnnualReturn] = useState("");
  const [years, setYears] = useState("");

  const [stepUpEnabled, setStepUpEnabled] = useState(false);
  const [stepUpRate, setStepUpRate] = useState("10");

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [copied, setCopied] = useState(false);
  const [pdfMessage, setPdfMessage] = useState("");

  /* =======================================================
     CALCULATE SIP
  ======================================================= */

  const calculateSip = () => {
    setError("");
    setCopied(false);
    setPdfMessage("");

    if (sipAmount.trim() === "") {
      setError(
        `Please enter your ${SIP_FREQUENCIES[frequency].label.toLowerCase()} SIP amount.`
      );
      setResult(null);
      return;
    }

    if (annualReturn.trim() === "") {
      setError("Please enter the expected annual return.");
      setResult(null);
      return;
    }

    if (years.trim() === "") {
      setError("Please enter the investment period.");
      setResult(null);
      return;
    }

    const initialSip = Number(sipAmount);
    const returnRate = Number(annualReturn);
    const investmentYears = Number(years);
    const yearlyStepUp = Number(stepUpRate || 0);

    const frequencyData = SIP_FREQUENCIES[frequency];
    const periodsPerYear = frequencyData.periodsPerYear;

    if (!Number.isFinite(initialSip) || initialSip <= 0) {
      setError(
        `Please enter a valid ${frequencyData.label.toLowerCase()} SIP amount.`
      );
      setResult(null);
      return;
    }

    if (
      !Number.isFinite(returnRate) ||
      returnRate < 0 ||
      returnRate > 100
    ) {
      setError(
        "Please enter a valid expected return between 0% and 100%."
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

    if (
      stepUpEnabled &&
      (!Number.isFinite(yearlyStepUp) ||
        yearlyStepUp < 0 ||
        yearlyStepUp > 100)
    ) {
      setError(
        "Please enter a valid annual step-up rate between 0% and 100%."
      );
      setResult(null);
      return;
    }

    /* =====================================================
       PERIODIC RATE

       Annual return is converted to an equivalent periodic
       effective rate according to selected SIP frequency.
    ===================================================== */

    const periodicRate =
      Math.pow(
        1 + returnRate / 100,
        1 / periodsPerYear
      ) - 1;

    /* =====================================================
       TOTAL PERIODS
    ===================================================== */

    const totalPeriods = Math.round(
      investmentYears * periodsPerYear
    );

    let currentSip = initialSip;
    let totalInvested = 0;
    let portfolioValue = 0;

    const yearlyBreakdown = [];

    /* =====================================================
       YEAR-WISE CALCULATION
    ===================================================== */

    for (let period = 1; period <= totalPeriods; period++) {
      /*
        SIP is assumed at the beginning of each selected
        investment period.
      */

      totalInvested += currentSip;

      portfolioValue =
        (portfolioValue + currentSip) *
        (1 + periodicRate);

      /*
        At the end of every investment year, create
        a yearly projection.
      */

      const isYearEnd =
        period % periodsPerYear === 0 ||
        period === totalPeriods;

      if (isYearEnd) {
        const completedYears = Math.ceil(
          period / periodsPerYear
        );

        const previousCumulative =
          yearlyBreakdown.length > 0
            ? yearlyBreakdown[
                yearlyBreakdown.length - 1
              ].cumulativeInvested
            : 0;

        yearlyBreakdown.push({
          year: completedYears,
          sipAmount: currentSip,
          frequency: frequencyData.label,
          invested:
            totalInvested -
            previousCumulative,
          cumulativeInvested: totalInvested,
          value: portfolioValue,
          returns:
            portfolioValue - totalInvested,
        });

        /*
          Annual step-up is applied after completion of
          each investment year.
        */

        if (
          stepUpEnabled &&
          period < totalPeriods
        ) {
          currentSip =
            currentSip *
            (1 + yearlyStepUp / 100);
        }
      }
    }

    const estimatedReturns =
      portfolioValue - totalInvested;

    const effectiveGrowth =
      totalInvested === 0
        ? 0
        : (estimatedReturns / totalInvested) * 100;

    const finalSip =
      stepUpEnabled
        ? initialSip *
          Math.pow(
            1 + yearlyStepUp / 100,
            Math.max(
              0,
              Math.floor(investmentYears) - 1
            )
          )
        : initialSip;

    const calculationText = stepUpEnabled
      ? t("sip.calculation_projection_stepup", {
          frequency: t(frequencyData.label),
          amount: currency(initialSip),
          stepUp: formatNumber(yearlyStepUp),
          rate: formatNumber(returnRate),
        })
      : t("sip.calculation_projection", {
          frequency: t(frequencyData.label),
          amount: currency(initialSip),
          years: formatNumber(investmentYears),
          rate: formatNumber(returnRate),
        });

    setResult({
      sipAmount: initialSip,
      frequency,
      frequencyLabel: frequencyData.label,
      periodsPerYear,
      annualReturn: returnRate,
      years: investmentYears,
      stepUpEnabled,
      stepUpRate: yearlyStepUp,
      finalSip,
      totalInvested,
      estimatedReturns,
      maturityValue: portfolioValue,
      effectiveGrowth,
      yearlyBreakdown,
      calculationText,
    });
  };

  /* =======================================================
     RESET
  ======================================================= */

  const reset = () => {
    setSipAmount("");
    setFrequency("monthly");
    setAnnualReturn("");
    setYears("");

    setStepUpEnabled(false);
    setStepUpRate("10");

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
      "SIP Calculator",
      "",
      "Input Details",
      `SIP Amount: ${currency(result.sipAmount)}`,
      `Frequency: ${result.frequencyLabel}`,
      `Expected Annual Return: ${formatNumber(
        result.annualReturn
      )}%`,
      `Investment Period: ${formatNumber(
        result.years
      )} Years`,
      `Step-Up SIP: ${
        result.stepUpEnabled
          ? `${formatNumber(
              result.stepUpRate
            )}% yearly`
          : "No"
      }`,
      "",
      "Investment Result",
      `Total Invested: ${currency(
        result.totalInvested
      )}`,
      `Estimated Returns: ${currency(
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
  ======================================================= */

  const copyResult = async () => {
    if (!result) return;

    try {
      const element = document.getElementById(
        "sip-result-export"
      );

      if (!element) {
        setError("Result element not found.");
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth,
      });

      const blob = await new Promise((resolve) =>
        canvas.toBlob(
          resolve,
          "image/png",
          1
        )
      );

      if (!blob) {
        setError(
          "Unable to create result image."
        );
        return;
      }

      if (
        navigator.clipboard &&
        window.ClipboardItem
      ) {
        const item = new ClipboardItem({
          "image/png": blob,
        });

        await navigator.clipboard.write([
          item,
        ]);

        setCopied(true);
        setPdfMessage("");

        window.setTimeout(() => {
          setCopied(false);
        }, 2500);

        return;
      }

      const url =
        URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = url;
      anchor.download =
        "AgeVerse-SIP-Result.png";

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);

      setCopied(true);
    } catch (copyError) {
      console.error(copyError);

      setError(
        "Unable to copy result image. Please try again."
      );
    }
  };

  /* =======================================================
     CREATE PDF
  ======================================================= */

  const createPdfBlob = async () => {
    if (!result) return null;

    const element = document.getElementById(
      "sip-result-export"
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
      (pageWidth - imageWidth) /
      2;

    const y =
      (pageHeight - imageHeight) /
      2;

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
        "AgeVerse-SIP-Calculator-Result.pdf";

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
        "AgeVerse-SIP-Calculator-Result.pdf",
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
            "AgeVerse.Global — SIP Calculator",
          text:
            "SIP Calculator Result",
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
    <main className="sip-calculator-page">
      <div className="sip-calculator-layout">

        {/* =================================================
            INPUT CARD
        ================================================= */}

        <section className="sip-calculator-card">

          <div className="sip-calculator-header">

            <div className="sip-calculator-icon">
              📈
            </div>

            <div>
              <h1>
                SIP Calculator
              </h1>

              <p>
                Calculate your SIP investment,
                estimated returns and maturity value.
              </p>
            </div>

          </div>

          {/* SIP AMOUNT */}

          <div className="sip-calculator-field">

            <label htmlFor="sipAmount">
              SIP Investment Amount
            </label>

            <input
              id="sipAmount"
              type="number"
              inputMode="decimal"
              min="1"
              value={sipAmount}
              placeholder={t("Currency Placeholder")}
              onChange={(event) =>
                setSipAmount(
                  event.target.value
                )
              }
            />

          </div>

          {/* FREQUENCY */}

          <div className="sip-calculator-field">

            <label htmlFor="sipFrequency">
              SIP Frequency
            </label>

            <select
              id="sipFrequency"
              value={frequency}
              onChange={(event) =>
                setFrequency(
                  event.target.value
                )
              }
            >

              <option value="weekly">
                Weekly
              </option>

              <option value="monthly">
                Monthly
              </option>

              <option value="quarterly">
                Quarterly
              </option>

              <option value="halfYearly">
                Half-Yearly
              </option>

              <option value="annual">
                Annual
              </option>

            </select>

          </div>

          {/* RETURN */}

          <div className="sip-calculator-field">

            <label htmlFor="sipAnnualReturn">
              Expected Annual Return (%)
            </label>

            <input
              id="sipAnnualReturn"
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.1"
              value={annualReturn}
              placeholder={t("Percentage Placeholder")}
              onChange={(event) =>
                setAnnualReturn(
                  event.target.value
                )
              }
            />

          </div>

          {/* YEARS */}

          <div className="sip-calculator-field">

            <label htmlFor="sipInvestmentYears">
              Investment Period (Years)
            </label>

            <input
              id="sipInvestmentYears"
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

          {/* STEP UP */}

          <div className="sip-stepup-section">

            <div className="sip-stepup-header">

              <div>

                <div className="sip-section-heading">
                  {t("🚀 Annual SIP Step-Up")}
                </div>

                <div className="sip-stepup-description">
                  {t("Increase your SIP amount every year by a fixed percentage.")}
                </div>

              </div>

              <label className="sip-switch">

                <input
                  type="checkbox"
                  checked={stepUpEnabled}
                  onChange={(event) =>
                    setStepUpEnabled(
                      event.target.checked
                    )
                  }
                />

                <span className="sip-slider" />

              </label>

            </div>

            {stepUpEnabled && (
              <div className="sip-calculator-field">

                <label htmlFor="sipStepUpRate">
                  Annual Step-Up (%)
                </label>

                <input
                  id="sipStepUpRate"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="100"
                  step="0.1"
                  value={stepUpRate}
                  placeholder={t("Percentage Placeholder")}
                  onChange={(event) =>
                    setStepUpRate(
                      event.target.value
                    )
                  }
                />

              </div>
            )}

            <div className="sip-helper">
              {t("Example: ₹5,000 Monthly SIP with a 10% yearly step-up becomes ₹5,500 in the second year, ₹6,050 in the third year, and so on.")}
            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div
              className="sip-calculator-error"
              role="alert"
            >
              ⚠️ {error}
            </div>
          )}

          {/* BUTTONS */}

          <div className="sip-calculator-buttons">

            <button
              type="button"
              className="sip-calculator-calculate"
              onClick={calculateSip}
            >
              🧮 Calculate
            </button>

            <button
              type="button"
              className="sip-calculator-reset"
              onClick={reset}
            >
              🔄 Reset
            </button>

          </div>

          {/* QUICK TIP */}

          <div className="sip-calculator-info">

            <div className="sip-calculator-info-title">
              💡 {t("Quick Tip")}
            </div>

            <p>{t("Increase your SIP amount every year by a fixed percentage.")}</p>

          </div>

        </section>

        {/* =================================================
            RESULT SECTION
        ================================================= */}

        <section className="sip-calculator-result-section">

          {!result ? (

            <div className="sip-calculator-empty-result">

              <div className="sip-calculator-empty-icon">
                📈
              </div>

              <h2>
                Your Result Will Appear Here
              </h2>

              <p>
                Enter your SIP amount, frequency,
                expected return and investment period,
                then tap
                <strong> Calculate </strong>
                to see your complete SIP projection.
              </p>

              <div className="sip-calculator-empty-points">
                <span>📊 Projection</span>
                <span>✓ Accurate</span>
                <span>💰 Growth</span>
              </div>

            </div>

          ) : (

            <div
              className="sip-calculator-result-card"
              id="sip-result-export"
            >

              {/* RESULT HEADER */}

              <div className="sip-result-header">

                <div className="sip-result-icon">
                  ✓
                </div>

                <div>
                  <h2>
                    SIP Calculation Result
                  </h2>

                  <p>
                    Investment & Wealth Projection
                  </p>
                </div>

              </div>

              {/* INPUT DETAILS */}

              <div className="sip-input-summary">

                <div className="sip-section-heading">
                  🧾 Input Details
                </div>

                <div className="sip-input-summary-grid">

                  <div className="sip-summary-item">
                    <span>
                      SIP Amount
                    </span>

                    <strong>
                      {currency(
                        result.sipAmount
                      )}
                    </strong>
                  </div>

                  <div className="sip-summary-item">
                    <span>
                      Frequency
                    </span>

                    <strong>
                      {result.frequencyLabel}
                    </strong>
                  </div>

                  <div className="sip-summary-item">
                    <span>
                      Expected Return
                    </span>

                    <strong>
                      {formatNumber(
                        result.annualReturn
                      )}%
                    </strong>
                  </div>

                  <div className="sip-summary-item">
                    <span>
                      Investment Period
                    </span>

                    <strong>
                      {formatNumber(
                        result.years
                      )} Years
                    </strong>
                  </div>

                  <div className="sip-summary-item">
                    <span>
                      Step-Up
                    </span>

                    <strong>
                      {result.stepUpEnabled
                        ? `${formatNumber(
                            result.stepUpRate
                          )}% / Year`
                        : "No"}
                    </strong>
                  </div>

                </div>

              </div>

              {/* MAIN RESULT */}

              <div className="sip-main-result">

                <span>
                  Estimated Maturity Value
                </span>

                <strong>
                  {currency(
                    result.maturityValue
                  )}
                </strong>

                <small>
                  ✓ Estimated future value of your SIP
                </small>

              </div>

              {/* THREE RESULT CARDS */}

              <div className="sip-result-metrics">

                <div className="sip-metric-card">

                  <span>
                    💵 Total Invested
                  </span>

                  <strong>
                    {currency(
                      result.totalInvested
                    )}
                  </strong>

                </div>

                <div className="sip-metric-card">

                  <span>
                    📈 Estimated Returns
                  </span>

                  <strong>
                    {currency(
                      result.estimatedReturns
                    )}
                  </strong>

                </div>

                <div className="sip-metric-card">

                  <span>
                    📊 Growth
                  </span>

                  <strong>
                    {formatNumber(
                      result.effectiveGrowth
                    )}%
                  </strong>

                </div>

              </div>

              {/* INVESTMENT FLOW */}

              <div className="sip-calculation-flow">

                <div className="sip-section-heading">
                  📊 Investment Flow
                </div>

                <div className="sip-flow-box">

                  <div className="sip-flow-item">

                    <span>
                      Invested
                    </span>

                    <strong>
                      {currency(
                        result.totalInvested
                      )}
                    </strong>

                  </div>

                  <div className="sip-flow-plus">
                    +
                  </div>

                  <div className="sip-flow-item">

                    <span>
                      Estimated Returns
                    </span>

                    <strong>
                      {currency(
                        result.estimatedReturns
                      )}
                    </strong>

                  </div>

                  <div className="sip-flow-arrow">
                    →
                  </div>

                  <div className="sip-flow-result">

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

              <div className="sip-breakdown">

                <div className="sip-section-heading">
                  📅 Year-Wise Projection
                </div>

                <div className="sip-table-wrapper">

                  <table className="sip-year-table">

                    <thead>

                      <tr>

                        <th>
                          Year
                        </th>

                        <th>
                          SIP Amount
                        </th>

                        <th>
                          Frequency
                        </th>

                        <th>
                          Invested
                        </th>

                        <th>
                          Total Invested
                        </th>

                        <th>
                          Estimated Value
                        </th>

                        <th>
                          Returns
                        </th>

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
                                row.sipAmount
                              )}
                            </td>

                            <td>
                              {row.frequency}
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

              {/* FORMULA */}

              <div className="sip-equation">

                <div>
                  📐 Calculation
                </div>

                <strong>
                  {result.calculationText}
                </strong>

              </div>

              {/* IMPORTANT NOTE */}

              <div className="sip-important">

                <strong>
                  {t("ℹ️ Calculation Note")}
                </strong>

                <p>{t("SIP returns are market-linked and the calculated maturity value is an estimate based on the expected annual return entered.")}</p>

              </div>

              {/* ACTION BUTTONS */}

              <div className="sip-result-actions">

                <button
                  type="button"
                  onClick={copyResult}
                  className="sip-action-copy"
                >
                  📋 Copy Image
                </button>

                <button
                  type="button"
                  onClick={downloadPdf}
                  className="sip-action-pdf"
                >
                  📄 Download PDF
                </button>

                <button
                  type="button"
                  onClick={sharePdf}
                  className="sip-action-share"
                >
                  📤 Share PDF
                </button>

                <button
                  type="button"
                  onClick={printResult}
                  className="sip-action-print"
                >
                  🖨️ Print
                </button>

                <button
                  type="button"
                  onClick={reset}
                  className="sip-action-new"
                >
                  🔄 New
                </button>

              </div>

              {/* MESSAGES */}

              {copied && (
                <div className="sip-action-message">
                  ✓ Result image copied successfully.
                </div>
              )}

              {pdfMessage && (
                <div className="sip-pdf-message">
                  {pdfMessage}
                </div>
              )}

              {/* FOOTER */}

              <div className="sip-result-footer">
        <ResultAttribution type="generated" />
      </div>

            </div>

          )}

        </section>

      </div>
    </main>
  );
};

export default SipCalculator;