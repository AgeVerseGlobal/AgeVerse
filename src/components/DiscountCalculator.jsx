import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import html2canvas from "html2canvas";
import "../styles/DiscountCalculator.css";

import ResultAttribution from "./ResultAttribution";
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
   DISCOUNT CALCULATOR
========================================================= */

const DiscountCalculator = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState("single");

  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");

  const [discountRate, setDiscountRate] = useState("");
  const [discountRate2, setDiscountRate2] = useState("");
  const [discountRate3, setDiscountRate3] = useState("");

  const [slab1Qty, setSlab1Qty] = useState("1");
  const [slab1Rate, setSlab1Rate] = useState("10");

  const [slab2Qty, setSlab2Qty] = useState("2");
  const [slab2Rate, setSlab2Rate] = useState("15");

  const [slab3Qty, setSlab3Qty] = useState("3");
  const [slab3Rate, setSlab3Rate] = useState("20");

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [copied, setCopied] = useState(false);
  const [pdfMessage, setPdfMessage] = useState("");

  /* =======================================================
     MODES
  ======================================================= */

  const modes = useMemo(
    () => [
      {
        id: "single",
        title: "Single Discount",
        description:
          t("discount.single_description"),
      },
      {
        id: "multiple",
        title: "Multiple Discounts",
        description:
          t("discount.multiple_description"),
      },
      {
        id: "quantity",
        title: "Quantity Discount",
        description:
          "Use different discount rates according to quantity purchased.",
      },
    ],
    []
  );

  const activeMode = modes.find((item) => item.id === mode);

  /* =======================================================
     VALIDATION HELPER
  ======================================================= */

  const validRate = (value) => {
    const rate = Number(value);

    return (
      Number.isFinite(rate) &&
      rate >= 0 &&
      rate <= 100
    );
  };

  /* =======================================================
     CALCULATE
  ======================================================= */

  const calculate = () => {
    setError("");
    setCopied(false);
    setPdfMessage("");

    if (price.trim() === "") {
      setError("Please enter the original price.");
      setResult(null);
      return;
    }

    const originalPrice = Number(price);
    const itemQuantity = Number(quantity);

    if (
      !Number.isFinite(originalPrice) ||
      originalPrice < 0
    ) {
      setError("Please enter a valid original price.");
      setResult(null);
      return;
    }

    if (
      !Number.isFinite(itemQuantity) ||
      itemQuantity <= 0
    ) {
      setError("Please enter a valid quantity.");
      setResult(null);
      return;
    }

    let discountAmount = 0;
    let finalPrice = originalPrice;
    let effectiveRate = 0;

    let discountSteps = [];
    let calculationText = "";

    /* =====================================================
       SINGLE DISCOUNT
    ===================================================== */

    if (mode === "single") {
      if (!validRate(discountRate)) {
        setError(
          "Please enter a valid discount between 0% and 100%."
        );
        setResult(null);
        return;
      }

      const rate = Number(discountRate);

      discountAmount =
        (originalPrice * rate) / 100;

      finalPrice =
        originalPrice - discountAmount;

      effectiveRate = rate;

      discountSteps = [
        {
          label: "Discount",
          rate,
          amount: discountAmount,
          before: originalPrice,
          after: finalPrice,
        },
      ];

      calculationText =
        `${currency(originalPrice)} × ${formatNumber(
          rate
        )}% ÷ 100 = ${currency(discountAmount)}`;
    }

    /* =====================================================
       MULTIPLE DISCOUNTS
    ===================================================== */

    else if (mode === "multiple") {
      const rates = [
        discountRate,
        discountRate2,
        discountRate3,
      ]
        .filter((value) => value !== "")
        .map(Number);

      if (
        rates.length === 0 ||
        rates.some(
          (rate) =>
            !Number.isFinite(rate) ||
            rate < 0 ||
            rate > 100
        )
      ) {
        setError(
          "Please enter valid discount rates between 0% and 100%."
        );
        setResult(null);
        return;
      }

      let currentAmount = originalPrice;

      rates.forEach((rate, index) => {
        const before = currentAmount;

        const amount =
          (before * rate) / 100;

        const after =
          before - amount;

        discountSteps.push({
          label: `Discount ${index + 1}`,
          rate,
          amount,
          before,
          after,
        });

        currentAmount = after;
      });

      finalPrice = currentAmount;

      discountAmount =
        originalPrice - finalPrice;

      effectiveRate =
        originalPrice === 0
          ? 0
          : (discountAmount / originalPrice) *
            100;

      calculationText =
        rates
          .map(
            (rate) =>
              `(100% − ${formatNumber(rate)}%)`
          )
          .join(" × ");

      calculationText +=
        ` × ${currency(originalPrice)} = ${currency(
          finalPrice
        )}`;
    }

    /* =====================================================
       QUANTITY DISCOUNT
    ===================================================== */

    else {
      const q1 = Number(slab1Qty);
      const q2 = Number(slab2Qty);
      const q3 = Number(slab3Qty);

      const r1 = Number(slab1Rate);
      const r2 = Number(slab2Rate);
      const r3 = Number(slab3Rate);

      if (
        !Number.isFinite(q1) ||
        !Number.isFinite(q2) ||
        !Number.isFinite(q3) ||
        q1 <= 0 ||
        q2 <= 0 ||
        q3 <= 0
      ) {
        setError(
          "Please enter valid quantity slabs."
        );
        setResult(null);
        return;
      }

      if (
        !validRate(r1) ||
        !validRate(r2) ||
        !validRate(r3)
      ) {
        setError(
          "Please enter valid discount rates between 0% and 100%."
        );
        setResult(null);
        return;
      }

      let selectedRate;

      if (itemQuantity >= q3) {
        selectedRate = r3;
      } else if (itemQuantity >= q2) {
        selectedRate = r2;
      } else {
        selectedRate = r1;
      }

      discountAmount =
        (originalPrice *
          itemQuantity *
          selectedRate) /
        100;

      const totalOriginal =
        originalPrice * itemQuantity;

      finalPrice =
        totalOriginal - discountAmount;

      effectiveRate = selectedRate;

      discountSteps = [
        {
          label: "Quantity Discount",
          rate: selectedRate,
          amount: discountAmount,
          before: totalOriginal,
          after: finalPrice,
        },
      ];

      calculationText =
        `${currency(originalPrice)} × ${formatNumber(
          itemQuantity
        )} × ${formatNumber(
          selectedRate
        )}% ÷ 100 = ${currency(discountAmount)}`;
    }

    const totalOriginalAmount =
      mode === "quantity"
        ? originalPrice * itemQuantity
        : originalPrice;

    const saving =
      totalOriginalAmount - finalPrice;

    setResult({
      originalPrice,
      quantity: itemQuantity,
      totalOriginalAmount,
      discountAmount: saving,
      finalPrice,
      effectiveRate,
      discountSteps,
      calculationText,
      mode,
    });
  };

  /* =======================================================
     RESET
  ======================================================= */

  const reset = () => {
    setPrice("");
    setQuantity("1");

    setDiscountRate("");
    setDiscountRate2("");
    setDiscountRate3("");

    setSlab1Qty("1");
    setSlab1Rate("10");

    setSlab2Qty("2");
    setSlab2Rate("15");

    setSlab3Qty("3");
    setSlab3Rate("20");

    setResult(null);
    setError("");
    setCopied(false);
    setPdfMessage("");
  };

  /* =======================================================
     MODE CHANGE
  ======================================================= */

  const changeMode = (newMode) => {
    setMode(newMode);

    setPrice("");
    setQuantity("1");

    setDiscountRate("");
    setDiscountRate2("");
    setDiscountRate3("");

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
        "Discount Calculator",
        "",
        activeMode.title,
        "",
        `Original Price: ${currency(
          result.originalPrice
        )}`,
        `Quantity: ${formatNumber(
          result.quantity
        )}`,
        `Total Original Amount: ${currency(
          result.totalOriginalAmount
        )}`,
        `Effective Discount: ${formatNumber(
          result.effectiveRate
        )}%`,
        "",
        `Discount / Saving: ${currency(
          result.discountAmount
        )}`,
        `Final Price: ${currency(
          result.finalPrice
        )}`,
        "",
        `Formula: ${result.calculationText}`,
      ].join("\n")
    : "";

  /* =======================================================
     EXPORT CANVAS
     
     IMPORTANT:
     html2canvas is imported directly above.
     Do NOT check window.html2canvas.
  ======================================================= */

  const createResultCanvas = async () => {
    const element =
      document.getElementById(
        "discount-result-export"
      );

    if (!element) {
      throw new Error(
        "Result element not found."
      );
    }

    /*
      Small delay helps the browser finish
      rendering fonts/layout before capture.
    */
    await new Promise((resolve) =>
      requestAnimationFrame(resolve)
    );

    const canvas =
      await html2canvas(element, {
        scale: Math.min(
          2,
          window.devicePixelRatio || 1.5
        ),
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: false,
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
      });

    return canvas;
  };

  /* =======================================================
     COPY AS IMAGE
  ======================================================= */

  const copyResult = async () => {
    if (!result) return;

    setError("");
    setPdfMessage("");

    try {
      const canvas =
        await createResultCanvas();

      const blob =
        await new Promise((resolve) =>
          canvas.toBlob(
            resolve,
            "image/png",
            1
          )
        );

      if (!blob) {
        throw new Error(
          "Unable to create result image."
        );
      }

      /*
        Modern browser:
        Copy PNG directly to clipboard.
      */
      if (
        navigator.clipboard &&
        window.ClipboardItem
      ) {
        const item =
          new ClipboardItem({
            "image/png": blob,
          });

        await navigator.clipboard.write([
          item,
        ]);

        setCopied(true);

        window.setTimeout(() => {
          setCopied(false);
        }, 2200);

        return;
      }

      /*
        Fallback:
        If clipboard image API is unavailable,
        download the exact captured image.
      */
      const url =
        URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = url;
      anchor.download =
        "AgeVerse-Discount-Result.png";

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2200);
    } catch (error) {
      console.error(
        "Copy image error:",
        error
      );

      setError(
        "Unable to copy result image. Please try again."
      );
    }
  };

  /* =======================================================
     PDF BYTE HELPERS
  ======================================================= */

  const stringToBytes = (text) => {
    return new TextEncoder().encode(text);
  };

  const concatBytes = (...arrays) => {
    const totalLength =
      arrays.reduce(
        (total, array) =>
          total + array.length,
        0
      );

    const resultArray =
      new Uint8Array(totalLength);

    let offset = 0;

    arrays.forEach((array) => {
      resultArray.set(
        array,
        offset
      );

      offset += array.length;
    });

    return resultArray;
  };

  /* =======================================================
     PDF CREATOR
     
     This creates a proper one-page A4 PDF.
     JPEG bytes remain binary bytes.
     No TextDecoder corruption.
  ======================================================= */

  const createPdfBlob = async () => {
    if (!result) return null;

    try {
      const canvas =
        await createResultCanvas();

      const imageData =
        canvas.toDataURL(
          "image/jpeg",
          0.95
        );

      const base64 =
        imageData.split(",")[1];

      const binaryString =
        atob(base64);

      const imageBytes =
        new Uint8Array(
          binaryString.length
        );

      for (
        let i = 0;
        i < binaryString.length;
        i++
      ) {
        imageBytes[i] =
          binaryString.charCodeAt(i);
      }

      /*
        A4 page in PDF points.
      */
      const pageWidth = 595.28;
      const pageHeight = 841.89;

      const margin = 25;

      const availableWidth =
        pageWidth - margin * 2;

      const availableHeight =
        pageHeight - margin * 2;

      const imageRatio =
        canvas.width /
        canvas.height;

      let imageWidth =
        availableWidth;

      let imageHeight =
        imageWidth /
        imageRatio;

      if (
        imageHeight >
        availableHeight
      ) {
        imageHeight =
          availableHeight;

        imageWidth =
          imageHeight *
          imageRatio;
      }

      const x =
        (pageWidth -
          imageWidth) /
        2;

      const y =
        (pageHeight -
          imageHeight) /
        2;

      /*
        PDF content stream.
      */
      const contentStream =
        `q\n` +
        `${imageWidth.toFixed(4)} 0 0 ${imageHeight.toFixed(
          4
        )} ${x.toFixed(4)} ${y.toFixed(
          4
        )} cm\n` +
        `/Im1 Do\n` +
        `Q\n`;

      /*
        PDF objects except image.
      */
      const object1 =
        `1 0 obj\n` +
        `<< /Type /Catalog /Pages 2 0 R >>\n` +
        `endobj\n`;

      const object2 =
        `2 0 obj\n` +
        `<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n` +
        `endobj\n`;

      const object3 =
        `3 0 obj\n` +
        `<< /Type /Page /Parent 2 0 R ` +
        `/MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
        `/Resources << /ProcSet [/PDF /ImageC] ` +
        `/XObject << /Im1 5 0 R >> >> ` +
        `/Contents 4 0 R >>\n` +
        `endobj\n`;

      const contentBytes =
        stringToBytes(
          contentStream
        );

      const object4Header =
        `4 0 obj\n` +
        `<< /Length ${contentBytes.length} >>\n` +
        `stream\n`;

      const object4Footer =
        `\nendstream\n` +
        `endobj\n`;

      const object5Header =
        `5 0 obj\n` +
        `<< /Type /XObject ` +
        `/Subtype /Image ` +
        `/Width ${canvas.width} ` +
        `/Height ${canvas.height} ` +
        `/ColorSpace /DeviceRGB ` +
        `/BitsPerComponent 8 ` +
        `/Filter /DCTDecode ` +
        `/Length ${imageBytes.length} >>\n` +
        `stream\n`;

      const object5Footer =
        `\nendstream\n` +
        `endobj\n`;

      /*
        PDF header.
      */
      const header =
        stringToBytes(
          "%PDF-1.4\n%\xFF\xFF\xFF\xFF\n"
        );

      /*
        Build object 1–3 first.
      */
      const bytes1 =
        stringToBytes(object1);

      const bytes2 =
        stringToBytes(object2);

      const bytes3 =
        stringToBytes(object3);

      /*
        Calculate byte offsets.
        IMPORTANT:
        Offsets must be byte offsets,
        not JavaScript string lengths.
      */
      const offset1 =
        header.length;

      const offset2 =
        offset1 + bytes1.length;

      const offset3 =
        offset2 + bytes2.length;

      const object4HeaderBytes =
        stringToBytes(
          object4Header
        );

      const object4FooterBytes =
        stringToBytes(
          object4Footer
        );

      const offset4 =
        offset3 +
        bytes3.length;

      const offset5 =
        offset4 +
        object4HeaderBytes.length +
        contentBytes.length +
        object4FooterBytes.length;

      const object5HeaderBytes =
        stringToBytes(
          object5Header
        );

      const object5FooterBytes =
        stringToBytes(
          object5Footer
        );

      /*
        XREF starts after object 5.
      */
      const xrefOffset =
        offset5 +
        object5HeaderBytes.length +
        imageBytes.length +
        object5FooterBytes.length;

      const xref =
        `xref\n` +
        `0 6\n` +
        `0000000000 65535 f \n` +
        `${String(offset1).padStart(
          10,
          "0"
        )} 00000 n \n` +
        `${String(offset2).padStart(
          10,
          "0"
        )} 00000 n \n` +
        `${String(offset3).padStart(
          10,
          "0"
        )} 00000 n \n` +
        `${String(offset4).padStart(
          10,
          "0"
        )} 00000 n \n` +
        `${String(offset5).padStart(
          10,
          "0"
        )} 00000 n \n`;

      const trailer =
        `trailer\n` +
        `<< /Size 6 /Root 1 0 R >>\n` +
        `startxref\n` +
        `${xrefOffset}\n` +
        `%%EOF\n`;

      /*
        Assemble the PDF entirely as bytes.
        This is the important fix for blank/corrupt PDFs.
      */
      const pdfBytes =
        concatBytes(
          header,

          bytes1,
          bytes2,
          bytes3,

          object4HeaderBytes,
          contentBytes,
          object4FooterBytes,

          object5HeaderBytes,
          imageBytes,
          object5FooterBytes,

          stringToBytes(xref),
          stringToBytes(trailer)
        );

      return new Blob(
        [pdfBytes],
        {
          type: "application/pdf",
        }
      );
    } catch (error) {
      console.error(
        "PDF creation error:",
        error
      );

      throw error;
    }
  };

  /* =======================================================
     DOWNLOAD PDF
  ======================================================= */

  const downloadPdf = async () => {
    if (!result) return;

    setError("");
    setPdfMessage("");

    try {
      const blob =
        await createPdfBlob();

      if (!blob) {
        throw new Error(
          "PDF blob not created."
        );
      }

      const url =
        URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = url;

      anchor.download =
        "AgeVerse-Discount-Calculator-Result.pdf";

      document.body.appendChild(anchor);

      anchor.click();

      anchor.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      setPdfMessage(
        "PDF downloaded successfully."
      );
    } catch (error) {
      console.error(
        "Download PDF error:",
        error
      );

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

    setError("");
    setPdfMessage("");

    try {
      const blob =
        await createPdfBlob();

      if (!blob) {
        throw new Error(
          "PDF blob not created."
        );
      }

      const file =
        new File(
          [blob],
          "AgeVerse-Discount-Calculator-Result.pdf",
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
            "AgeVerse.Global — Discount Calculator",
          text:
            "Discount Calculator Result",
          files: [file],
        });

        return;
      }

      setPdfMessage(
        "PDF sharing is not supported on this device."
      );
    } catch (error) {
      console.error(
        "Share PDF error:",
        error
      );

      if (
        error?.name ===
        "AbortError"
      ) {
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
    <main className="discount-calculator-page">
      <div className="discount-calculator-layout">

        {/* =================================================
            INPUT CARD
        ================================================= */}

        <section className="discount-calculator-card">

          <div className="discount-calculator-header">

            <div className="discount-calculator-icon">
              🏷️
            </div>

            <div>
              <h1>
                Discount Calculator
              </h1>

              <p>
                Calculate discount, savings and
                final selling price quickly.
              </p>
            </div>

          </div>

          {/* MODE */}

          <div className="discount-calculator-mode-section">

            <label htmlFor="discountMode">
              Calculation Type
            </label>

            <select
              id="discountMode"
              value={mode}
              onChange={(event) =>
                changeMode(
                  event.target.value
                )
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

          <div className="discount-calculator-description">

            <span>
              💡
            </span>

            <span>
              {activeMode.description}
            </span>

          </div>

          {/* PRICE */}

          <div className="discount-calculator-field">

            <label htmlFor="discountPrice">
              Original / Marked Price
            </label>

            <input
              id="discountPrice"
              type="number"
              inputMode="decimal"
              min="0"
              value={price}
              placeholder={t("Currency Placeholder")}
              onChange={(event) =>
                setPrice(
                  event.target.value
                )
              }
            />

          </div>

          {/* QUANTITY */}

          <div className="discount-calculator-field">

            <label htmlFor="discountQuantity">
              Quantity
            </label>

            <input
              id="discountQuantity"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) =>
                setQuantity(
                  event.target.value
                )
              }
            />

          </div>

          {/* =================================================
              SINGLE DISCOUNT
          ================================================= */}

          {mode === "single" && (
            <div className="discount-calculator-field">

              <label htmlFor="discountRate">
                Discount (%)
              </label>

              <input
                id="discountRate"
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                value={discountRate}
                placeholder={t("Percentage Placeholder")}
                onChange={(event) =>
                  setDiscountRate(
                    event.target.value
                  )
                }
              />

            </div>
          )}

          {/* =================================================
              MULTIPLE DISCOUNT
          ================================================= */}

          {mode === "multiple" && (
            <div className="discount-multiple-section">

              <div className="discount-section-heading">
                🔢 Sequential Discounts
              </div>

              <div className="discount-rate-row">

                <div>
                  <label>
                    Discount 1 (%)
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountRate}
                    placeholder={t("Percentage Placeholder")}
                    onChange={(event) =>
                      setDiscountRate(
                        event.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label>
                    Discount 2 (%)
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountRate2}
                    placeholder={t("Percentage Placeholder")}
                    onChange={(event) =>
                      setDiscountRate2(
                        event.target.value
                      )
                    }
                  />
                </div>

              </div>

              <div className="discount-calculator-field">

                <label>
                  Discount 3 (%) — Optional
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountRate3}
                  placeholder="Optional"
                  onChange={(event) =>
                    setDiscountRate3(
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="discount-helper">
                Example: 20% followed by 10% is
                applied sequentially, not as a simple
                30% discount.
              </div>

            </div>
          )}

          {/* =================================================
              QUANTITY DISCOUNT
          ================================================= */}

          {mode === "quantity" && (
            <div className="discount-quantity-section">

              <div className="discount-section-heading">
                🛒 Quantity-Based Discount Slabs
              </div>

              <div className="discount-slab">

                <div className="discount-slab-title">
                  Slab 1
                </div>

                <div className="discount-rate-row">

                  <div>
                    <label>
                      From Quantity
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={slab1Qty}
                      onChange={(event) =>
                        setSlab1Qty(
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label>
                      Discount (%)
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={slab1Rate}
                      onChange={(event) =>
                        setSlab1Rate(
                          event.target.value
                        )
                      }
                    />
                  </div>

                </div>

              </div>

              <div className="discount-slab">

                <div className="discount-slab-title">
                  Slab 2
                </div>

                <div className="discount-rate-row">

                  <div>
                    <label>
                      From Quantity
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={slab2Qty}
                      onChange={(event) =>
                        setSlab2Qty(
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label>
                      Discount (%)
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={slab2Rate}
                      onChange={(event) =>
                        setSlab2Rate(
                          event.target.value
                        )
                      }
                    />
                  </div>

                </div>

              </div>

              <div className="discount-slab">

                <div className="discount-slab-title">
                  Slab 3
                </div>

                <div className="discount-rate-row">

                  <div>
                    <label>
                      From Quantity
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={slab3Qty}
                      onChange={(event) =>
                        setSlab3Qty(
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label>
                      Discount (%)
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={slab3Rate}
                      onChange={(event) =>
                        setSlab3Rate(
                          event.target.value
                        )
                      }
                    />
                  </div>

                </div>

              </div>

              <div className="discount-helper">
                Example: 1 item → 10%, 2 items →
                15%, 3 or more items → 20%.
              </div>

            </div>
          )}

          {/* ERROR */}

          {error && (
            <div
              className="discount-calculator-error"
              role="alert"
            >
              ⚠️ {error}
            </div>
          )}

          {/* BUTTONS */}

          <div className="discount-calculator-buttons">

            <button
              type="button"
              className="discount-calculator-calculate"
              onClick={calculate}
            >
              🧮 Calculate
            </button>

            <button
              type="button"
              className="discount-calculator-reset"
              onClick={reset}
            >
              🔄 Reset
            </button>

          </div>

          {/* TIP */}

          <div className="discount-calculator-info">

            <div className="discount-calculator-info-title">
              💡 Quick Tip
            </div>

            <p>
              For sequential discounts, each discount
              is calculated on the price remaining after
              the previous discount.
            </p>

          </div>

        </section>

        {/* =================================================
            RESULT
        ================================================= */}

        <section className="discount-calculator-result-section">

          {!result ? (

            <div className="discount-calculator-empty-result">

              <div className="discount-calculator-empty-icon">
                🏷️
              </div>

              <h2>
                Your Result Will Appear Here
              </h2>

              <p>
                Enter the price, choose the discount
                type and tap
                <strong> Calculate </strong>
                to see your complete result.
              </p>

              <div className="discount-calculator-empty-points">
                <span>⚡ Fast</span>
                <span>✓ Accurate</span>
                <span>💰 Savings</span>
              </div>

            </div>

          ) : (

            <div
              className="discount-calculator-result-card"
              id="discount-result-export"
            >

              {/* HEADER */}

              <div className="discount-calculator-result-header">

                <div className="discount-calculator-result-icon">
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

              {/* INPUT */}

              <div className="discount-input-summary">

                <div className="discount-section-heading">
                  🧾 Input Details
                </div>

                <div className="discount-input-summary-grid">

                  <div className="discount-summary-item">
                    <span>
                      Original Price
                    </span>

                    <strong>
                      {currency(
                        result.originalPrice
                      )}
                    </strong>
                  </div>

                  <div className="discount-summary-item">
                    <span>
                      Quantity
                    </span>

                    <strong>
                      {formatNumber(
                        result.quantity
                      )}
                    </strong>
                  </div>

                  <div className="discount-summary-item">
                    <span>
                      Total Original
                    </span>

                    <strong>
                      {currency(
                        result.totalOriginalAmount
                      )}
                    </strong>
                  </div>

                  <div className="discount-summary-item">
                    <span>
                      Effective Discount
                    </span>

                    <strong>
                      {formatNumber(
                        result.effectiveRate
                      )}%
                    </strong>
                  </div>

                </div>

              </div>

              {/* MAIN RESULT */}

              <div className="discount-main-result">

                <span>
                  Final Selling Price
                </span>

                <strong>
                  {currency(
                    result.finalPrice
                  )}
                </strong>

                <small>
                  ✓ Amount after discount
                </small>

              </div>

              {/* SAVING */}

              <div className="discount-saving-card">

                <div>
                  <span>
                    💰 Total Saving
                  </span>

                  <strong>
                    {currency(
                      result.discountAmount
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    📉 Discount
                  </span>

                  <strong>
                    {formatNumber(
                      result.effectiveRate
                    )}%
                  </strong>
                </div>

              </div>

              {/* BREAKDOWN */}

              <div className="discount-breakdown">

                <div className="discount-section-heading">
                  🧮 Calculation Breakdown
                </div>

                {result.discountSteps.map(
                  (step, index) => (
                    <div
                      className="discount-breakdown-row"
                      key={index}
                    >

                      <div>
                        <span>
                          {step.label}
                        </span>

                        <strong>
                          {formatNumber(
                            step.rate
                          )}%
                        </strong>
                      </div>

                      <div>
                        <span>
                          Before
                        </span>

                        <strong>
                          {currency(
                            step.before
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Saving
                        </span>

                        <strong>
                          {currency(
                            step.amount
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          After
                        </span>

                        <strong>
                          {currency(
                            step.after
                          )}
                        </strong>
                      </div>

                    </div>
                  )
                )}

              </div>

              {/* FLOW */}

              <div className="discount-calculation-flow">

                <div className="discount-section-heading">
                  📊 Price Flow
                </div>

                <div className="discount-flow-box">

                  <div className="discount-flow-item">
                    <span>
                      Original
                    </span>

                    <strong>
                      {currency(
                        result.totalOriginalAmount
                      )}
                    </strong>
                  </div>

                  <div className="discount-flow-operator">
                    −
                  </div>

                  <div className="discount-flow-item">
                    <span>
                      Saving
                    </span>

                    <strong>
                      {currency(
                        result.discountAmount
                      )}
                    </strong>
                  </div>

                  <div className="discount-flow-arrow">
                    ↓
                  </div>

                  <div className="discount-flow-result">
                    <span>
                      Final Price
                    </span>

                    <strong>
                      {currency(
                        result.finalPrice
                      )}
                    </strong>
                  </div>

                </div>

              </div>

              {/* FORMULA */}

              <div className="discount-equation">

                <div>
                  📐 Formula
                </div>

                <strong>
                  {result.calculationText}
                </strong>

              </div>

              {/* NOTE */}

              <div className="discount-important">

                <strong>
                  ℹ️ Calculation Note
                </strong>

                <p>
                  The final price is calculated after
                  applying the selected discount method.
                  Sequential discounts are applied one
                  after another, while quantity discounts
                  use the applicable quantity slab.
                </p>

              </div>

              {/* ACTIONS */}

              <div className="discount-result-actions">

                <button
                  type="button"
                  onClick={copyResult}
                  className="discount-action-copy"
                >
                  📋 Copy Image
                </button>

                <button
                  type="button"
                  onClick={downloadPdf}
                  className="discount-action-pdf"
                >
                  📄 Download PDF
                </button>

                <button
                  type="button"
                  onClick={sharePdf}
                  className="discount-action-share"
                >
                  📤 Share PDF
                </button>

                <button
                  type="button"
                  onClick={printResult}
                  className="discount-action-print"
                >
                  🖨️ Print
                </button>

                <button
                  type="button"
                  onClick={reset}
                  className="discount-action-new"
                >
                  🔄 New
                </button>

              </div>

              {copied && (
                <div className="discount-action-message">
                  ✓ Result image copied successfully.
                </div>
              )}

              {pdfMessage && (
                <div className="discount-pdf-message">
                  {pdfMessage}
                </div>
              )}

              {/* FOOTER */}

              <div className="discount-result-footer">
        <ResultAttribution type="generated" />
      </div>

            </div>
          )}

        </section>

      </div>
    </main>
  );
};

export default DiscountCalculator;