import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const A4 = {
  width: 210,
  height: 297,
  margin: 8,
};

function getSafeName(name = "AgeVerse_Result") {
  return String(name)
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 80) || "AgeVerse_Result";
}

async function withExportState(target, task) {
  if (!target) {
    throw new Error("Result area not found.");
  }

  const root = document.documentElement;
  const previous = {
    exporting: root.classList.contains("ageverse-exporting"),
    target: target.classList.contains("ageverse-export-target"),
  };

  root.classList.add("ageverse-exporting");
  target.classList.add("ageverse-export-target");

  try {
    // Let layout settle after hiding action controls.
    await new Promise((resolve) =>
      requestAnimationFrame(() =>
        requestAnimationFrame(resolve)
      )
    );

    return await task();
  } finally {
    if (!previous.exporting) {
      root.classList.remove("ageverse-exporting");
    }

    if (!previous.target) {
      target.classList.remove("ageverse-export-target");
    }
  }
}

export async function renderResultCanvas(target) {
  return withExportState(target, () =>
    html2canvas(target, {
      backgroundColor: null,
      scale: Math.min(2, window.devicePixelRatio || 1.5),
      useCORS: true,
      logging: false,
      imageTimeout: 15000,
      scrollX: 0,
      scrollY: -window.scrollY,
    })
  );
}

export async function createResultImageBlob(target, type = "image/png") {
  const canvas = await renderResultCanvas(target);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Unable to create result image."));
    }, type, type === "image/jpeg" ? 0.95 : undefined);
  });
}

export async function createResultPdfBlob(target) {
  const canvas = await renderResultCanvas(target);

  const imageData = canvas.toDataURL("image/png", 1.0);

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidth = A4.width - A4.margin * 2;
const pageHeight = A4.height - A4.margin * 2;

const ratio = canvas.width / canvas.height;

let width = pageWidth;
let height = width / ratio;

if (height > pageHeight) {
  height = pageHeight;
  width = height * ratio;
}

const x = (A4.width - width) / 2;

// Keep result near top
const y = A4.margin;

  pdf.addImage(imageData, "PNG", x, y, width, height, undefined, "FAST");

  return pdf.output("blob");
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyResultImage(target) {
  const blob = await createResultImageBlob(target, "image/png");

  if (
    navigator.clipboard &&
    typeof ClipboardItem !== "undefined" &&
    window.isSecureContext
  ) {
    const item = new ClipboardItem({
      "image/png": blob,
    });

    await navigator.clipboard.write([item]);
    return "copied";
  }

  downloadBlob(blob, "AgeVerse_Result.png");
  return "downloaded";
}

export async function downloadResultPdf(target, fileName = "AgeVerse_Result.pdf") {
  const blob = await createResultPdfBlob(target);
  downloadBlob(blob, fileName);
  return blob;
}

export async function shareResultPdf(
  target,
  fileName = "AgeVerse_Result.pdf",
  shareTitle = "AgeVerse Result"
) {
  const blob = await createResultPdfBlob(target);

  const file = new File([blob], fileName, {
    type: "application/pdf",
  });

  if (
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({
      title: shareTitle,
      files: [file],
    });

    return blob;
  }

  downloadBlob(blob, fileName);
  return blob;
}

export async function printResultPdf(target) {
  const blob = await createResultPdfBlob(target);
  const url = URL.createObjectURL(blob);

  const printWindow = window.open(url, "_blank");

  if (!printWindow) {
    URL.revokeObjectURL(url);
    throw new Error("Please allow pop-ups to print the result PDF.");
  }

  // The browser's native PDF viewer owns the PDF document. Opening the
  // generated PDF is intentionally used for printing so Download and Print
  // share the exact same A4 PDF output.
  setTimeout(() => {
    try {
      printWindow.focus();
      printWindow.print();
    } catch {
      // The PDF is already open and can be printed with Ctrl+P.
    }

    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }, 1200);

  return blob;
}

export { getSafeName };
