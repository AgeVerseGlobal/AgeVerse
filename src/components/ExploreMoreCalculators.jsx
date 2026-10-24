import "./ExploreMoreCalculators.css";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

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

function ExploreMoreCalculators() {
  const { t } = useTranslation();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const exploreRef = useRef(null);

  const visibleLinks = calculatorLinks.filter(({ path }) => path !== location.pathname);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!exploreRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <section ref={exploreRef} className={`explore-more-calculators${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="explore-more-toggle"
        aria-expanded={open}
        aria-controls="ageverse-explore-calculators"
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true">▦</span>
        <span>{open ? t("common.show_less_calculators") : t("common.explore_more_calculators")}</span>
        <span className="explore-more-chevron" aria-hidden="true">{open ? "⌃" : "⌄"}</span>
      </button>

      {open && (
        <div id="ageverse-explore-calculators" className="explore-more-panel">
          <div className="explore-more-grid">
            {visibleLinks.map(({ key, path, icon }) => (
              <Link className="explore-more-card" to={path} key={path} onClick={() => setOpen(false)}>
                <span className="explore-more-icon" aria-hidden="true">{icon}</span>
                <span>{t(`calculator_names.${key}`)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default ExploreMoreCalculators;
