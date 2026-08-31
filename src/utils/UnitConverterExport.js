/* =========================================================
   AGEVERSE — UNIT CONVERTER EXPORT
   Common Canvas + Copy Image + PDF Download + PDF Share
========================================================= */

import jsPDF from "jspdf";
import html2canvas from "html2canvas";


/* =========================================================
   CLEAN CLONE
========================================================= */

function getCleanClone(element) {

  const clone =
    element.cloneNode(true);

  const actions =
    clone.querySelector(
      ".unit-converter-result-actions"
    );

  if (actions) {
    actions.remove();
  }

  const message =
    clone.querySelector(
      ".unit-converter-action-message"
    );

  if (message) {
    message.remove();
  }

  return clone;
}


/* =========================================================
   COMMON CANVAS
   PDF + PRINT + IMAGE ALL USE THIS
========================================================= */

export async function createUnitConverterCanvas(
  element
) {

  if (!element) {
    throw new Error(
      "Unit Converter result element not found."
    );
  }


  const clone =
    getCleanClone(element);


  const wrapper =
    document.createElement("div");


  wrapper.style.position =
    "fixed";

  wrapper.style.left =
    "-10000px";

  wrapper.style.top =
    "0";

  wrapper.style.width =
    `${Math.max(
      element.scrollWidth,
      760
    )}px`;

  wrapper.style.background =
    "#ffffff";

  wrapper.style.padding =
    "0";

  wrapper.style.margin =
    "0";

  wrapper.style.zIndex =
    "-9999";

  wrapper.style.pointerEvents =
    "none";


  wrapper.appendChild(
    clone
  );


  document.body.appendChild(
    wrapper
  );


  try {

    /*
      Give browser enough time to apply
      cloned layout and styles.
    */

    await new Promise(
      (resolve) => {

        requestAnimationFrame(() => {

          requestAnimationFrame(() => {

            setTimeout(
              resolve,
              80
            );

          });

        });

      }
    );


    const canvas =
      await html2canvas(
        clone,
        {
          scale: 2,

          useCORS: true,

          allowTaint: true,

          backgroundColor:
            "#ffffff",

          logging: false,

          imageTimeout: 15000,

          removeContainer: true,

          scrollX: 0,

          scrollY: 0,

          windowWidth:
            clone.scrollWidth,

          windowHeight:
            clone.scrollHeight,
        }
      );


    return canvas;

  } finally {

    wrapper.remove();

  }

}


/* =========================================================
   CANVAS → A4 PDF
========================================================= */

function canvasToPDF(
  canvas
) {

  const pdf =
    new jsPDF({
      orientation:
        "portrait",

      unit:
        "mm",

      format:
        "a4",

      compress:
        true,
    });


  const pageWidth =
    pdf.internal.pageSize.getWidth();

  const pageHeight =
    pdf.internal.pageSize.getHeight();


  const margin =
    8;


  const availableWidth =
    pageWidth -
    margin * 2;


  const availableHeight =
    pageHeight -
    margin * 2;


  const ratio =
    canvas.height /
    canvas.width;


  let imageWidth =
    availableWidth;


  let imageHeight =
    imageWidth *
    ratio;


  /*
    Never create a second page.
    Fit the complete result into one A4.
  */

  if (
    imageHeight >
    availableHeight
  ) {

    imageHeight =
      availableHeight;

    imageWidth =
      imageHeight /
      ratio;

  }


  /*
    Horizontally centered.
    NOT vertically centered.
  */

  const x =
    (
      pageWidth -
      imageWidth
    ) / 2;


  const y =
    margin;


  pdf.addImage(
    canvas,
    "PNG",
    x,
    y,
    imageWidth,
    imageHeight,
    undefined,
    "FAST"
  );


  return pdf;

}


/* =========================================================
   COPY RESULT IMAGE
========================================================= */

export async function copyUnitConverterImage(
  element
) {

  const canvas =
    await createUnitConverterCanvas(
      element
    );


  const blob =
    await new Promise(
      (resolve) => {

        canvas.toBlob(
          resolve,
          "image/png",
          1
        );

      }
    );


  if (!blob) {

    throw new Error(
      "Unable to create result image."
    );

  }


  if (
    navigator.clipboard &&
    window.ClipboardItem &&
    window.isSecureContext
  ) {

    const item =
      new ClipboardItem({
        "image/png":
          blob,
      });


    await navigator.clipboard.write([
      item,
    ]);


    return true;

  }


  throw new Error(
    "Image clipboard is not supported by this browser."
  );

}


/* =========================================================
   DOWNLOAD PDF
========================================================= */

export async function downloadUnitConverterPDF(
  element
) {

  const canvas =
    await createUnitConverterCanvas(
      element
    );


  const pdf =
    canvasToPDF(
      canvas
    );


  pdf.save(
    "AgeVerse-Unit-Converter-Result.pdf"
  );

}


/* =========================================================
   CREATE PDF BLOB
========================================================= */

export async function createUnitConverterPDFBlob(
  element
) {

  const canvas =
    await createUnitConverterCanvas(
      element
    );


  const pdf =
    canvasToPDF(
      canvas
    );


  return pdf.output(
    "blob"
  );

}


/* =========================================================
   SHARE PDF
========================================================= */

export async function shareUnitConverterPDF(
  element
) {

  const blob =
    await createUnitConverterPDFBlob(
      element
    );


  const file =
    new File(
      [
        blob,
      ],
      "AgeVerse-Unit-Converter-Result.pdf",
      {
        type:
          "application/pdf",
      }
    );


  /*
    Native file sharing
  */

  if (
    navigator.share &&
    (
      !navigator.canShare ||
      navigator.canShare({
        files: [
          file,
        ],
      })
    )
  ) {

    await navigator.share({

      title:
        "AgeVerse Unit Converter Result",

      text:
        "Unit conversion result generated by AgeVerse.Global",

      files: [
        file,
      ],

    });


    return true;

  }


  /*
    Fallback download
  */

  const url =
    URL.createObjectURL(
      blob
    );


  const anchor =
    document.createElement(
      "a"
    );


  anchor.href =
    url;


  anchor.download =
    "AgeVerse-Unit-Converter-Result.pdf";


  document.body.appendChild(
    anchor
  );


  anchor.click();


  anchor.remove();


  setTimeout(
    () => {
      URL.revokeObjectURL(
        url
      );
    },
    1000
  );


  return false;

}