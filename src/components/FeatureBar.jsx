import "./FeatureBar.css";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const features = [
  { icon: "🎂", key: "age_calculator", route: "/age-calculator" },
  { icon: "🎉", key: "event_calculator", route: "/event-calculator" },
  { icon: "📅", key: "date_difference", route: "/date-difference" },
  { icon: "👴", key: "retirement_calculator", route: "/retirement-calculator" },
  { icon: "🏥", key: "health_profile", route: "/health-profile" },
  { icon: "🤰", key: "pregnancy_calculator", route: "/pregnancy-calculator" },
  { icon: "📏", key: "unit_converter", route: "/utility/unit-converter" },
  { icon: "📊", key: "percentage_calculator", route: "/utility/percentage-calculator" },
  { icon: "🧾", key: "gst_calculator", route: "/utility/gst-calculator" },
  { icon: "💳", key: "emi_calculator", route: "/utility/emi-calculator" },
  { icon: "🏷️", key: "discount_calculator", route: "/utility/discount-calculator" },
  { icon: "📈", key: "sip_calculator", route: "/utility/sip-calculator" },
  { icon: "🏦", key: "fd_calculator", route: "/utility/fd-calculator" },
  { icon: "💰", key: "rd_calculator", route: "/utility/rd-calculator" },
  { icon: "🐶", key: "dog_age_calculator", route: "/pet/dog-age-calculator" }
];

function FeatureBar() {
  const { t } = useTranslation();
  const items = [...features, ...features];

  return (
    <nav className="feature-bar" aria-label={t("common.calculators")}>
      <div className="feature-track">
        {items.map((item, index) => (
          <NavLink
            className="feature-button"
            to={item.route}
            key={`${item.route}-${index}`}
            aria-label={t(`calculator_names.${item.key}`)}
          >
            <span aria-hidden="true">{item.icon}</span>
            <span>{t(`calculator_names.${item.key}`)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default FeatureBar;
