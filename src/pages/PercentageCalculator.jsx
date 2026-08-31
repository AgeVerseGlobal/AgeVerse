import React, { useMemo, useRef, useState } from "react";
import "../styles/PercentageCalculator.css";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import ResultAttribution from "../components/ResultAttribution";
/* =========================================================
   NUMBER FORMATTER
========================================================= */

const formatNumber = (value) => {
  if (!Number.isFinite(value)) return "—";

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 8,
  }).format(value);
};


/* =========================================================
   PERCENTAGE CALCULATOR
========================================================= */

const PercentageCalculator = () => {

  const [mode, setMode] = useState("percentageOf");

  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [copied, setCopied] = useState(false);
  const [pdfMessage, setPdfMessage] = useState("");

  /* PDF / PRINT TARGET */
  const resultCardRef = useRef(null);


  /* =======================================================
     CALCULATION MODES
  ======================================================= */

  const modes = useMemo(
    () => [
      {
        id: "percentageOf",
        title: "Percentage of a Number",
        description: "Calculate a percentage of a given number.",
        firstLabel: "Percentage",
        secondLabel: "Number",
        firstPlaceholder: "e.g. 25",
        secondPlaceholder: "e.g. 800",
      },

      {
        id: "whatPercentage",
        title: "What Percentage?",
        description: "Find what percentage one number is of another.",
        firstLabel: "Part",
        secondLabel: "Total",
        firstPlaceholder: "e.g. 200",
        secondPlaceholder: "e.g. 800",
      },

      {
        id: "increase",
        title: "Percentage Increase",
        description: "Calculate the percentage increase between two values.",
        firstLabel: "Original Value",
        secondLabel: "New Value",
        firstPlaceholder: "e.g. 500",
        secondPlaceholder: "e.g. 650",
      },

      {
        id: "decrease",
        title: "Percentage Decrease",
        description: "Calculate the percentage decrease between two values.",
        firstLabel: "Original Value",
        secondLabel: "New Value",
        firstPlaceholder: "e.g. 800",
        secondPlaceholder: "e.g. 600",
      },

      {
        id: "percentageDifference",
        title: "Percentage Difference",
        description: "Find the percentage difference between two values.",
        firstLabel: "First Value",
        secondLabel: "Second Value",
        firstPlaceholder: "e.g. 80",
        secondPlaceholder: "e.g. 100",
      },

      {
        id: "originalValue",
        title: "Find Original Value",
        description: "Find the original value after a percentage change.",
        firstLabel: "Final Value",
        secondLabel: "Percentage Change",
        firstPlaceholder: "e.g. 1200",
        secondPlaceholder: "e.g. 20",
      },
    ],
    []
  );


  const activeMode = modes.find((item) => item.id === mode);


  /* =======================================================
     RESULT TYPE
  ======================================================= */

  const isPercentageResult =
    mode === "percentageOf" ||
    mode === "whatPercentage" ||
    mode === "increase" ||
    mode === "decrease" ||
    mode === "percentageDifference";


  /* =======================================================
     CALCULATE
  ======================================================= */

  const calculate = () => {

    setError("");
    setCopied(false);
    setPdfMessage("");

    const a = Number(first);
    const b = Number(second);


    if (first.trim() === "" || second.trim() === "") {

      setError("Please enter both values.");
      setResult(null);

      return;
    }


    if (!Number.isFinite(a) || !Number.isFinite(b)) {

      setError("Please enter valid numbers.");
      setResult(null);

      return;
    }


    let value;
    let equation;
    let resultLabel;


    switch (mode) {

      case "percentageOf":

        value = (a / 100) * b;

        equation =
          `${formatNumber(a)}% × ${formatNumber(b)} = ${formatNumber(value)}`;

        resultLabel =
          `${formatNumber(a)}% of ${formatNumber(b)}`;

        break;


      case "whatPercentage":

        if (b === 0) {

          setError("Total value cannot be zero.");
          setResult(null);

          return;
        }

        value = (a / b) * 100;

        equation =
          `${formatNumber(a)} ÷ ${formatNumber(b)} × 100 = ${formatNumber(value)}%`;

        resultLabel =
          `${formatNumber(a)} is what percentage of ${formatNumber(b)}?`;

        break;


      case "increase":

        if (a === 0) {

          setError("Original value cannot be zero.");
          setResult(null);

          return;
        }

        value =
          ((b - a) / Math.abs(a)) * 100;

        equation =
          `(${formatNumber(b)} − ${formatNumber(a)}) ÷ ${formatNumber(a)} × 100 = ${formatNumber(value)}%`;

        resultLabel =
          "Percentage Increase";

        break;


      case "decrease":

        if (a === 0) {

          setError("Original value cannot be zero.");
          setResult(null);

          return;
        }

        value =
          ((a - b) / Math.abs(a)) * 100;

        equation =
          `(${formatNumber(a)} − ${formatNumber(b)}) ÷ ${formatNumber(a)} × 100 = ${formatNumber(value)}%`;

        resultLabel =
          "Percentage Decrease";

        break;


      case "percentageDifference": {

        if (a === 0 && b === 0) {

          setError("Both values cannot be zero.");
          setResult(null);

          return;
        }

        const average =
          (Math.abs(a) + Math.abs(b)) / 2;

        if (average === 0) {

          setError(
            "These values cannot be used for percentage difference."
          );

          setResult(null);

          return;
        }

        value =
          (Math.abs(a - b) / average) * 100;

        equation =
          `|${formatNumber(a)} − ${formatNumber(b)}| ÷ ((|${formatNumber(a)}| + |${formatNumber(b)}|) ÷ 2) × 100 = ${formatNumber(value)}%`;

        resultLabel =
          "Percentage Difference";

        break;
      }


      case "originalValue":

        if (a === 0) {

          setError("Final value cannot be zero.");
          setResult(null);

          return;
        }

        if (b <= -100) {

          setError(
            "Percentage change must be greater than -100%."
          );

          setResult(null);

          return;
        }

        value =
          a / (1 + b / 100);

        equation =
          `${formatNumber(a)} ÷ (1 + ${formatNumber(b)}% ÷ 100) = ${formatNumber(value)}`;

        resultLabel =
          "Original Value";

        break;


      default:
        return;
    }


    setResult({
      value,
      equation,
      label: resultLabel,
    });
  };


  /* =======================================================
     RESET
  ======================================================= */

  const reset = () => {

    setFirst("");
    setSecond("");

    setResult(null);

    setError("");
    setCopied(false);
    setPdfMessage("");
  };


  /* =======================================================
     CHANGE MODE
  ======================================================= */

  const changeMode = (newMode) => {

    setMode(newMode);

    setFirst("");
    setSecond("");

    setResult(null);

    setError("");
    setCopied(false);
    setPdfMessage("");
  };


  /* =======================================================
     RESULT TEXT
  ======================================================= */

  const resultText = result
    ? [
        "AgeVerse.Global",
        "Percentage Calculator",
        "",
        activeMode.title,
        "",
        `First Input: ${activeMode.firstLabel} = ${formatNumber(Number(first))}`,
        `Second Input: ${activeMode.secondLabel} = ${formatNumber(Number(second))}`,
        "",
        `${result.label}: ${formatNumber(result.value)}${isPercentageResult ? "%" : ""}`,
        "",
        `Formula: ${result.equation}`,
      ].join("\n")
    : "";


  /* =======================================================
     COPY
  ======================================================= */

  const copyResult = async () => {

    if (!result) return;

    try {

      await navigator.clipboard.writeText(resultText);

      setCopied(true);
      setPdfMessage("");

      window.setTimeout(() => {
        setCopied(false);
      }, 2200);

    } catch {

      setError("Unable to copy the result.");

    }
  };


  /* =======================================================
     CREATE VISUAL PDF
     
     IMPORTANT:
     PDF is generated from the ACTUAL RESULT CARD.
     Therefore Download PDF and Share PDF have the
     same visual appearance as the result shown on screen.
  ======================================================= */

  const createVisualPdf = async () => {

    if (!result || !resultCardRef.current) {
      return null;
    }


    const element = resultCardRef.current;


    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,

      /* Prevent dark-mode colours from entering PDF */
      onclone: (clonedDocument) => {

        const clonedElement =
          clonedDocument.querySelector(
            ".percentage-calculator-result-card"
          );

        if (clonedElement) {

          clonedElement.style.background =
            "#ffffff";

          clonedElement.style.color =
            "#111827";

          clonedElement.style.boxShadow =
            "none";

          clonedElement.style.borderColor =
            "#dbe3ef";
        }
      },
    });


    const imageData =
      canvas.toDataURL("image/png", 1.0);


    /* =====================================================
       A4 PORTRAIT
    ===================================================== */

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


    /*
      Small clean A4 margins.
      Reference image is a portrait result card,
      so this keeps the same presentation.
    */

    const margin = 8;

    const availableWidth =
      pageWidth - margin * 2;

    const imageWidth =
      availableWidth;

    const imageHeight =
      (canvas.height / canvas.width) *
      imageWidth;


    /* =====================================================
       SINGLE PAGE
    ===================================================== */

    if (imageHeight <= pageHeight - margin * 2) {

      pdf.addImage(
        imageData,
        "PNG",
        margin,
        margin,
        imageWidth,
        imageHeight,
        undefined,
        "FAST"
      );

    }

    /* =====================================================
       MULTI PAGE FALLBACK
    ===================================================== */

    else {

      let remainingHeight =
        imageHeight;

      let sourceY = 0;

      let pageNumber = 0;

      const pageContentHeight =
        pageHeight - margin * 2;


      while (remainingHeight > 0) {

        if (pageNumber > 0) {
          pdf.addPage();
        }


        const currentHeight =
          Math.min(
            remainingHeight,
            pageContentHeight
          );


        /*
          Create a temporary canvas for the
          visible section of the result.
        */

        const sectionCanvas =
          document.createElement("canvas");


        const scaleRatio =
          canvas.width / imageWidth;


        sectionCanvas.width =
          canvas.width;


        sectionCanvas.height =
          currentHeight * scaleRatio;


        const context =
          sectionCanvas.getContext("2d");


        context.fillStyle =
          "#ffffff";


        context.fillRect(
          0,
          0,
          sectionCanvas.width,
          sectionCanvas.height
        );


        context.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sectionCanvas.height,
          0,
          0,
          sectionCanvas.width,
          sectionCanvas.height
        );


        const sectionImage =
          sectionCanvas.toDataURL(
            "image/png",
            1.0
          );


        pdf.addImage(
          sectionImage,
          "PNG",
          margin,
          margin,
          imageWidth,
          currentHeight,
          undefined,
          "FAST"
        );


        sourceY +=
          sectionCanvas.height;


        remainingHeight -=
          currentHeight;


        pageNumber++;
      }
    }


    return pdf;
  };


  /* =======================================================
     DOWNLOAD PDF
  ======================================================= */

  const downloadPdf = async () => {

    if (!result) return;


    try {

      setPdfMessage(
        "Preparing your PDF..."
      );


      const pdf =
        await createVisualPdf();


      if (!pdf) {

        setPdfMessage(
          "Unable to create PDF."
        );

        return;
      }


      pdf.save(
        "AgeVerse-Percentage-Calculator-Result.pdf"
      );


      setPdfMessage(
        "PDF downloaded successfully."
      );

    } catch (error) {

      console.error(
        "PDF generation error:",
        error
      );

      setPdfMessage(
        "Unable to download PDF."
      );
    }
  };


  /* =======================================================
     SHARE PDF
     
     IMPORTANT:
     Uses THE SAME PDF generated by createVisualPdf().
  ======================================================= */

  const sharePdf = async () => {

    if (!result) return;


    try {

      setPdfMessage(
        "Preparing PDF for sharing..."
      );


      const pdf =
        await createVisualPdf();


      if (!pdf) {

        setPdfMessage(
          "Unable to create PDF."
        );

        return;
      }


      const pdfBlob =
        pdf.output("blob");


      const file =
        new File(
          [pdfBlob],
          "AgeVerse-Percentage-Calculator-Result.pdf",
          {
            type: "application/pdf",
          }
        );


      /* ===================================================
         NATIVE FILE SHARE
      =================================================== */

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [file],
        })
      ) {

        await navigator.share({
          title:
            "AgeVerse.Global — Percentage Calculator",

          text:
            "Percentage Calculator Result",

          files: [file],
        });


        setPdfMessage(
          "PDF shared successfully."
        );

        return;
      }


      /* ===================================================
         FALLBACK
      =================================================== */

      const url =
        URL.createObjectURL(pdfBlob);


      const anchor =
        document.createElement("a");


      anchor.href = url;

      anchor.download =
        "AgeVerse-Percentage-Calculator-Result.pdf";


      document.body.appendChild(anchor);

      anchor.click();

      anchor.remove();


      URL.revokeObjectURL(url);


      setPdfMessage(
        "PDF sharing is not supported here. The PDF has been downloaded instead."
      );

    } catch (error) {

      if (error?.name === "AbortError") {

        setPdfMessage("");

        return;
      }


      console.error(
        "PDF sharing error:",
        error
      );


      setPdfMessage(
        "Unable to share PDF on this device."
      );
    }
  };


  /* =======================================================
     PRINT
  ======================================================= */

  const printResult = () => {

    if (!result) return;

    setTimeout(() => {

      window.print();

    }, 100);
  };


  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="percentage-calculator-page">

      <div className="percentage-calculator-layout">


        {/* =================================================
            INPUT CARD
        ================================================= */}

        <section className="percentage-calculator-card">

          <div className="percentage-calculator-header">

            <div className="percentage-calculator-icon">
              📊
            </div>


            <div>

              <h1>
                Percentage Calculator
              </h1>

              <p>
                Quickly calculate percentages,
                increases, decreases and more.
              </p>

            </div>

          </div>


          {/* MODE */}

          <div className="percentage-calculator-mode-section">

            <label htmlFor="percentageMode">
              Calculation Type
            </label>


            <select
              id="percentageMode"
              value={mode}
              onChange={(event) =>
                changeMode(event.target.value)
              }
            >

              {modes.map((item) => (

                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.title}
                </option>

              ))}

            </select>

          </div>


          {/* DESCRIPTION */}

          <div className="percentage-calculator-description">

            <span className="percentage-calculator-description-icon">
              💡
            </span>

            <span>
              {activeMode.description}
            </span>

          </div>


          {/* INPUTS */}

          <div className="percentage-calculator-input-grid">

            <div className="percentage-calculator-field">

              <label htmlFor="percentageFirst">
                {activeMode.firstLabel}
              </label>


              <input
                id="percentageFirst"
                type="number"
                inputMode="decimal"
                value={first}
                placeholder={activeMode.firstPlaceholder}
                onChange={(event) =>
                  setFirst(event.target.value)
                }
              />

            </div>


            <div className="percentage-calculator-field">

              <label htmlFor="percentageSecond">
                {activeMode.secondLabel}
              </label>


              <input
                id="percentageSecond"
                type="number"
                inputMode="decimal"
                value={second}
                placeholder={activeMode.secondPlaceholder}
                onChange={(event) =>
                  setSecond(event.target.value)
                }
              />

            </div>

          </div>


          {/* ERROR */}

          {error && (

            <div
              className="percentage-calculator-error"
              role="alert"
            >
              ⚠️ {error}
            </div>

          )}


          {/* BUTTONS */}

          <div className="percentage-calculator-buttons">

            <button
              type="button"
              className="percentage-calculator-calculate"
              onClick={calculate}
            >
              🧮 Calculate
            </button>


            <button
              type="button"
              className="percentage-calculator-reset"
              onClick={reset}
            >
              🔄 Reset
            </button>

          </div>


          {/* TIP */}

          <div className="percentage-calculator-info">

            <div className="percentage-calculator-info-title">
              💡 Quick Tip
            </div>

            <p>
              Enter the values above and select the
              calculation type that matches what you
              want to find.
            </p>

          </div>

        </section>


        {/* =================================================
            RESULT SECTION
        ================================================= */}

        <section className="percentage-calculator-result-section">

          {!result ? (

            <div className="percentage-calculator-empty-result">

              <div className="percentage-calculator-empty-icon">
                📊
              </div>


              <h2>
                Your Result Will Appear Here
              </h2>


              <p>
                Enter your values and tap
                <strong> Calculate </strong>
                to see the complete percentage calculation.
              </p>


              <div className="percentage-calculator-empty-points">

                <span>⚡ Fast</span>
                <span>✓ Accurate</span>
                <span>🔒 Simple</span>

              </div>

            </div>

          ) : (

            /*
              IMPORTANT:
              This exact DOM element is used for:
              1. Download PDF
              2. Share PDF
              3. Print
            */

            <div
              ref={resultCardRef}
              className="percentage-calculator-result-card"
            >

              {/* RESULT HEADER */}

              <div className="percentage-calculator-result-header">

                <div className="percentage-calculator-result-icon">
                  ✓
                </div>


                <div>

                  <h2>
                    Calculation Result
                  </h2>

                  <p>
                    {activeMode.title}
                  </p>

                </div>

              </div>


              {/* INPUT SUMMARY */}

              <div className="percentage-calculator-input-summary">

                <div className="percentage-calculator-section-heading">
                  🧾 Input Details
                </div>


                <div className="percentage-calculator-input-summary-grid">

                  <div className="percentage-calculator-summary-item">

                    <span>
                      {activeMode.firstLabel}
                    </span>

                    <strong>
                      {formatNumber(Number(first))}
                    </strong>

                  </div>


                  <div className="percentage-calculator-summary-item">

                    <span>
                      {activeMode.secondLabel}
                    </span>

                    <strong>
                      {formatNumber(Number(second))}
                    </strong>

                  </div>

                </div>

              </div>


              {/* MAIN RESULT */}

              <div className="percentage-calculator-main-result">

                <span>
                  {result.label}
                </span>


                <strong>
                  {formatNumber(result.value)}
                  {isPercentageResult ? "%" : ""}
                </strong>


                <small>
                  ✓ Calculated result
                </small>

              </div>


              {/* CALCULATION FLOW */}

              <div className="percentage-calculator-calculation-flow">

                <div className="percentage-calculator-section-heading">
                  🧮 Calculation
                </div>


                <div className="percentage-calculator-flow-box">

                  <div className="percentage-calculator-flow-row">

                    <span>
                      Input
                    </span>

                    <strong>
                      {formatNumber(Number(first))}
                    </strong>

                  </div>


                  <div className="percentage-calculator-flow-operator">
                    +
                  </div>


                  <div className="percentage-calculator-flow-row">

                    <span>
                      Input
                    </span>

                    <strong>
                      {formatNumber(Number(second))}
                    </strong>

                  </div>


                  <div className="percentage-calculator-flow-arrow">
                    ↓
                  </div>


                  <div className="percentage-calculator-flow-result">

                    <span>
                      Result
                    </span>

                    <strong>
                      {formatNumber(result.value)}
                      {isPercentageResult ? "%" : ""}
                    </strong>

                  </div>

                </div>

              </div>


              {/* FORMULA */}

              <div className="percentage-calculator-equation">

                <div className="percentage-calculator-equation-label">
                  📐 Formula
                </div>


                <strong>
                  {result.equation}
                </strong>

              </div>


              {/* IMPORTANT NOTE */}

              <div className="percentage-calculator-important">

                <strong>
                  ℹ️ Calculation Note
                </strong>

                <p>
                  This result is calculated using the
                  selected percentage method and the values
                  entered above.
                </p>

              </div>


              {/* ACTIONS */}

              <div className="percentage-calculator-result-actions">

                <button
                  type="button"
                  onClick={copyResult}
                  className="percentage-action-copy"
                >
                  📋 Copy
                </button>


                <button
                  type="button"
                  onClick={downloadPdf}
                  className="percentage-action-pdf"
                >
                  📄 Download PDF
                </button>


                <button
                  type="button"
                  onClick={sharePdf}
                  className="percentage-action-share"
                >
                  📤 Share PDF
                </button>


                <button
                  type="button"
                  onClick={printResult}
                  className="percentage-action-print"
                >
                  🖨️ Print
                </button>


                <button
                  type="button"
                  onClick={reset}
                  className="percentage-action-new"
                >
                  🔄 New
                </button>

              </div>


              {/* COPY MESSAGE */}

              {copied && (

                <div className="percentage-calculator-action-message">
                  ✓ Result copied successfully.
                </div>

              )}


              {/* PDF MESSAGE */}

              {pdfMessage && (

                <div className="percentage-calculator-pdf-message">
                  {pdfMessage}
                </div>

              )}


              {/* FOOTER */}

              <div className="percentage-calculator-result-footer">
        <ResultAttribution type="calculated" />
      </div>


            </div>

          )}

        </section>

      </div>

    </main>
  );
};


export default PercentageCalculator;