/* =========================================================
   AGEVERSE.GLOBAL
   PERCENTAGE CALCULATOR
   PRINT HELPER
========================================================= */

export const printPercentageResult = () => {

  /*
   * The PercentageCalculator component already prepares
   * the page using @media print CSS.
   *
   * Only the result card remains visible during printing.
   */

  if (typeof window === "undefined") {
    return;
  }


  /*
   * Small delay ensures React has finished rendering
   * the latest calculation before print dialog opens.
   */

  window.setTimeout(() => {

    window.print();

  }, 100);
};