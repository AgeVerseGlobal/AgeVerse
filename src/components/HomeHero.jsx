import "./HomeHero.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function HomeHero() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleCalculateAge = () => navigate("/age-calculator");

  const handleExplore = () => {
    const calculatorSection = document.getElementById("calculators");
    if (calculatorSection) {
      calculatorSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
            <button type="button" className="primary" onClick={handleCalculateAge}>
              {t("home.calculate_age")}
            </button>
            <button type="button" className="secondary" onClick={handleExplore}>
              {t("home.explore_calculators")}
            </button>
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
