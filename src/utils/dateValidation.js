export function validateDate(day, month, year) {
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);

  if (!day || !month || !year) {
    return "Please fill all date fields.";
  }

  if (!Number.isInteger(d) || d < 1 || d > 31) {
    return "Day must be between 1 and 31.";
  }

  if (!Number.isInteger(m) || m < 1 || m > 12) {
    return "Month must be between 1 and 12.";
  }

  if (!Number.isInteger(y) || y < 1900) {
    return "Enter a valid year.";
  }

  const date = new Date(y, m - 1, d);

  // Check actual calendar validity
  if (
    date.getDate() !== d ||
    date.getMonth() !== m - 1 ||
    date.getFullYear() !== y
  ) {
    return "Invalid date.";
  }

  return "";
}