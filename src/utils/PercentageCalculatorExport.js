export const createPercentageResultText = ({
  title,
  label,
  value,
  equation,
}) => {
  return [
    "AgeVerse — Percentage Calculator",
    "",
    title,
    `${label}: ${value}`,
    "",
    `Formula: ${equation}`,
  ].join("\n");
};

export const downloadPercentageResult = ({
  title,
  label,
  value,
  equation,
}) => {
  const text = createPercentageResultText({
    title,
    label,
    value,
    equation,
  });

  const blob = new Blob([text], {
    type: "text/plain;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "AgeVerse-Percentage-Result.txt";

  document.body.appendChild(anchor);

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(url);
};