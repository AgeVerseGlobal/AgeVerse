import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import "../styles/RetirementResultCard.css";
import { formatLocalizedDate, formatLocalizedWeekday } from "../utils/localizedDate";

import ResultAttribution from "./ResultAttribution";
function RetirementResultCard({ result }) {
  if (!result) {
    return null;
  }

  /* =========================================================
     DOB FORMAT
     Example:
     July 28, 2026 (Tuesday)
     ========================================================= */

  function formatBirthDate(dateString) {
    if (!dateString) {
      return "N/A";
    }

    const parts = dateString.split("-");

    if (parts.length !== 3) {
      return dateString;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    const date = new Date(
      year,
      month - 1,
      day
    );

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    const formattedDate = formatLocalizedDate(date, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const weekday = formatLocalizedWeekday(date);

    return `${formattedDate} (${weekday})`;
  }


  /* =========================================================
     SHARE
     ========================================================= */

  async function handleShare() {
    const shareText = `
AgeVerse — Retirement Result

Date of Birth: ${result.birthDate || "N/A"}
Retirement Date: ${result.retirementDate}
Retirement Day: ${result.retirementDay}

Remaining Period:
${result.years} Years
${result.months} Months
${result.days} Days

${result.wishingMessage || ""}
    `.trim();

    try {
      if (navigator.share) {
        await navigator.share({
          title: "AgeVerse — Retirement Result",
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);

        alert(
          "Result copied. You can share it anywhere."
        );
      }
    } catch (error) {
      console.log(
        "Share cancelled:",
        error
      );
    }
  }


  /* =========================================================
     COPY
     ========================================================= */

  async function handleCopy() {
    const copyText = `
AgeVerse — Retirement Result

Date of Birth: ${result.birthDate || "N/A"}
Retirement Date: ${result.retirementDate}
Retirement Day: ${result.retirementDay}

Remaining Period:
${result.years} Years, ${result.months} Months, ${result.days} Days

Live Countdown:
${result.hours} Hours, ${result.minutes} Minutes, ${result.seconds} Seconds

${result.wishingMessage || ""}
    `.trim();

    try {
      await navigator.clipboard.writeText(
        copyText
      );

      alert(
        "Retirement result copied successfully."
      );
    } catch (error) {
      console.error(
        "Copy failed:",
        error
      );

      alert(
        "Unable to copy the result."
      );
    }
  }


  /* =========================================================
     CREATE CANVAS
     ========================================================= */

  async function createRetirementCanvas() {
    const element =
      document.getElementById(
        "retirement-result-print-area"
      );

    if (!element) {
      throw new Error(
        "Retirement result element not found."
      );
    }

    element.classList.add(
      "retirement-pdf-mode"
    );

    await new Promise((resolve) =>
      setTimeout(resolve, 150)
    );

    try {
      const canvas =
        await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
          logging: false,
          width: element.scrollWidth,
          height: element.scrollHeight,
          windowWidth:
            document.documentElement
              .clientWidth,
          windowHeight:
            document.documentElement
              .clientHeight,
        });

      return canvas;
    } finally {
      element.classList.remove(
        "retirement-pdf-mode"
      );
    }
  }


  /* =========================================================
     DOWNLOAD PDF
     ========================================================= */

  async function handleDownloadPDF() {
    try {
      const canvas =
        await createRetirementCanvas();

      const imageData =
        canvas.toDataURL(
          "image/png",
          1.0
        );

      const pdf =
        new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
          compress: true,
        });

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const marginTop = 12;
      const marginLeftRight = 10;
      const marginBottom = 10;

      const availableWidth =
        pageWidth -
        marginLeftRight * 2;

      const availableHeight =
        pageHeight -
        marginTop -
        marginBottom;

      const canvasRatio =
        canvas.width /
        canvas.height;

      let pdfWidth =
        availableWidth;

      let pdfHeight =
        pdfWidth /
        canvasRatio;

      if (
        pdfHeight >
        availableHeight
      ) {
        pdfHeight =
          availableHeight;

        pdfWidth =
          pdfHeight *
          canvasRatio;
      }

      const x =
        (pageWidth -
          pdfWidth) /
        2;

      const y =
        marginTop;

      pdf.addImage(
        imageData,
        "PNG",
        x,
        y,
        pdfWidth,
        pdfHeight,
        undefined,
        "FAST"
      );

      pdf.save(
        "AgeVerse-Retirement-Result.pdf"
      );

    } catch (error) {
      console.error(
        "PDF generation failed:",
        error
      );

      alert(
        "Unable to generate PDF. Please try again."
      );
    }
  }


  /* =========================================================
     PRINT
     ========================================================= */

  async function handlePrint() {
    try {
      const canvas =
        await createRetirementCanvas();

      const imageData =
        canvas.toDataURL(
          "image/png",
          1.0
        );

      const printWindow =
        window.open(
          "",
          "_blank",
          "width=900,height=1200"
        );

      if (!printWindow) {
        alert(
          "Please allow pop-ups to print the result."
        );

        return;
      }

      const printWidth =
        "190mm";

      printWindow.document.open();

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>

          <meta charset="UTF-8">

          <title>AgeVerse - Retirement Result</title>

          <style>

            @page {
              size: A4 portrait;
              margin: 10mm;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              width: 100%;
              background: #ffffff;
            }

            body {
              display: flex;
              justify-content: center;
              align-items: flex-start;
            }

            .ageverse-print-image {
              display: block;
              width: ${printWidth};
              height: auto;
              margin: 0 auto;
            }

            @media print {

              html,
              body {
                margin: 0;
                padding: 0;
                width: 100%;
                background: #ffffff;
              }

              .ageverse-print-image {
                display: block;
                width: ${printWidth};
                height: auto;
                margin: 0 auto;
              }

            }

          </style>

        </head>

        <body>

          <img
            class="ageverse-print-image"
            src="${imageData}"
            alt="AgeVerse Retirement Result"
          />

        </body>

        </html>
      `);

      printWindow.document.close();

      const printImage =
        printWindow.document.querySelector(
          ".ageverse-print-image"
        );

      if (printImage) {
        await new Promise((resolve) => {
          if (printImage.complete) {
            resolve();
          } else {
            printImage.onload =
              resolve;

            printImage.onerror =
              resolve;
          }
        });
      }

      setTimeout(() => {
        try {
          printWindow.focus();

          printWindow.print();

          printWindow.onafterprint =
            () => {
              printWindow.close();
            };

        } catch (error) {
          console.error(
            "Print failed:",
            error
          );
        }
      }, 300);

    } catch (error) {
      console.error(
        "Print generation failed:",
        error
      );

      alert(
        "Unable to print the result. Please try again."
      );
    }
  }


  return (
    <div
      id="retirement-result-print-area"
      className="retirement-result-card"
    >

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="retirement-result-header">

        <div className="retirement-result-icon">
          👴
        </div>

        <div className="retirement-result-title">

          <h2>
            Retirement Result
          </h2>

          <p>
            Your retirement planning summary
          </p>

        </div>

      </div>


      {/* =====================================================
          DATE OF BIRTH
          ===================================================== */}

      {result.birthDate && (
  <div className="retirement-dob-line">
    🎂 Date of Birth:{" "}
    <strong>
      {formatLocalizedDate(new Date(result.birthDate + "T00:00:00"), {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}
    </strong>

    <small className="retirement-dob-day">
      📌{" "}
      {new Date(
        result.birthDate + "T00:00:00"
      ) && formatLocalizedWeekday(new Date(result.birthDate + "T00:00:00"))}
    </small>
  </div>
)}


      {/* =====================================================
          RETIREMENT DATE
          ===================================================== */}

      <div className="retirement-date-panel">

        <span>
          📅 Retirement Date
        </span>

        <strong>
          {result.retirementDate}
        </strong>

        <small>
          📌 {result.retirementDay}
        </small>

      </div>


      {/* =====================================================
          COMPLETED
          ===================================================== */}

      {result.status === "completed" ? (

        <div className="retirement-completed">

          <div className="retirement-completed-icon">
            🎉
          </div>

          <h3>
            Retirement Completed
          </h3>

          <p>
            {result.message}
          </p>

          <div className="retirement-wish">
            {result.wishingMessage}
          </div>

        </div>

      ) : (

        <>

          {/* =================================================
              REMAINING PERIOD
              ================================================= */}

          <div className="retirement-section-title">
            ⏳ Remaining Period
          </div>

          <div className="retirement-countdown-grid">

            <div className="retirement-countdown-box">
              <strong>
                {result.years}
              </strong>

              <span>
                Years
              </span>
            </div>

            <div className="retirement-countdown-box">
              <strong>
                {result.months}
              </strong>

              <span>
                Months
              </span>
            </div>

            <div className="retirement-countdown-box">
              <strong>
                {result.days}
              </strong>

              <span>
                Days
              </span>
            </div>

          </div>


          {/* =================================================
              LIVE COUNTDOWN
              ================================================= */}

          <div className="retirement-section-title">
            ⏱ Live Countdown
          </div>

          <div className="retirement-time-row">

            <div>
              <strong>
                {result.hours}
              </strong>

              <span>
                Hours
              </span>
            </div>

            <div>
              <strong>
                {result.minutes}
              </strong>

              <span>
                Minutes
              </span>
            </div>

            <div>
              <strong>
                {result.seconds}
              </strong>

              <span>
                Seconds
              </span>
            </div>

          </div>


          {/* =================================================
              REMINDER
              ================================================= */}

          {result.reminderType !== "none" && (

            <div className="retirement-reminder-result">

              <div className="retirement-reminder-result-icon">
                🔔
              </div>

              <div>

                <span>
                  Reminder
                </span>

                <strong>

                  {result.reminderType === "on-day"
                    ? "Retirement Day"
                    : result.reminderType === "one-day-before"
                      ? "1 Day Before"
                      : result.reminderType === "custom"
                        ? `${result.customReminderDays} Days Before`
                        : "Reminder"}

                </strong>

                {result.reminderDate && (
                  <small>
                    📅 {result.reminderDate}
                  </small>
                )}

                <em>
                  Notification permission may be required
                  for browser reminders.
                </em>

              </div>

            </div>

          )}


          {/* =================================================
              WISH
              ================================================= */}

          <div className="retirement-wish">

            🌸{" "}
            <strong>
              Retirement Day Message
            </strong>

            <br />

            {result.wishingMessage}

          </div>

        </>

      )}


      {/* =====================================================
          ACTION BUTTONS
          ===================================================== */}

      <div className="retirement-result-actions">

        <button
          type="button"
          className="retirement-action share"
          onClick={handleShare}
        >
          📤 Share
        </button>


        <button
          type="button"
          className="retirement-action copy"
          onClick={handleCopy}
        >
          📋 Copy
        </button>


        <button
          type="button"
          className="retirement-action download"
          onClick={handleDownloadPDF}
        >
          📥 Download
        </button>


        <button
          type="button"
          className="retirement-action print"
          onClick={handlePrint}
        >
          🖨️ Print
        </button>

      </div>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <div className="retirement-result-footer">
        <ResultAttribution type="generated" />
      </div>

    </div>
  );
}

export default RetirementResultCard;