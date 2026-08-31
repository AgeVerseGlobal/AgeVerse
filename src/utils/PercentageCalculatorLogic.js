export const percentageOf = (percentage, number) => {
  return (percentage / 100) * number;
};

export const whatPercentage = (part, total) => {
  if (total === 0) {
    throw new Error("Total value cannot be zero.");
  }

  return (part / total) * 100;
};

export const percentageIncrease = (original, newValue) => {
  if (original === 0) {
    throw new Error("Original value cannot be zero.");
  }

  return ((newValue - original) / Math.abs(original)) * 100;
};

export const percentageDecrease = (original, newValue) => {
  if (original === 0) {
    throw new Error("Original value cannot be zero.");
  }

  return ((original - newValue) / Math.abs(original)) * 100;
};

export const percentageDifference = (first, second) => {
  const average = (Math.abs(first) + Math.abs(second)) / 2;

  if (average === 0) {
    throw new Error("Both values cannot be zero.");
  }

  return (Math.abs(first - second) / average) * 100;
};

export const findOriginalValue = (finalValue, percentageChange) => {
  if (percentageChange <= -100) {
    throw new Error("Percentage change must be greater than -100%.");
  }

  return finalValue / (1 + percentageChange / 100);
};