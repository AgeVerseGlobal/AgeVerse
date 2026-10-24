import { useTranslation } from "react-i18next";

function ResultAttribution({ type = "generated" }) {
  const { t } = useTranslation();
  const key = type === "calculated"
    ? "result_meta.calculated_by"
    : "result_meta.generated_by";

  return (
    <>
      {t(key)}
    </>
  );
}

export default ResultAttribution;
