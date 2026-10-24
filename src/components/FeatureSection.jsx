import "./FeatureSection.css";
import { useTranslation } from "react-i18next";

function FeatureSection() {
  const { t } = useTranslation();
  const features = [
    ["🎯", "exact_calculation"],
    ["📅", "multiple_calculators"],
    ["🌍", "languages"],
    ["📱", "mobile_friendly"],
    ["⚡", "fast_result"],
    ["🔒", "privacy_focused"],
  ];

  return (
    <section className="feature-section">
      <h2>{t("home.features_title")}</h2>
      <p className="feature-subtitle">{t("home.features_subtitle")}</p>
      <div className="feature-grid">
        {features.map(([icon, key]) => (
          <div className="feature-card" key={key}>
            <div className="feature-icon">{icon}</div>
            <h3>{t(`home.features.${key}.title`)}</h3>
            <p>{t(`home.features.${key}.desc`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeatureSection;
