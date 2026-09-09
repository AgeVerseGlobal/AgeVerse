import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const PDF_MARGIN = 8;
const A4 = {
  portrait: { width: 210, height: 297 },
  landscape: { width: 297, height: 210 },
};

function getSafeName(name = "AgeVerseGlobal_Result") {
  return String(name)
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 80) || "AgeVerseGlobal_Result";
}

function nextFrames(count = 2) {
  return new Promise((resolve) => {
    const step = (remaining) => {
      if (remaining <= 0) {
        resolve();
        return;
      }

      requestAnimationFrame(() => step(remaining - 1));
    };

    step(count);
  });
}

async function waitForTargetImages(target) {
  const images = [...target.querySelectorAll("img")];

  await Promise.all(
    images.map((image) => {
      if (image.complete && image.naturalWidth > 0) {
        return image.decode?.().catch(() => undefined);
      }

      return new Promise((resolve) => {
        const done = () => resolve();
        image.addEventListener("load", done, { once: true });
        image.addEventListener("error", done, { once: true });
      });
    })
  );
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
    await nextFrames(2);

    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    await waitForTargetImages(target);
    await nextFrames(1);

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
      // An explicit opaque canvas avoids faded-looking transparent pixels
      // in generated PDFs while preserving the card's own painted styles.
      backgroundColor: "#ffffff",
      scale: Math.min(2, window.devicePixelRatio || 1.5),
      useCORS: true,
      logging: false,
      imageTimeout: 15000,
      scrollX: 0,
      scrollY: -window.scrollY,
      windowWidth: document.documentElement.clientWidth,
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

function createPdfForCanvas(canvas) {
  const ratio = canvas.width / canvas.height;
  const isWide = canvas.width >= canvas.height;

  let pdf;
  let pageWidth;
  let pageHeight;
  let width;
  let height;

  if (isWide) {
    // Wide results are the only case that is scaled to fit a standard page.
    pageWidth = A4.landscape.width;
    pageHeight = A4.landscape.height;

    pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const maxWidth = pageWidth - PDF_MARGIN * 2;
    const maxHeight = pageHeight - PDF_MARGIN * 2;

    width = maxWidth;
    height = width / ratio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * ratio;
    }
  } else {
    // Tall results keep their natural length. The PDF page height grows with
    // the result instead of shrinking it to one A4 page, preventing a tiny
    // export and avoiding accidental blank overflow pages.
    pageWidth = A4.portrait.width;
    const maxWidth = pageWidth - PDF_MARGIN * 2;

    width = maxWidth;
    height = width / ratio;
    pageHeight = Math.max(height + PDF_MARGIN * 2, PDF_MARGIN * 2 + 1);

    pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [pageWidth, pageHeight],
      compress: true,
    });
  }

  const x = (pageWidth - width) / 2;
  const y = PDF_MARGIN;

  pdf.addImage(
    canvas.toDataURL("image/png", 1.0),
    "PNG",
    x,
    y,
    width,
    height,
    undefined,
    "FAST"
  );

  return pdf;
}

export async function createResultPdfBlob(target) {
  const canvas = await renderResultCanvas(target);
  const pdf = createPdfForCanvas(canvas);

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

  downloadBlob(blob, "AgeVerseGlobal_Result.png");
  return "downloaded";
}

export async function downloadResultPdf(target, fileName = "AgeVerseGlobal_Result.pdf") {
  const blob = await createResultPdfBlob(target);
  downloadBlob(blob, fileName);
  return blob;
}

export async function shareResultPdf(
  target,
  fileName = "AgeVerseGlobal_Result.pdf",
  shareTitle = "AgeVerseGlobal Result"
) {
  const blob = await createResultPdfBlob(target);
  const file = new File([blob], fileName, {
    type: "application/pdf",
  });

  if (typeof navigator.share !== "function") {
    // Some mobile browsers/webviews do not expose the Web Share API.
    // There is no permission that can enable navigator.share in those
    // environments, so provide a useful, gesture-safe fallback instead of
    // showing a hard error: copy the current result URL for pasting into any
    // messaging/social app.
    if (
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function" &&
      window.isSecureContext
    ) {
      await navigator.clipboard.writeText(window.location.href);
      return { mode: "link-copied" };
    }

    // If clipboard access is also unavailable, keep the generated PDF useful.
    downloadBlob(blob, fileName);
    return { mode: "downloaded" };
  }

  const canShareFiles =
    typeof navigator.canShare !== "function" ||
    navigator.canShare({ files: [file] });

  if (canShareFiles) {
    try {
      await navigator.share({
        title: shareTitle,
        files: [file],
      });

      return { mode: "shared" };
    } catch (error) {
      // A user cancelling the native sheet must remain a cancellation.
      if (error?.name === "AbortError") {
        throw error;
      }

      // Some browsers report file sharing support optimistically. Fall back
      // to the native URL/text sheet below rather than downloading the PDF.
    }
  }

  // Some mobile browsers expose Web Share but cannot attach files. Use the
  // native share sheet with the result page URL instead of silently downloading.
  await navigator.share({
    title: shareTitle,
    text: shareTitle,
    url: window.location.href,
  });

  return { mode: "shared" };
}

export async function printResultPdf(target) {
  const blob = await createResultPdfBlob(target);
  const url = URL.createObjectURL(blob);

  const printWindow = window.open(url, "_blank");

  if (!printWindow) {
    URL.revokeObjectURL(url);
    throw new Error("Please allow pop-ups to print the result PDF.");
  }

  setTimeout(() => {
    try {
      printWindow.focus();
      printWindow.print();
    } catch {
      // The generated PDF is already open and can still be printed manually.
    }

    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }, 1200);

  return blob;
}

export { getSafeName };
