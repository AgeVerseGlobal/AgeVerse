/* =========================================================
   AGEVERSE — UNIT CONVERTER LOGIC
========================================================= */

const UNIT_DATA = {
  length: {
    title: "Length",
    icon: "📏",
    units: {
      Millimeter: {
        symbol: "mm",
        toBase: (v) => v / 1000,
      },
      Centimeter: {
        symbol: "cm",
        toBase: (v) => v / 100,
      },
      Meter: {
        symbol: "m",
        toBase: (v) => v,
      },
      Kilometer: {
        symbol: "km",
        toBase: (v) => v * 1000,
      },
      Inch: {
        symbol: "in",
        toBase: (v) => v * 0.0254,
      },
      Foot: {
        symbol: "ft",
        toBase: (v) => v * 0.3048,
      },
      Yard: {
        symbol: "yd",
        toBase: (v) => v * 0.9144,
      },
      Mile: {
        symbol: "mi",
        toBase: (v) => v * 1609.344,
      },
    },
    fromBase: {
      Millimeter: (v) => v * 1000,
      Centimeter: (v) => v * 100,
      Meter: (v) => v,
      Kilometer: (v) => v / 1000,
      Inch: (v) => v / 0.0254,
      Foot: (v) => v / 0.3048,
      Yard: (v) => v / 0.9144,
      Mile: (v) => v / 1609.344,
    },
  },

  mass: {
    title: "Weight / Mass",
    icon: "⚖️",
    units: {
      Milligram: {
        symbol: "mg",
        toBase: (v) => v / 1000000,
      },
      Gram: {
        symbol: "g",
        toBase: (v) => v / 1000,
      },
      Kilogram: {
        symbol: "kg",
        toBase: (v) => v,
      },
      Tonne: {
        symbol: "t",
        toBase: (v) => v * 1000,
      },
      Ounce: {
        symbol: "oz",
        toBase: (v) => v * 0.028349523125,
      },
      Pound: {
        symbol: "lb",
        toBase: (v) => v * 0.45359237,
      },
      Stone: {
        symbol: "st",
        toBase: (v) => v * 6.35029318,
      },
    },
    fromBase: {
      Milligram: (v) => v * 1000000,
      Gram: (v) => v * 1000,
      Kilogram: (v) => v,
      Tonne: (v) => v / 1000,
      Ounce: (v) => v / 0.028349523125,
      Pound: (v) => v / 0.45359237,
      Stone: (v) => v / 6.35029318,
    },
  },

  volume: {
    title: "Volume",
    icon: "🧪",
    units: {
      Milliliter: {
        symbol: "mL",
        toBase: (v) => v / 1000,
      },
      Liter: {
        symbol: "L",
        toBase: (v) => v,
      },
      CubicMeter: {
        symbol: "m³",
        toBase: (v) => v * 1000,
      },
      CubicCentimeter: {
        symbol: "cm³",
        toBase: (v) => v / 1000,
      },
      GallonUS: {
        symbol: "US gal",
        toBase: (v) => v * 3.785411784,
      },
      QuartUS: {
        symbol: "US qt",
        toBase: (v) => v * 0.946352946,
      },
      PintUS: {
        symbol: "US pt",
        toBase: (v) => v * 0.473176473,
      },
      CupUS: {
        symbol: "US cup",
        toBase: (v) => v * 0.2365882365,
      },
    },
    fromBase: {
      Milliliter: (v) => v * 1000,
      Liter: (v) => v,
      CubicMeter: (v) => v / 1000,
      CubicCentimeter: (v) => v * 1000,
      GallonUS: (v) => v / 3.785411784,
      QuartUS: (v) => v / 0.946352946,
      PintUS: (v) => v / 0.473176473,
      CupUS: (v) => v / 0.2365882365,
    },
  },

  area: {
    title: "Area",
    icon: "📐",
    units: {
      SquareMillimeter: {
        symbol: "mm²",
        toBase: (v) => v / 1000000,
      },
      SquareCentimeter: {
        symbol: "cm²",
        toBase: (v) => v / 10000,
      },
      SquareMeter: {
        symbol: "m²",
        toBase: (v) => v,
      },
      Hectare: {
        symbol: "ha",
        toBase: (v) => v * 10000,
      },
      SquareKilometer: {
        symbol: "km²",
        toBase: (v) => v * 1000000,
      },
      SquareInch: {
        symbol: "in²",
        toBase: (v) => v * 0.00064516,
      },
      SquareFoot: {
        symbol: "ft²",
        toBase: (v) => v * 0.09290304,
      },
      Acre: {
        symbol: "acre",
        toBase: (v) => v * 4046.8564224,
      },
    },
    fromBase: {
      SquareMillimeter: (v) => v * 1000000,
      SquareCentimeter: (v) => v * 10000,
      SquareMeter: (v) => v,
      Hectare: (v) => v / 10000,
      SquareKilometer: (v) => v / 1000000,
      SquareInch: (v) => v / 0.00064516,
      SquareFoot: (v) => v / 0.09290304,
      Acre: (v) => v / 4046.8564224,
    },
  },

  speed: {
    title: "Speed",
    icon: "🚗",
    units: {
      MeterPerSecond: {
        symbol: "m/s",
        toBase: (v) => v,
      },
      KilometerPerHour: {
        symbol: "km/h",
        toBase: (v) => v / 3.6,
      },
      MilePerHour: {
        symbol: "mph",
        toBase: (v) => v * 0.44704,
      },
      Knot: {
        symbol: "kn",
        toBase: (v) => v * 0.5144444444,
      },
      FootPerSecond: {
        symbol: "ft/s",
        toBase: (v) => v * 0.3048,
      },
    },
    fromBase: {
      MeterPerSecond: (v) => v,
      KilometerPerHour: (v) => v * 3.6,
      MilePerHour: (v) => v / 0.44704,
      Knot: (v) => v / 0.5144444444,
      FootPerSecond: (v) => v / 0.3048,
    },
  },

  time: {
    title: "Time",
    icon: "⏱️",
    units: {
      Millisecond: {
        symbol: "ms",
        toBase: (v) => v / 1000,
      },
      Second: {
        symbol: "sec",
        toBase: (v) => v,
      },
      Minute: {
        symbol: "min",
        toBase: (v) => v * 60,
      },
      Hour: {
        symbol: "hr",
        toBase: (v) => v * 3600,
      },
      Day: {
        symbol: "day",
        toBase: (v) => v * 86400,
      },
      Week: {
        symbol: "week",
        toBase: (v) => v * 604800,
      },
      Year: {
        symbol: "year",
        toBase: (v) => v * 31557600,
      },
    },
    fromBase: {
      Millisecond: (v) => v * 1000,
      Second: (v) => v,
      Minute: (v) => v / 60,
      Hour: (v) => v / 3600,
      Day: (v) => v / 86400,
      Week: (v) => v / 604800,
      Year: (v) => v / 31557600,
    },
  },

  data: {
    title: "Digital Data",
    icon: "💾",
    units: {
      Byte: {
        symbol: "B",
        toBase: (v) => v,
      },
      Kilobyte: {
        symbol: "KB",
        toBase: (v) => v * 1024,
      },
      Megabyte: {
        symbol: "MB",
        toBase: (v) => v * 1024 ** 2,
      },
      Gigabyte: {
        symbol: "GB",
        toBase: (v) => v * 1024 ** 3,
      },
      Terabyte: {
        symbol: "TB",
        toBase: (v) => v * 1024 ** 4,
      },
      Bit: {
        symbol: "bit",
        toBase: (v) => v / 8,
      },
    },
    fromBase: {
      Byte: (v) => v,
      Kilobyte: (v) => v / 1024,
      Megabyte: (v) => v / 1024 ** 2,
      Gigabyte: (v) => v / 1024 ** 3,
      Terabyte: (v) => v / 1024 ** 4,
      Bit: (v) => v * 8,
    },
  },

  temperature: {
    title: "Temperature",
    icon: "🌡️",
    units: {
      Celsius: {
        symbol: "°C",
        toBase: (v) => v,
      },
      Fahrenheit: {
        symbol: "°F",
        toBase: (v) => (v - 32) * (5 / 9),
      },
      Kelvin: {
        symbol: "K",
        toBase: (v) => v - 273.15,
      },
    },
    fromBase: {
      Celsius: (v) => v,
      Fahrenheit: (v) => v * (9 / 5) + 32,
      Kelvin: (v) => v + 273.15,
    },
  },
};

export function getUnitCategories() {
  return Object.entries(UNIT_DATA).map(
    ([key, data]) => ({
      key,
      ...data,
    })
  );
}

export function getUnitNames(category) {
  return Object.keys(
    UNIT_DATA[category]?.units || {}
  );
}

export function getUnitSymbol(
  category,
  unit
) {
  return (
    UNIT_DATA[category]?.units?.[unit]
      ?.symbol || ""
  );
}

export function convertUnit(
  category,
  value,
  fromUnit,
  toUnit
) {
  if (
    !UNIT_DATA[category] ||
    !UNIT_DATA[category].units[fromUnit] ||
    !UNIT_DATA[category].units[toUnit]
  ) {
    throw new Error(
      "Invalid unit selection."
    );
  }

  const numericValue =
    Number(value);

  if (!Number.isFinite(numericValue)) {
    throw new Error(
      "Please enter a valid number."
    );
  }

  const baseValue =
    UNIT_DATA[category]
      .units[fromUnit]
      .toBase(numericValue);

  const result =
    UNIT_DATA[category]
      .fromBase[toUnit](baseValue);

  return result;
}

export function formatUnitValue(value) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  if (
    Math.abs(value) >= 1e12 ||
    (
      Math.abs(value) > 0 &&
      Math.abs(value) < 1e-6
    )
  ) {
    return value.toExponential(8);
  }

  return Number(
    value.toFixed(10)
  ).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 10,
    }
  );
}

export default UNIT_DATA;