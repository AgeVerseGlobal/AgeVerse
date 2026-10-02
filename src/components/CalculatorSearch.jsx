import "./CalculatorSearch.css";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const calculatorLinks = [
  { key: "age_calculator", path: "/age-calculator", icon: "🎂" },
  { key: "event_calculator", path: "/event-calculator", icon: "🎉" },
  { key: "date_difference", path: "/date-difference", icon: "📅" },
  { key: "retirement_calculator", path: "/retirement-calculator", icon: "👴" },
  { key: "health_profile", path: "/health-profile", icon: "🏥" },
  { key: "pregnancy_calculator", path: "/pregnancy-calculator", icon: "🤰" },
  { key: "unit_converter", path: "/utility/unit-converter", icon: "📏" },
  { key: "percentage_calculator", path: "/utility/percentage-calculator", icon: "📊" },
  { key: "gst_calculator", path: "/utility/gst-calculator", icon: "🧾" },
  { key: "emi_calculator", path: "/utility/emi-calculator", icon: "💳" },
  { key: "discount_calculator", path: "/utility/discount-calculator", icon: "🏷️" },
  { key: "sip_calculator", path: "/utility/sip-calculator", icon: "📈" },
  { key: "fd_calculator", path: "/utility/fd-calculator", icon: "🏦" },
  { key: "rd_calculator", path: "/utility/rd-calculator", icon: "💰" },
  { key: "dog_age_calculator", path: "/pet/dog-age-calculator", icon: "🐶" },
];

function CalculatorSearch() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return calculatorLinks;
    return calculatorLinks.filter(({ key }) =>
      t(`calculator_names.${key}`).toLocaleLowerCase().includes(normalized)
    );
  }, [query, t]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <button type="button" className="home-calculator-search" onClick={() => setOpen(true)}>
        <span className="home-calculator-search-icon" aria-hidden="true">🔎</span>
        <span>{t("common.search_calculator")}</span>
        <span className="home-calculator-search-arrow" aria-hidden="true">→</span>
      </button>

      {open && createPortal(
        <div className="calculator-search-backdrop" role="presentation" onClick={close}>
          <section
            className="calculator-search-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="calculator-search-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="calculator-search-header">
              <div>
                <h2 id="calculator-search-title">{t("common.search_calculator")}</h2>
                <p>{t("common.search_calculator_help")}</p>
              </div>
              <button type="button" className="calculator-search-close" onClick={close} aria-label={t("common.close")}>×</button>
            </div>

            <label className="calculator-search-input-wrap">
              <span aria-hidden="true">🔎</span>
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("common.search_calculator_placeholder")}
                aria-label={t("common.search_calculator")}
              />
            </label>

            <div className="calculator-search-results">
              {results.length ? results.map(({ key, path, icon }) => (
                <Link key={path} to={path} className="calculator-search-result" onClick={close}>
                  <span className="calculator-search-result-icon" aria-hidden="true">{icon}</span>
                  <span>{t(`calculator_names.${key}`)}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              )) : (
                <div className="calculator-search-empty">{t("common.no_calculators_found")}</div>
              )}
            </div>
          </section>
        </div>,
        document.body
      )}
    </>
  );
}

export default CalculatorSearch;
