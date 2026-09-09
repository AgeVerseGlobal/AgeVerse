import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "./InformationPages.css";

function About() {
  const { t } = useTranslation();

  const categories = [
    {
      icon: "🎂",
      title: t("category_names.age"),
      text: t("about_page.category_age"),
    },
    {
      icon: "🏥",
      title: t("category_names.health"),
      text: t("about_page.category_health"),
    },
    {
      icon: "👶",
      title: t("category_names.family"),
      text: t("about_page.category_family"),
    },
    {
      icon: "🧮",
      title: t("category_names.utility"),
      text: t("about_page.category_utility"),
    },
    {
      icon: "🐶",
      title: t("category_names.pet"),
      text: t("about_page.category_pet"),
    },
  ];

  const benefits = [
    {
      icon: "✓",
      title: t("about_page.accurate_title"),
      text: t("about_page.accurate_text"),
    },
    {
      icon: "⚡",
      title: t("about_page.simple_title"),
      text: t("about_page.simple_text"),
    },
    {
      icon: "🔒",
      title: t("about_page.privacy_title"),
      text: t("about_page.privacy_text"),
    },
  ];

  return (
    <main className="info-page">
      <section className="info-hero">
        <div className="info-eyebrow">
          ✦ {t("about_page.eyebrow")}
        </div>

        <h1>{t("about_page.title")}</h1>

        <p className="info-hero-text">
          {t("about_page.intro")}
        </p>
      </section>

      <div className="info-content">
        <section className="info-section info-introduction">
          <div className="info-section-heading">
            <span className="info-section-icon">✨</span>

            <div>
              <h2>{t("about_page.mission_title")}</h2>
              <p>{t("about_page.mission_text")}</p>
            </div>
          </div>
        </section>

        <section className="info-section">
          <div className="info-heading-block">
            <span className="info-eyebrow">
              {t("about_page.tools_eyebrow")}
            </span>

            <h2>{t("about_page.tools_title")}</h2>
            <p>{t("about_page.tools_text")}</p>
          </div>

          <div className="info-card-grid info-category-grid">
            {categories.map((category) => (
              <article className="info-card" key={category.title}>
                <div className="info-card-icon">{category.icon}</div>

                <h3>{category.title}</h3>

                <p>{category.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="info-section">
          <div className="info-heading-block">
            <span className="info-eyebrow">
              {t("about_page.why_eyebrow")}
            </span>

            <h2>{t("about_page.why_title")}</h2>
            <p>{t("about_page.why_text")}</p>
          </div>

          <div className="info-card-grid info-benefit-grid">
            {benefits.map((benefit) => (
              <article
                className="info-card info-benefit-card"
                key={benefit.title}
              >
                <div className="info-benefit-icon">
                  {benefit.icon}
                </div>

                <div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="info-section info-language-card">
          <div className="info-language-icon">🌐</div>

          <div>
            <h2>{t("about_page.languages_title")}</h2>
            <p>{t("about_page.languages_text")}</p>
          </div>
        </section>

        <section className="info-cta">
          <div>
            <h2>{t("about_page.cta_title")}</h2>
            <p>{t("about_page.cta_text")}</p>
          </div>

          <Link className="info-cta-button" to="/#calculators">
            {t("about_page.cta_button")}
          </Link>
        </section>
      </div>
    </main>
  );
}

export default About;
