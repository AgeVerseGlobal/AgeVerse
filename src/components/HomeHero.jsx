import "./HomeHero.css";
import CalculatorSearch from "./CalculatorSearch";
import { useTranslation } from "react-i18next";

function HomeHero() {
  const { t } = useTranslation();

  return (
    <section className="home-hero">
      <div className="hero-container">
        <div className="hero-content">
          <h1>
            {t("home.hero_title")}
            <br />
            <span>{t("home.hero_highlight")}</span>
          </h1>
          <p>{t("home.hero_description")}</p>
          <div className="hero-buttons">
            <CalculatorSearch />
          </div>
        </div>

        <div className="hero-card">
          <div className="mini-card">
            <h3>{t("home.preview_title")}</h3>
            <p>{t("home.preview_units")}</p>
          </div>
          <div className="mini-result">
            <strong>{t("home.preview_age_label")}</strong>
            <span>{t("home.preview_years")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeHero;
