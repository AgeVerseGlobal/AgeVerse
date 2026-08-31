import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "../styles/GstCalculator.css";

import ResultAttribution from "./ResultAttribution";
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
   EXTERNAL LIBRARY LOADER
   Loads html2canvas / jsPDF only when required.
========================================================= */

const loadScript = (src, id) => {
  return new Promise((resolve, reject) => {
    if (id && document.getElementById(id)) {
      resolve();
      return;
    }

    const script = document.createElement("script");

    if (id) {
      script.id = id;
    }

    script.src = src;
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error(`Unable to load ${src}`));

    document.head.appendChild(script);
  });
};

const loadHtml2Canvas = async () => {
  if (window.html2canvas) {
    return window.html2canvas;
  }

  await loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
    "ageverse-html2canvas"
  );

  if (!window.html2canvas) {
    throw new Error("html2canvas unavailable");
  }

  return window.html2canvas;
};

const loadJsPdf = async () => {
  if (window.jspdf?.jsPDF) {
    return window.jspdf.jsPDF;
  }

  await loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
    "ageverse-jspdf"
  );

  if (!window.jspdf?.jsPDF) {
    throw new Error("jsPDF unavailable");
  }

  return window.jspdf.jsPDF;
};

/* =========================================================
   IMAGE CAPTURE
========================================================= */

const captureResultCard = async (element) => {
  if (!element) {
    throw new Error("Result card not found.");
  }

  const html2canvas = await loadHtml2Canvas();

  /*
   * Wait for browser layout/fonts/images before capture.
   */
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  await new Promise((resolve) =>
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    })
  );

  const canvas = await html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: Math.min(
      Math.max(window.devicePixelRatio || 2, 2),
      3
    ),
    useCORS: true,
    allowTaint: false,
    logging: false,

    /*
     * Keep action buttons out of image/PDF.
     */
    ignoreElements: (node) =>
      node?.classList?.contains(
        "gst-calculator-result-actions"
      ) ||
      node?.classList?.contains(
        "gst-calculator-action-message"
      ) ||
      node?.classList?.contains(
        "gst-calculator-pdf-message"
      ),
  });

  return canvas;
};

/* =========================================================
   COPY IMAGE
========================================================= */

const copyCanvasAsImage = async (canvas) => {
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error("Unable to create image."));
        }
      },
      "image/png",
      1
    );
  });

  if (
    navigator.clipboard &&
    window.ClipboardItem
  ) {
    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": blob,
      }),
    ]);

    return;
  }

  /*
   * Fallback:
   * download image if clipboard image API
   * is not supported by the browser.
   */
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download =
    "AgeVerse-GST-Calculator-Result.png";

  document.body.appendChild(anchor);

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(url);

  throw new Error(
    "Image clipboard is not supported. Result image downloaded instead."
  );
};

/* =========================================================
   PDF CREATOR
========================================================= */

const canvasToPdfBlob = async (canvas) => {
  const jsPDF = await loadJsPdf();

  const imageData = canvas.toDataURL(
    "image/png",
    1
  );

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  /*
   * A4 dimensions in mm.
   */
  const pageWidth = 210;
  const pageHeight = 297;

  const margin = 10;

  const usableWidth =
    pageWidth - margin * 2;

  const usableHeight =
    pageHeight - margin * 2;

  const imageRatio =
    canvasWidth / canvasHeight;

  let renderWidth = usableWidth;
  let renderHeight =
    renderWidth / imageRatio;

  /*
   * If the result is taller than A4,
   * scale it down to one professional page.
   */
  if (renderHeight > usableHeight) {
    renderHeight = usableHeight;
    renderWidth =
      renderHeight * imageRatio;
  }

  const x =
    (pageWidth - renderWidth) / 2;

  const y =
    (pageHeight - renderHeight) / 2;

  const pdf = new jsPDF({
    orientation:
      renderWidth > renderHeight
        ? "landscape"
        : "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const actualPageWidth =
    pdf.internal.pageSize.getWidth();

  const actualPageHeight =
    pdf.internal.pageSize.getHeight();

  const actualMargin = 10;

  const actualUsableWidth =
    actualPageWidth - actualMargin * 2;

  const actualUsableHeight =
    actualPageHeight - actualMargin * 2;

  let finalWidth =
    actualUsableWidth;

  let finalHeight =
    finalWidth / imageRatio;

  if (
    finalHeight >
    actualUsableHeight
  ) {
    finalHeight =
      actualUsableHeight;

    finalWidth =
      finalHeight * imageRatio;
  }

  const finalX =
    (actualPageWidth - finalWidth) / 2;

  const finalY =
    (actualPageHeight - finalHeight) / 2;

  pdf.addImage(
    imageData,
    "PNG",
    finalX,
    finalY,
    finalWidth,
    finalHeight,
    undefined,
    "FAST"
  );

  return pdf.output("blob");
};

/* =========================================================
   GST CALCULATOR
========================================================= */

const GstCalculator = () => {
  const { t } = useTranslation();
  const [mode, setMode] =
    useState("addGst");

  const [taxType, setTaxType] =
    useState("cgstSgst");

  const [amount, setAmount] =
    useState("");

  const [gstRate, setGstRate] =
    useState("18");

  const [customRate, setCustomRate] =
    useState("");

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const [pdfMessage, setPdfMessage] =
    useState("");

  const resultCardRef =
    useRef(null);

  /* =======================================================
     MODES
  ======================================================= */

  const modes = useMemo(
    () => [
      {
        id: "addGst",
        title: "Add GST",
        description:
          t("gst.add_description"),
        amountLabel:
          "Original Amount",
        amountPlaceholder:
          "e.g. 1000",
      },

      {
        id: "removeGst",
        title: "Remove GST",
        description:
          t("gst.remove_description"),
        amountLabel:
          "Amount Including GST",
        amountPlaceholder:
          "e.g. 1180",
      },

      {
        id: "gstBreakdown",
        title: "GST Breakdown",
        description:
          "Get a complete breakdown of base amount, GST and total amount.",
        amountLabel:
          "Amount",
        amountPlaceholder:
          "e.g. 5000",
      },
    ],
    []
  );

  const activeMode =
    modes.find(
      (item) => item.id === mode
    ) || modes[0];

  /* =======================================================
     ACTIVE GST RATE
  ======================================================= */

  const activeRate =
    gstRate === "custom"
      ? Number(customRate)
      : Number(gstRate);

  /* =======================================================
     CALCULATE
  ======================================================= */

  const calculate = () => {
    setError("");
    setCopied(false);
    setPdfMessage("");

    if (amount.trim() === "") {
      setError(
        "Please enter the amount."
      );
      setResult(null);
      return;
    }

    const inputAmount =
      Number(amount);

    if (
      !Number.isFinite(
        inputAmount
      ) ||
      inputAmount < 0
    ) {
      setError(
        "Please enter a valid amount."
      );
      setResult(null);
      return;
    }

    if (
      !Number.isFinite(
        activeRate
      ) ||
      activeRate < 0 ||
      activeRate > 100
    ) {
      setError(
        "Please enter a valid GST rate between 0% and 100%."
      );
      setResult(null);
      return;
    }

    let baseAmount;
    let gstAmount;
    let totalAmount;
    let equation;

    /* -----------------------------------------------------
       ADD GST
    ----------------------------------------------------- */

    if (mode === "addGst") {
      baseAmount =
        inputAmount;

      gstAmount =
        (baseAmount *
          activeRate) /
        100;

      totalAmount =
        baseAmount +
        gstAmount;

      equation =
        `${formatNumber(
          baseAmount
        )} × ${formatNumber(
          activeRate
        )}% ÷ 100 = ${formatNumber(
          gstAmount
        )}`;
    }

    /* -----------------------------------------------------
       REMOVE GST
    ----------------------------------------------------- */

    else if (
      mode === "removeGst"
    ) {
      totalAmount =
        inputAmount;

      baseAmount =
        totalAmount /
        (1 +
          activeRate / 100);

      gstAmount =
        totalAmount -
        baseAmount;

      equation =
        `${formatNumber(
          totalAmount
        )} ÷ (1 + ${formatNumber(
          activeRate
        )}% ÷ 100) = ${formatNumber(
          baseAmount
        )}`;
    }

    /* -----------------------------------------------------
       GST BREAKDOWN
    ----------------------------------------------------- */

    else {
      baseAmount =
        inputAmount;

      gstAmount =
        (baseAmount *
          activeRate) /
        100;

      totalAmount =
        baseAmount +
        gstAmount;

      equation =
        `${formatNumber(
          baseAmount
        )} × ${formatNumber(
          activeRate
        )}% ÷ 100 = ${formatNumber(
          gstAmount
        )}`;
    }

    const cgst =
      taxType === "cgstSgst"
        ? gstAmount / 2
        : 0;

    const sgst =
      taxType === "cgstSgst"
        ? gstAmount / 2
        : 0;

    const igst =
      taxType === "igst"
        ? gstAmount
        : 0;

    setResult({
      inputAmount,
      baseAmount,
      gstAmount,
      totalAmount,
      cgst,
      sgst,
      igst,
      rate: activeRate,
      equation,
    });
  };

  /* =======================================================
     RESET
  ======================================================= */

  const reset = () => {
    setAmount("");
    setGstRate("18");
    setCustomRate("");
    setTaxType("cgstSgst");
    setResult(null);
    setError("");
    setCopied(false);
    setPdfMessage("");
  };

  /* =======================================================
     CHANGE MODE
  ======================================================= */

  const changeMode = (
    newMode
  ) => {
    setMode(newMode);
    setAmount("");
    setResult(null);
    setError("");
    setCopied(false);
    setPdfMessage("");
  };

  /* =======================================================
     COPY RESULT AS IMAGE
  ======================================================= */

  const copyResult = async () => {
    if (!result) return;

    setError("");
    setPdfMessage("");
    setCopied(false);

    try {
      const canvas =
        await captureResultCard(
          resultCardRef.current
        );

      await copyCanvasAsImage(
        canvas
      );

      setCopied(true);

      window.setTimeout(
        () => {
          setCopied(false);
        },
        2500
      );
    } catch (copyError) {
      console.error(
        "GST image copy error:",
        copyError
      );

      /*
       * If clipboard image isn't supported,
       * tell user clearly instead of silently
       * copying plain text.
       */
      setPdfMessage(
        "Image copy is not supported by this browser. Please use Download PDF or Share PDF."
      );
    }
  };

  /* =======================================================
     DOWNLOAD PDF
  ======================================================= */

  const downloadPdf = async () => {
    if (!result) return;

    setError("");
    setPdfMessage(
      "Preparing PDF..."
    );

    try {
      const canvas =
        await captureResultCard(
          resultCardRef.current
        );

      const blob =
        await canvasToPdfBlob(
          canvas
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const anchor =
        document.createElement(
          "a"
        );

      anchor.href = url;

      anchor.download =
        "AgeVerse-GST-Calculator-Result.pdf";

      document.body.appendChild(
        anchor
      );

      anchor.click();

      anchor.remove();

      window.setTimeout(
        () => {
          URL.revokeObjectURL(
            url
          );
        },
        1000
      );

      setPdfMessage(
        "✓ PDF downloaded successfully."
      );
    } catch (pdfError) {
      console.error(
        "GST PDF error:",
        pdfError
      );

      setPdfMessage(
        "Unable to create PDF. Please check your internet connection once and try again."
      );
    }
  };

  /* =======================================================
     SHARE PDF
  ======================================================= */

  const sharePdf = async () => {
    if (!result) return;

    setError("");
    setPdfMessage(
      "Preparing PDF..."
    );

    try {
      const canvas =
        await captureResultCard(
          resultCardRef.current
        );

      const blob =
        await canvasToPdfBlob(
          canvas
        );

      const file =
        new File(
          [blob],
          "AgeVerse-GST-Calculator-Result.pdf",
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
            "AgeVerse.Global — GST Calculator",
          text:
            "GST Calculator Result",
          files: [file],
        });

        setPdfMessage(
          "✓ PDF shared successfully."
        );

        return;
      }

      /*
       * Some browsers do not support file sharing.
       * Download the exact same PDF instead.
       */
      const url =
        URL.createObjectURL(
          blob
        );

      const anchor =
        document.createElement(
          "a"
        );

      anchor.href = url;

      anchor.download =
        "AgeVerse-GST-Calculator-Result.pdf";

      document.body.appendChild(
        anchor
      );

      anchor.click();

      anchor.remove();

      window.setTimeout(
        () => {
          URL.revokeObjectURL(
            url
          );
        },
        1000
      );

      setPdfMessage(
        "PDF sharing is not supported here. The same PDF has been downloaded instead."
      );
    } catch (shareError) {
      if (
        shareError?.name ===
        "AbortError"
      ) {
        setPdfMessage("");
        return;
      }

      console.error(
        "GST share error:",
        shareError
      );

      setPdfMessage(
        "Unable to share PDF."
      );
    }
  };

  /* =======================================================
     PRINT
  ======================================================= */

/* =======================================================
   PRINT — USE THE EXACT SAME GENERATED PDF
   AS DOWNLOAD PDF
======================================================= */

const printResult = async () => {
  if (!result) return;

  setError("");
  setPdfMessage("Preparing PDF for printing...");

  let pdfUrl = null;
  let printWindow = null;

  try {
    /* -----------------------------------------------
       1. Capture the exact same result card
          used by Download PDF
    ------------------------------------------------ */
    const canvas = await captureResultCard(
      resultCardRef.current
    );

    /* -----------------------------------------------
       2. Create the exact same PDF blob
          used by Download PDF / Share PDF
    ------------------------------------------------ */
    const blob = await canvasToPdfBlob(canvas);

    if (!blob) {
      throw new Error("PDF blob could not be created.");
    }

    /* -----------------------------------------------
       3. Create temporary PDF URL
    ------------------------------------------------ */
    pdfUrl = URL.createObjectURL(blob);

    /* -----------------------------------------------
       4. Open the SAME generated PDF
    ------------------------------------------------ */
    printWindow = window.open(
      pdfUrl,
      "_blank",
      "width=1000,height=900"
    );

    if (!printWindow) {
      setPdfMessage(
        "Please allow pop-ups in your browser to print the PDF."
      );

      URL.revokeObjectURL(pdfUrl);
      return;
    }

    /* -----------------------------------------------
       5. Give Chrome/Edge PDF viewer enough time
          to load the PDF completely
    ------------------------------------------------ */
    setPdfMessage(
      "PDF ready. Opening print dialog..."
    );

    const printPdf = () => {
      try {
        if (
          printWindow &&
          !printWindow.closed
        ) {
          printWindow.focus();

          /*
           * Small delay is important because Chrome's
           * built-in PDF viewer may need time to render
           * the page before print() is called.
           */
          setTimeout(() => {
            try {
              if (
                printWindow &&
                !printWindow.closed
              ) {
                printWindow.focus();
                printWindow.print();
              }
            } catch (printError) {
              console.error(
                "GST print dialog error:",
                printError
              );

              setPdfMessage(
                "PDF opened successfully. Please press Ctrl + P to print."
              );
            }
          }, 800);
        }
      } catch (error) {
        console.error(
          "GST print window error:",
          error
        );

        setPdfMessage(
          "PDF opened successfully. Please press Ctrl + P to print."
        );
      }
    };

    /*
     * PDF blob windows do not behave consistently
     * with the load event in every Chrome/Edge version,
     * so use a reliable timeout fallback.
     */
    setTimeout(() => {
      if (
        printWindow &&
        !printWindow.closed
      ) {
        printPdf();
      }
    }, 1500);

    /*
     * Keep the Blob URL alive long enough for the
     * browser's PDF viewer to finish loading.
     */
    setTimeout(() => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    }, 30000);

  } catch (printError) {
    console.error(
      "GST PDF print error:",
      printError
    );

    if (
      pdfUrl
    ) {
      URL.revokeObjectURL(pdfUrl);
    }

    setPdfMessage(
      "Unable to prepare PDF for printing. Please try Download PDF once; if it downloads correctly, open that PDF and press Ctrl + P."
    );
  }
};
  /* =======================================================
     RESULT TEXT
     Kept for accessibility / future use.
========================================================= */

  const resultText = result
    ? [
        "AgeVerse.Global",
        "GST Calculator",
        "",
        activeMode.title,
        "",
        `Input Amount: ₹${formatNumber(
          result.inputAmount
        )}`,
        `GST Rate: ${formatNumber(
          result.rate
        )}%`,
        `Tax Type: ${
          taxType === "cgstSgst"
            ? "CGST + SGST"
            : "IGST"
        }`,
        "",
        `Base Amount: ₹${formatNumber(
          result.baseAmount
        )}`,
        `GST Amount: ₹${formatNumber(
          result.gstAmount
        )}`,
        `CGST: ₹${formatNumber(
          result.cgst
        )}`,
        `SGST: ₹${formatNumber(
          result.sgst
        )}`,
        `IGST: ₹${formatNumber(
          result.igst
        )}`,
        `Total Amount: ₹${formatNumber(
          result.totalAmount
        )}`,
        "",
        `Formula: ${result.equation}`,
      ].join("\n")
    : "";

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="gst-calculator-page">
      <div className="gst-calculator-layout">

        {/* =================================================
            INPUT CARD
        ================================================= */}

        <section className="gst-calculator-card">

          <div className="gst-calculator-header">

            <div className="gst-calculator-icon">
              🧾
            </div>

            <div>
              <h1>
                GST Calculator
              </h1>

              <p>
                Calculate GST, tax amount and total
                amount quickly and accurately.
              </p>
            </div>

          </div>

          {/* MODE */}

          <div className="gst-calculator-mode-section">

            <label htmlFor="gstMode">
              Calculation Type
            </label>

            <select
              id="gstMode"
              value={mode}
              onChange={(event) =>
                changeMode(
                  event.target.value
                )
              }
            >
              {modes.map(
                (item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.title}
                  </option>
                )
              )}
            </select>

          </div>

          {/* DESCRIPTION */}

          <div className="gst-calculator-description">

            <span className="gst-calculator-description-icon">
              💡
            </span>

            <span>
              {
                activeMode.description
              }
            </span>

          </div>

          {/* AMOUNT */}

          <div className="gst-calculator-field gst-main-field">

            <label htmlFor="gstAmount">
              {
                activeMode.amountLabel
              }
            </label>

            <input
              id="gstAmount"
              type="number"
              inputMode="decimal"
              min="0"
              value={amount}
              placeholder={
                activeMode.amountPlaceholder
              }
              onChange={(event) =>
                setAmount(
                  event.target.value
                )
              }
            />

          </div>

          {/* GST RATE */}

          <div className="gst-calculator-field">

            <label htmlFor="gstRate">
              GST Rate
            </label>

            <select
              id="gstRate"
              value={gstRate}
              onChange={(event) =>
                setGstRate(
                  event.target.value
                )
              }
            >
              <option value="0">
                0%
              </option>

              <option value="5">
                5%
              </option>

              <option value="12">
                12%
              </option>

              <option value="18">
                18%
              </option>

              <option value="28">
                28%
              </option>

              <option value="custom">
                Custom Rate
              </option>
            </select>

          </div>

          {/* CUSTOM RATE */}

          {gstRate ===
            "custom" && (
            <div className="gst-calculator-field gst-custom-rate-field">

              <label htmlFor="gstCustomRate">
                Custom GST Rate (%)
              </label>

              <input
                id="gstCustomRate"
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                value={
                  customRate
                }
                placeholder="e.g. 18"
                onChange={(
                  event
                ) =>
                  setCustomRate(
                    event.target
                      .value
                  )
                }
              />

            </div>
          )}

          {/* TAX TYPE */}

          <div className="gst-calculator-tax-section">

            <label>
              Tax Type
            </label>

            <div className="gst-tax-options">

              <label className="gst-tax-option">

                <input
                  type="radio"
                  name="gstTaxType"
                  value="cgstSgst"
                  checked={
                    taxType ===
                    "cgstSgst"
                  }
                  onChange={() =>
                    setTaxType(
                      "cgstSgst"
                    )
                  }
                />

                <span>
                  CGST + SGST
                </span>

              </label>

              <label className="gst-tax-option">

                <input
                  type="radio"
                  name="gstTaxType"
                  value="igst"
                  checked={
                    taxType ===
                    "igst"
                  }
                  onChange={() =>
                    setTaxType(
                      "igst"
                    )
                  }
                />

                <span>
                  IGST
                </span>

              </label>

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div
              className="gst-calculator-error"
              role="alert"
            >
              ⚠️ {error}
            </div>
          )}

          {/* BUTTONS */}

          <div className="gst-calculator-buttons">

            <button
              type="button"
              className="gst-calculator-calculate"
              onClick={
                calculate
              }
            >
              🧮 Calculate
            </button>

            <button
              type="button"
              className="gst-calculator-reset"
              onClick={
                reset
              }
            >
              🔄 Reset
            </button>

          </div>

          {/* QUICK TIP */}

          <div className="gst-calculator-info">

            <div className="gst-calculator-info-title">
              💡 Quick Tip
            </div>

            <p>
              Select the GST rate, choose whether the
              amount is GST-inclusive or exclusive,
              and then calculate your complete GST
              breakdown.
            </p>

          </div>

        </section>

        {/* =================================================
            RESULT
        ================================================= */}

        <section className="gst-calculator-result-section">

          {!result ? (

            <div className="gst-calculator-empty-result">

              <div className="gst-calculator-empty-icon">
                🧾
              </div>

              <h2>
                Your Result Will Appear Here
              </h2>

              <p>
                Enter your amount, select the GST
                rate and tap
                <strong>
                  {" "}
                  Calculate{" "}
                </strong>
                to see the complete GST calculation.
              </p>

              <div className="gst-calculator-empty-points">
                <span>
                  ⚡ Fast
                </span>

                <span>
                  ✓ Accurate
                </span>

                <span>
                  🔒 Simple
                </span>
              </div>

            </div>

          ) : (

            <div
              className="gst-calculator-result-card"
              ref={resultCardRef}
            >

              {/* RESULT HEADER */}

              <div className="gst-calculator-result-header">

                <div className="gst-calculator-result-icon">
                  ✓
                </div>

                <div>
                  <h2>
                    Calculation Result
                  </h2>

                  <p>
                    {
                      activeMode.title
                    }
                  </p>
                </div>

              </div>

              {/* INPUT SUMMARY */}

              <div className="gst-calculator-input-summary">

                <div className="gst-calculator-section-heading">
                  🧾 Input Details
                </div>

                <div className="gst-calculator-input-summary-grid">

                  <div className="gst-calculator-summary-item">
                    <span>
                      Input Amount
                    </span>

                    <strong>
                      ₹
                      {formatNumber(
                        result.inputAmount
                      )}
                    </strong>
                  </div>

                  <div className="gst-calculator-summary-item">
                    <span>
                      GST Rate
                    </span>

                    <strong>
                      {formatNumber(
                        result.rate
                      )}
                      %
                    </strong>
                  </div>

                  <div className="gst-calculator-summary-item">
                    <span>
                      Calculation
                    </span>

                    <strong>
                      {
                        activeMode.title
                      }
                    </strong>
                  </div>

                  <div className="gst-calculator-summary-item">
                    <span>
                      Tax Type
                    </span>

                    <strong>
                      {taxType ===
                      "cgstSgst"
                        ? "CGST + SGST"
                        : "IGST"}
                    </strong>
                  </div>

                </div>

              </div>

              {/* MAIN RESULT */}

              <div className="gst-calculator-main-result">

                <span>
                  Total Amount
                </span>

                <strong>
                  ₹
                  {formatNumber(
                    result.totalAmount
                  )}
                </strong>

                <small>
                  ✓ Calculated result
                </small>

              </div>

              {/* GST SUMMARY */}

              <div className="gst-calculator-tax-summary">

                <div className="gst-calculator-section-heading">
                  💰 GST Breakdown
                </div>

                <div className="gst-tax-summary-grid">

                  <div className="gst-tax-summary-item">
                    <span>
                      Base Amount
                    </span>

                    <strong>
                      ₹
                      {formatNumber(
                        result.baseAmount
                      )}
                    </strong>
                  </div>

                  <div className="gst-tax-summary-item">
                    <span>
                      GST Amount
                    </span>

                    <strong>
                      ₹
                      {formatNumber(
                        result.gstAmount
                      )}
                    </strong>
                  </div>

                  {taxType ===
                  "cgstSgst" ? (
                    <>
                      <div className="gst-tax-summary-item">
                        <span>
                          CGST
                        </span>

                        <strong>
                          ₹
                          {formatNumber(
                            result.cgst
                          )}
                        </strong>
                      </div>

                      <div className="gst-tax-summary-item">
                        <span>
                          SGST
                        </span>

                        <strong>
                          ₹
                          {formatNumber(
                            result.sgst
                          )}
                        </strong>
                      </div>
                    </>
                  ) : (
                    <div className="gst-tax-summary-item gst-tax-summary-full">
                      <span>
                        IGST
                      </span>

                      <strong>
                        ₹
                        {formatNumber(
                          result.igst
                        )}
                      </strong>
                    </div>
                  )}

                </div>

              </div>

              {/* CALCULATION FLOW */}

              <div className="gst-calculator-calculation-flow">

                <div className="gst-calculator-section-heading">
                  🧮 Calculation
                </div>

                <div className="gst-calculator-flow-box">

                  <div className="gst-calculator-flow-row">
                    <span>
                      Base Amount
                    </span>

                    <strong>
                      ₹
                      {formatNumber(
                        result.baseAmount
                      )}
                    </strong>
                  </div>

                  <div className="gst-calculator-flow-operator">
                    +
                  </div>

                  <div className="gst-calculator-flow-row">
                    <span>
                      GST
                    </span>

                    <strong>
                      ₹
                      {formatNumber(
                        result.gstAmount
                      )}
                    </strong>
                  </div>

                  <div className="gst-calculator-flow-arrow">
                    ↓
                  </div>

                  <div className="gst-calculator-flow-result">

                    <span>
                      Total Amount
                    </span>

                    <strong>
                      ₹
                      {formatNumber(
                        result.totalAmount
                      )}
                    </strong>

                  </div>

                </div>

              </div>

              {/* FORMULA */}

              <div className="gst-calculator-equation">

                <div className="gst-calculator-equation-label">
                  📐 Formula
                </div>

                <strong>
                  {
                    result.equation
                  }
                </strong>

              </div>

              {/* IMPORTANT NOTE */}

              <div className="gst-calculator-important">

                <strong>
                  ℹ️ Calculation Note
                </strong>

                <p>
                  GST has been calculated using the
                  selected GST rate and tax type.
                  CGST and SGST are divided equally
                  when the intra-state option is selected.
                </p>

              </div>

              {/* ACTIONS */}

              <div className="gst-calculator-result-actions">

                <button
                  type="button"
                  onClick={
                    copyResult
                  }
                  className="gst-action-copy"
                >
                  📋 Copy Image
                </button>

                <button
                  type="button"
                  onClick={
                    downloadPdf
                  }
                  className="gst-action-pdf"
                >
                  📄 Download PDF
                </button>

                <button
                  type="button"
                  onClick={
                    sharePdf
                  }
                  className="gst-action-share"
                >
                  📤 Share PDF
                </button>

                <button
                  type="button"
                  onClick={
                    printResult
                  }
                  className="gst-action-print"
                >
                  🖨️ Print
                </button>

                <button
                  type="button"
                  onClick={
                    reset
                  }
                  className="gst-action-new"
                >
                  🔄 New
                </button>

              </div>

              {/* MESSAGES */}

              {copied && (
                <div className="gst-calculator-action-message">
                  ✓ Result image copied successfully.
                </div>
              )}

              {pdfMessage && (
                <div className="gst-calculator-pdf-message">
                  {
                    pdfMessage
                  }
                </div>
              )}

              {/* FOOTER */}

              <div className="gst-calculator-result-footer">
        <ResultAttribution type="calculated" />
      </div>

            </div>

          )}

        </section>

      </div>
    </main>
  );
};

export default GstCalculator;