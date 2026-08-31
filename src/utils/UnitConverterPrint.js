/* =========================================================
   AGEVERSE — UNIT CONVERTER PRINT
   Uses the SAME CANVAS as PDF
   One-page A4 / Horizontal Center / Top Aligned
========================================================= */

import {
  createUnitConverterCanvas,
} from "./UnitConverterExport";


/* =========================================================
   PRINT RESULT
========================================================= */

export async function printUnitConverterResult(
  element
) {

  if (!element) {

    throw new Error(
      "Unit Converter result element not found."
    );

  }


  /*
    IMPORTANT:

    We do NOT clone the React result into a new
    HTML document anymore.

    We first create exactly the same canvas
    used by Download PDF.

    Therefore:

    PDF = Print = Same Result
  */

  const canvas =
    await createUnitConverterCanvas(
      element
    );


  const imageData =
    canvas.toDataURL(
      "image/png"
    );


  /*
    Open print window.
  */

  const printWindow =
    window.open(
      "",
      "_blank",
      "width=900,height=1000"
    );


  if (!printWindow) {

    throw new Error(
      "Unable to open print window. Please allow pop-ups."
    );

  }


  /*
    A4 dimensions:

    210mm × 297mm

    8mm margin

    Result is horizontally centered
    but starts from top.
  */

  printWindow.document.open();


  printWindow.document.write(`
<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<title>
  AgeVerse Unit Converter Result
</title>


<style>

html,
body {

  margin: 0;

  padding: 0;

  width: 100%;

  min-height: 100%;

  background: #ffffff;

}


body {

  display: flex;

  justify-content: center;

  align-items: flex-start;

  box-sizing: border-box;

  padding:
    8mm;

  -webkit-print-color-adjust:
    exact;

  print-color-adjust:
    exact;

}


.print-page {

  width: 100%;

  display: flex;

  justify-content: center;

  align-items: flex-start;

}


.print-image {

  display: block;

  width: auto;

  max-width: 100%;

  height: auto;

  max-height:
    281mm;

  object-fit:
    contain;

}


@page {

  size:
    A4 portrait;

  margin:
    0;

}


@media print {

  html,
  body {

    width: 210mm;

    min-height: 297mm;

    margin: 0;

    padding: 0;

    overflow: hidden;

    background:
      #ffffff;

  }


  body {

    display: flex;

    justify-content: center;

    align-items: flex-start;

    padding:
      8mm;

    box-sizing: border-box;

  }


  .print-page {

    width:
      194mm;

    display: flex;

    justify-content: center;

    align-items: flex-start;

  }


  .print-image {

    display: block;

    max-width:
      194mm;

    max-height:
      281mm;

    width:
      auto;

    height:
      auto;

  }

}

</style>

</head>


<body>

<div class="print-page">

<img
  class="print-image"
  src="${imageData}"
  alt="AgeVerse Unit Converter Result"
/>

</div>


<script>

(function() {

  const image =
    document.querySelector(
      ".print-image"
    );


  function startPrint() {

    setTimeout(
      function() {

        window.focus();

        window.print();

      },
      300
    );

  }


  if (
    image.complete
  ) {

    startPrint();

  } else {

    image.onload =
      startPrint;

  }


  window.onafterprint =
    function() {

      setTimeout(
        function() {

          window.close();

        },
        300
      );

    };

})();

</script>


</body>

</html>
`);


  printWindow.document.close();

}