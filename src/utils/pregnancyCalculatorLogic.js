/* =========================================================
   AGEVERSE — PREGNANCY CALCULATOR LOGIC
   LMP Based Pregnancy Calculator
   ========================================================= */

import { formatLocalizedDate } from "./localizedDate";


/* =========================================================
   DATE HELPERS
   ========================================================= */

/*
 * Convert YYYY-MM-DD into a local Date object.
 *
 * Local date components are used to avoid timezone-related
 * one-day shifts.
 */
function parseDate(dateString) {
  if (!dateString) {
    return null;
  }

  const parts = dateString.split("-");

  if (parts.length !== 3) {
    return null;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  const date = new Date(
    year,
    month - 1,
    day
  );

  /*
   * Strict calendar-date validation.
   */
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}


/*
 * Format:
 * Month Day, Year
 */
export function formatPregnancyDate(date) {
  if (!(date instanceof Date)) {
    return "";
  }

  return formatLocalizedDate(date, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}


/*
 * Format:
 * Weekday, Month Day, Year
 */
export function formatPregnancyDateWithDay(date) {
  if (!(date instanceof Date)) {
    return "";
  }

  return formatLocalizedDate(date, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}


/*
 * Convert Date → YYYY-MM-DD
 */
export function formatDateForInput(date) {
  if (!(date instanceof Date)) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


/*
 * Add days to a date.
 */
function addDays(date, days) {
  const result =
    new Date(date);

  result.setDate(
    result.getDate() + days
  );

  return result;
}


/*
 * Difference between two calendar dates
 * in complete days.
 *
 * Positive:
 * endDate is after startDate.
 *
 * Negative:
 * endDate is before startDate.
 */
function differenceInDays(
  startDate,
  endDate
) {
  const start =
    new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate()
    );

  const end =
    new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate()
    );

  const difference =
    end.getTime() -
    start.getTime();

  return Math.round(
    difference /
      (1000 * 60 * 60 * 24)
  );
}


/* =========================================================
   INPUT VALIDATION
   ========================================================= */

/*
 * Validate YYYY-MM-DD.
 */
export function isValidPregnancyDate(
  dateString
) {
  return Boolean(
    parseDate(dateString)
  );
}


/* =========================================================
   TRIMESTER
   ========================================================= */

/*
 * Trimester calculation based on pregnancy age.
 *
 * First trimester:
 * 0–13 weeks + 6 days
 *
 * Second trimester:
 * 14–27 weeks + 6 days
 *
 * Third trimester:
 * 28 weeks onward
 */
export function getTrimester(
  pregnancyDays
) {
  if (
    !Number.isFinite(
      pregnancyDays
    ) ||
    pregnancyDays < 0
  ) {
    return {
      number: 0,
      name: "Not Available",
      description: "",
    };
  }

  if (pregnancyDays < 98) {
    return {
      number: 1,
      name: "First Trimester",
      description:
        "Early pregnancy",
    };
  }

  if (pregnancyDays < 196) {
    return {
      number: 2,
      name: "Second Trimester",
      description:
        "Middle pregnancy",
    };
  }

  return {
    number: 3,
    name: "Third Trimester",
    description:
      "Late pregnancy",
  };
}


/* =========================================================
   PREGNANCY WEEK / DAY
   ========================================================= */

/*
 * Convert total pregnancy days into:
 *
 * X weeks + Y days
 */
export function getPregnancyWeeksAndDays(
  pregnancyDays
) {
  if (
    !Number.isFinite(
      pregnancyDays
    ) ||
    pregnancyDays < 0
  ) {
    return {
      weeks: 0,
      days: 0,
      totalDays: 0,
    };
  }

  const totalDays =
    Math.floor(
      pregnancyDays
    );

  const weeks =
    Math.floor(
      totalDays / 7
    );

  const days =
    totalDays % 7;

  return {
    weeks,
    days,
    totalDays,
  };
}


/* =========================================================
   RESULT BUILDER
   ========================================================= */

function buildBaseResult(
  lmpDate,
  dueDate,
  calculationDate
) {
  return {
    lmpDate:
      formatPregnancyDate(
        lmpDate
      ),

    lmpDateWithDay:
      formatPregnancyDateWithDay(
        lmpDate
      ),

    dueDate:
      formatPregnancyDate(
        dueDate
      ),

    dueDateWithDay:
      formatPregnancyDateWithDay(
        dueDate
      ),

    calculationDate:
      formatPregnancyDate(
        calculationDate
      ),
  };
}


/* =========================================================
   MAIN CALCULATION
   ========================================================= */

/*
 * Standard LMP-based calculation:
 *
 * Estimated Due Date =
 * LMP + 280 days
 *
 * Standard pregnancy estimate:
 * 40 weeks / 280 days.
 */
export function calculatePregnancy(
  lmpDateString,
  calculationDateString = ""
) {
  /*
   * Parse LMP.
   */
  const lmpDate =
    parseDate(
      lmpDateString
    );

  if (!lmpDate) {
    return null;
  }


  /*
   * Determine calculation date.
   *
   * If no date is supplied,
   * use today's local date.
   */
  let calculationDate;

  if (calculationDateString) {
    calculationDate =
      parseDate(
        calculationDateString
      );
  } else {
    const today =
      new Date();

    calculationDate =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
  }


  if (!calculationDate) {
    return null;
  }


  /*
   * Estimated due date.
   */
  const dueDate =
    addDays(
      lmpDate,
      280
    );


  /*
   * Pregnancy age in days.
   */
  const pregnancyDays =
    differenceInDays(
      lmpDate,
      calculationDate
    );


  /* =======================================================
     FUTURE LMP
     ======================================================= */

  if (pregnancyDays < 0) {
    return {
      status: "not-started",

      ...buildBaseResult(
        lmpDate,
        dueDate,
        calculationDate
      ),

      pregnancyDays: 0,

      weeks: 0,

      days: 0,

      totalWeeks: 0,

      remainingDays:
        Math.max(
        0,
        differenceInDays(
        calculationDate,
        dueDate
        )
    ),

      trimester: {
        number: 0,
        name: "Not Started",
        description:
          "The selected LMP date is in the future.",
      },

      progressPercent: 0,

      message:
        "Pregnancy calculation will begin from the selected LMP date.",
    };
  }


  /* =======================================================
     DUE DATE REACHED / PASSED
     ======================================================= */

  if (pregnancyDays >= 280) {
    return {
      status: "due-or-past",

      ...buildBaseResult(
        lmpDate,
        dueDate,
        calculationDate
      ),

      pregnancyDays,

      weeks:
        Math.floor(
          pregnancyDays / 7
        ),

      days:
        pregnancyDays % 7,

      totalWeeks:
        Math.floor(
          pregnancyDays / 7
        ),

      remainingDays: 0,

      trimester:
        getTrimester(
          pregnancyDays
        ),

      progressPercent: 100,

      message:
        "The estimated due date has been reached or passed.",
    };
  }


  /* =======================================================
     ONGOING PREGNANCY
     ======================================================= */

  const pregnancy =
    getPregnancyWeeksAndDays(
      pregnancyDays
    );


  /*
   * Correct remaining days:
   *
   * Due date - calculation date
   */
  const remainingDays = Math.max(
  0,
  Math.floor(
    (
      new Date(
        dueDate.getFullYear(),
        dueDate.getMonth(),
        dueDate.getDate()
      ).getTime() -
      new Date(
        calculationDate.getFullYear(),
        calculationDate.getMonth(),
        calculationDate.getDate()
      ).getTime()
    ) /
    (1000 * 60 * 60 * 24)
  )
);


  /*
   * Pregnancy progress.
   */
  const progressPercent =
    Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (
            pregnancyDays /
            280
          ) * 100
        )
      )
    );


  /*
   * Trimester.
   */
  const trimester =
    getTrimester(
      pregnancyDays
    );


  return {
    status: "ongoing",

    ...buildBaseResult(
      lmpDate,
      dueDate,
      calculationDate
    ),

    pregnancyDays,

    weeks:
      pregnancy.weeks,

    days:
      pregnancy.days,

    totalWeeks:
      Math.floor(
        pregnancyDays / 7
      ),

    remainingDays,

    trimester,

    progressPercent,

    message:
      "Pregnancy is currently ongoing.",
  };
}


/* =========================================================
   QUICK DUE DATE CALCULATION
   ========================================================= */

/*
 * Useful for future UI previews.
 */
export function calculateDueDate(
  lmpDateString
) {
  const lmpDate =
    parseDate(
      lmpDateString
    );

  if (!lmpDate) {
    return null;
  }

  return addDays(
    lmpDate,
    280
  );
}


/* =========================================================
   DEFAULT EXPORT
   ========================================================= */

export default calculatePregnancy;