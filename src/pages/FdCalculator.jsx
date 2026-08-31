import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../styles/FdCalculator.css";

import ResultAttribution from "../components/ResultAttribution";
const formatNumber = (value) =>
  Number.isFinite(value)
    ? new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value)
    : "—";

const currency = (value) => `₹${formatNumber(value)}`;

const FREQUENCIES = {
  monthly: { label: "Monthly", periods: 12 },
  quarterly: { label: "Quarterly", periods: 4 },
  halfYearly: { label: "Half-Yearly", periods: 2 },
  annual: { label: "Annual", periods: 1 },
};

const FdCalculator = () => {
  const { t } = useTranslation();
  const [depositAmount, setDepositAmount] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [tenureYears, setTenureYears] = useState("");
  const [frequency, setFrequency] = useState("quarterly");

  const [seniorCitizen, setSeniorCitizen] = useState(false);
  const [seniorBonus, setSeniorBonus] = useState("0.50");

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [pdfMessage, setPdfMessage] = useState("");

  const calculateFd = () => {
    setError("");
    setCopied(false);
    setPdfMessage("");

    if (!depositAmount.trim())
      return setError("Please enter your deposit amount.") || setResult(null);
    if (!annualRate.trim())
      return setError("Please enter the annual interest rate.") || setResult(null);
    if (!tenureYears.trim())
      return setError("Please enter the investment period.") || setResult(null);

    const principal = Number(depositAmount);
    const baseRate = Number(annualRate);
    const tenure = Number(tenureYears);
    const bonus = Number(seniorBonus || 0);

    if (!Number.isFinite(principal) || principal <= 0) {
      setError("Please enter a valid deposit amount greater than ₹0.");
      setResult(null);
      return;
    }
    if (!Number.isFinite(baseRate) || baseRate < 0 || baseRate > 100) {
      setError("Please enter a valid annual interest rate between 0% and 100%.");
      setResult(null);
      return;
    }
    if (!Number.isFinite(tenure) || tenure <= 0 || tenure > 100) {
      setError("Please enter a valid investment period between 0.01 and 100 years.");
      setResult(null);
      return;
    }
    if (seniorCitizen && (!Number.isFinite(bonus) || bonus < 0 || bonus > 20)) {
      setError("Please enter a valid senior citizen additional rate between 0% and 20%.");
      setResult(null);
      return;
    }

    const frequencyInfo = FREQUENCIES[frequency];
    const n = frequencyInfo.periods;
    const effectiveRate = baseRate + (seniorCitizen ? bonus : 0);
    const periodicRate = effectiveRate / 100 / n;

    // Standard compound-interest projection:
    // A = P(1 + r/n)^(nt)
    const maturityValue =
      principal * Math.pow(1 + periodicRate, n * tenure);

    const estimatedInterest = maturityValue - principal;
    const growth = (estimatedInterest / principal) * 100;

    const yearlyBreakdown = [];
    const completedYears = Math.floor(tenure);

    for (let year = 1; year <= completedYears; year++) {
      const opening =
        principal * Math.pow(1 + periodicRate, n * (year - 1));
      const value =
        principal * Math.pow(1 + periodicRate, n * year);

      yearlyBreakdown.push({
        label: `Year ${year}`,
        opening,
        interest: value - opening,
        cumulativeInterest: value - principal,
        value,
      });
    }

    if (tenure > completedYears) {
      const opening =
        principal * Math.pow(1 + periodicRate, n * completedYears);

      yearlyBreakdown.push({
        label: `Final ${formatNumber(tenure - completedYears)} Year`,
        opening,
        interest: maturityValue - opening,
        cumulativeInterest: estimatedInterest,
        value: maturityValue,
      });
    }

    setResult({
      depositAmount: principal,
      annualRate: baseRate,
      tenureYears: tenure,
      frequency,
      frequencyLabel: frequencyInfo.label,
      seniorCitizen,
      seniorBonus: seniorCitizen ? bonus : 0,
      effectiveRate,
      maturityValue,
      estimatedInterest,
      growth,
      yearlyBreakdown,
      calculationText: t("fd.calculation_projection", {
        frequency: t(frequencyInfo.label),
        rate: formatNumber(effectiveRate),
        years: formatNumber(tenure),
      }),
    });
  };

  const reset = () => {
    setDepositAmount("");
    setAnnualRate("");
    setTenureYears("");
    setFrequency("quarterly");
    setSeniorCitizen(false);
    setSeniorBonus("0.50");
    setResult(null);
    setError("");
    setCopied(false);
    setPdfMessage("");
  };

  const resultText = useMemo(() => {
    if (!result) return "";
    return [
      "AgeVerse.Global",
      "FD Calculator",
      "",
      "Input Details",
      `Deposit Amount: ${currency(result.depositAmount)}`,
      `Annual Interest Rate: ${formatNumber(result.annualRate)}%`,
      `Investment Period: ${formatNumber(result.tenureYears)} Years`,
      `Compounding Frequency: ${result.frequencyLabel}`,
      `Senior Citizen: ${result.seniorCitizen ? `Yes (+${formatNumber(result.seniorBonus)}%)` : "No"}`,
      "",
      "Investment Result",
      `Principal Deposit: ${currency(result.depositAmount)}`,
      `Estimated Interest: ${currency(result.estimatedInterest)}`,
      `Maturity Value: ${currency(result.maturityValue)}`,
      "",
      `Calculation: ${result.calculationText}`,
    ].join("\n");
  }, [result]);

  const copyResult = async () => {
    if (!result) return;
    try {
      const element = document.getElementById("fd-result-export");
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
        canvas.toBlob(resolve, "image/png", 1)
      );

      if (!blob) {
        setError("Unable to create result image.");
        return;
      }

      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setPdfMessage("");
        window.setTimeout(() => setCopied(false), 2500);
        return;
      }

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "AgeVerse-FD-Result.png";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setCopied(true);
    } catch (copyError) {
      console.error(copyError);
      setError("Unable to copy result image. Please try again.");
    }
  };

  const createPdfBlob = async () => {
    if (!result) return null;

    const element = document.getElementById("fd-result-export");
    if (!element) {
      setPdfMessage("Result element not found.");
      return null;
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      windowWidth: element.scrollWidth,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const imageData = canvas.toDataURL("image/jpeg", 0.95);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 8;
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;
    const ratio = canvas.width / canvas.height;

    let imageWidth = availableWidth;
    let imageHeight = imageWidth / ratio;

    if (imageHeight > availableHeight) {
      imageHeight = availableHeight;
      imageWidth = imageHeight * ratio;
    }

    pdf.addImage(
      imageData,
      "JPEG",
      (pageWidth - imageWidth) / 2,
      (pageHeight - imageHeight) / 2,
      imageWidth,
      imageHeight,
      undefined,
      "FAST"
    );

    return pdf.output("blob");
  };

  const downloadPdf = async () => {
    if (!result) return;
    try {
      setPdfMessage("Preparing PDF...");
      const blob = await createPdfBlob();
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "AgeVerse-FD-Calculator-Result.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setPdfMessage("PDF downloaded successfully.");
    } catch (pdfError) {
      console.error(pdfError);
      setPdfMessage("Unable to download PDF.");
    }
  };

  const sharePdf = async () => {
    if (!result) return;
    try {
      setPdfMessage("Preparing PDF...");
      const blob = await createPdfBlob();
      if (!blob) return;

      const file = new File(
        [blob],
        "AgeVerse-FD-Calculator-Result.pdf",
        { type: "application/pdf" }
      );

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: "AgeVerse.Global — FD Calculator",
          text: "FD Calculator Result",
          files: [file],
        });
        setPdfMessage("");
        return;
      }

      setPdfMessage("PDF sharing is not supported on this device.");
    } catch (shareError) {
      console.error(shareError);
      if (shareError?.name === "AbortError") {
        setPdfMessage("");
        return;
      }
      setPdfMessage("Unable to share PDF.");
    }
  };

  const printResult = () => {
    if (result) window.print();
  };

  return (
    <main className="fd-calculator-page">
      <div className="fd-calculator-layout">

        <section className="fd-calculator-card">
          <div className="fd-calculator-header">
            <div className="fd-calculator-icon">🏦</div>
            <div>
              <h1>FD Calculator</h1>
              <p>
                Calculate fixed deposit maturity, estimated interest
                and total value.
              </p>
            </div>
          </div>

          <div className="fd-calculator-field">
            <label htmlFor="fdDepositAmount">Deposit Amount</label>
            <input
              id="fdDepositAmount"
              type="number"
              inputMode="decimal"
              min="1"
              value={depositAmount}
              placeholder={t("Currency Placeholder")}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
          </div>

          <div className="fd-calculator-field">
            <label htmlFor="fdAnnualRate">Annual Interest Rate (%)</label>
            <input
              id="fdAnnualRate"
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.1"
              value={annualRate}
              placeholder={t("Percentage Placeholder")}
              onChange={(e) => setAnnualRate(e.target.value)}
            />
          </div>

          <div className="fd-calculator-field">
            <label htmlFor="fdTenureYears">Investment Period (Years)</label>
            <input
              id="fdTenureYears"
              type="number"
              inputMode="decimal"
              min="0.01"
              max="100"
              step="0.01"
              value={tenureYears}
              placeholder={t("Year/Month")}
              onChange={(e) => setTenureYears(e.target.value)}
            />
          </div>

          <div className="fd-calculator-field">
            <label htmlFor="fdFrequency">Compounding Frequency</label>
            <select
              id="fdFrequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="halfYearly">Half-Yearly</option>
              <option value="annual">Annual</option>
            </select>
          </div>

          <div className="fd-senior-section">
            <div className="fd-senior-header">
              <div>
                <div className="fd-section-heading">
                  👵 Senior Citizen Rate
                </div>
                <div className="fd-senior-description">
                  Optional additional rate for senior-citizen projection.
                </div>
              </div>

              <label className="fd-switch">
                <input
                  type="checkbox"
                  checked={seniorCitizen}
                  onChange={(e) => setSeniorCitizen(e.target.checked)}
                />
                <span className="fd-slider" />
              </label>
            </div>

            {seniorCitizen && (
              <div className="fd-calculator-field">
                <label htmlFor="fdSeniorBonus">
                  Additional Senior Citizen Rate (%)
                </label>
                <input
                  id="fdSeniorBonus"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="20"
                  step="0.1"
                  value={seniorBonus}
                  placeholder={t("Percentage Placeholder")}
                  onChange={(e) => setSeniorBonus(e.target.value)}
                />
              </div>
            )}

            <div className="fd-helper">
              Example: 7.50% base rate + 0.50% additional rate = 8.00%
              projected effective rate.
            </div>
          </div>

          {error && (
            <div className="fd-calculator-error" role="alert">
              ⚠️ {error}
            </div>
          )}

          <div className="fd-calculator-buttons">
            <button
              type="button"
              className="fd-calculator-calculate"
              onClick={calculateFd}
            >
              🧮 Calculate
            </button>
            <button
              type="button"
              className="fd-calculator-reset"
              onClick={reset}
            >
              🔄 Reset
            </button>
          </div>

          <div className="fd-calculator-info">
            <div className="fd-calculator-info-title">💡 Quick Tip</div>
            <p>
              FD maturity depends on deposit amount, interest rate,
              tenure and compounding frequency. Actual bank returns
              may differ according to the bank's applicable rules.
            </p>
          </div>
        </section>

        <section className="fd-calculator-result-section">
          {!result ? (
            <div className="fd-calculator-empty-result">
              <div className="fd-calculator-empty-icon">🏦</div>
              <h2>Your Result Will Appear Here</h2>
              <p>
                Enter your deposit amount, expected rate, investment
                period and compounding frequency, then tap
                <strong> Calculate </strong> to see your complete FD projection.
              </p>
              <div className="fd-calculator-empty-points">
                <span>💰 Maturity</span>
                <span>📊 Interest</span>
                <span>🏦 FD Growth</span>
              </div>
            </div>
          ) : (
            <div
              className="fd-calculator-result-card"
              id="fd-result-export"
            >
              <div className="fd-result-header">
                <div className="fd-result-icon">✓</div>
                <div>
                  <h2>FD Calculation Result</h2>
                  <p>Fixed Deposit Maturity & Interest Projection</p>
                </div>
              </div>

              <div className="fd-input-summary">
                <div className="fd-section-heading">🧾 Input Details</div>

                <div className="fd-input-summary-grid">
                  <div className="fd-summary-item">
                    <span>Deposit Amount</span>
                    <strong>{currency(result.depositAmount)}</strong>
                  </div>
                  <div className="fd-summary-item">
                    <span>Annual Rate</span>
                    <strong>{formatNumber(result.annualRate)}%</strong>
                  </div>
                  <div className="fd-summary-item">
                    <span>Investment Period</span>
                    <strong>{formatNumber(result.tenureYears)} Years</strong>
                  </div>
                  <div className="fd-summary-item">
                    <span>Compounding</span>
                    <strong>{result.frequencyLabel}</strong>
                  </div>
                  <div className="fd-summary-item">
                    <span>Senior Citizen</span>
                    <strong>
                      {result.seniorCitizen
                        ? `Yes (+${formatNumber(result.seniorBonus)}%)`
                        : "No"}
                    </strong>
                  </div>
                  <div className="fd-summary-item">
                    <span>Effective Rate</span>
                    <strong>{formatNumber(result.effectiveRate)}%</strong>
                  </div>
                </div>
              </div>

              <div className="fd-main-result">
                <span>Estimated Maturity Value</span>
                <strong>{currency(result.maturityValue)}</strong>
                <small>
                  ✓ Estimated value at the end of the selected tenure
                </small>
              </div>

              <div className="fd-result-metrics">
                <div className="fd-metric-card">
                  <span>💵 Principal Deposit</span>
                  <strong>{currency(result.depositAmount)}</strong>
                </div>
                <div className="fd-metric-card">
                  <span>📈 Estimated Interest</span>
                  <strong>{currency(result.estimatedInterest)}</strong>
                </div>
                <div className="fd-metric-card">
                  <span>📊 Growth</span>
                  <strong>{formatNumber(result.growth)}%</strong>
                </div>
              </div>

              <div className="fd-calculation-flow">
                <div className="fd-section-heading">📊 Investment Flow</div>

                <div className="fd-flow-box">
                  <div className="fd-flow-item">
                    <span>Principal</span>
                    <strong>{currency(result.depositAmount)}</strong>
                  </div>
                  <div className="fd-flow-plus">+</div>
                  <div className="fd-flow-item">
                    <span>Estimated Interest</span>
                    <strong>{currency(result.estimatedInterest)}</strong>
                  </div>
                  <div className="fd-flow-arrow">→</div>
                  <div className="fd-flow-result">
                    <span>Maturity Value</span>
                    <strong>{currency(result.maturityValue)}</strong>
                  </div>
                </div>
              </div>

              <div className="fd-breakdown">
                <div className="fd-section-heading">📅 Year-Wise Projection</div>

                <div className="fd-table-wrapper">
                  <table className="fd-year-table">
                    <thead>
                      <tr>
                        <th>Period</th>
                        <th>Opening Value</th>
                        <th>Interest</th>
                        <th>Cumulative Interest</th>
                        <th>Estimated Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.yearlyBreakdown.map((row, index) => (
                        <tr key={`${row.label}-${index}`}>
                          <td>{row.label}</td>
                          <td>{currency(row.opening)}</td>
                          <td>{currency(row.interest)}</td>
                          <td>{currency(row.cumulativeInterest)}</td>
                          <td>{currency(row.value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="fd-equation">
                <div>📐 Calculation</div>
                <strong>{result.calculationText}</strong>
                <span>
                  {t("Standard compound-interest model: A = P(1 + r/n)^(n×t)")}
                </span>
              </div>

              <div className="fd-important">
                <strong>{t("ℹ️ Calculation Note")}</strong>
                <p>
                  {t("calculation_notes.fd")}
                </p>
              </div>

              <div className="fd-result-actions">
                <button
                  type="button"
                  onClick={copyResult}
                  className="fd-action-copy"
                >
                  📋 Copy Image
                </button>
                <button
                  type="button"
                  onClick={downloadPdf}
                  className="fd-action-pdf"
                >
                  📄 Download PDF
                </button>
                <button
                  type="button"
                  onClick={sharePdf}
                  className="fd-action-share"
                >
                  📤 Share PDF
                </button>
                <button
                  type="button"
                  onClick={printResult}
                  className="fd-action-print"
                >
                  🖨️ Print
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="fd-action-new"
                >
                  🔄 New
                </button>
              </div>

              {copied && (
                <div className="fd-action-message">
                  ✓ Result image copied successfully.
                </div>
              )}

              {pdfMessage && (
                <div className="fd-pdf-message">{pdfMessage}</div>
              )}

              <div className="fd-result-footer">
                <ResultAttribution type="generated" />
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default FdCalculator;