import { useTranslation } from "react-i18next";
import "./InformationPages.css";
import { Link } from "react-router-dom";

function Disclaimer() {
  const { t } = useTranslation();

  const sections = [
    {
      icon: "🎯",
      title: t("disclaimer_page.accuracy_title"),
      text: t("disclaimer_page.accuracy_text"),
    },
    {
      icon: "🏥",
      title: t("disclaimer_page.health_title"),
      text: t("disclaimer_page.health_text"),
    },
    {
      icon: "💰",
      title: t("disclaimer_page.financial_title"),
      text: t("disclaimer_page.financial_text"),
    },
    {
      icon: "🐶",
      title: t("disclaimer_page.pet_title"),
      text: t("disclaimer_page.pet_text"),
    },
    {
      icon: "🌐",
      title: t("disclaimer_page.external_title"),
      text: t("disclaimer_page.external_text"),
    },
    {
      icon: "👤",
      title: t("disclaimer_page.responsibility_title"),
      text: t("disclaimer_page.responsibility_text"),
    },
    {
      icon: "📧",
      title: t("disclaimer_page.contact_title"),
      text: t("disclaimer_page.contact_text"),
    },
  ];

  return (
    <main className="info-page">
      <section className="info-hero">
        <div className="info-eyebrow">
          ✦ {t("disclaimer_page.eyebrow")}
        </div>

        <h1>{t("disclaimer_page.title")}</h1>

        <p className="info-hero-text">
          {t("disclaimer_page.intro")}
        </p>
      </section>

      <div className="info-content">
        <section className="info-section">
          <div className="info-notice">
            <div className="info-notice-icon">⚠️</div>

            <div>
              <h2>{t("disclaimer_page.notice_title")}</h2>
              <p>{t("disclaimer_page.notice_text")}</p>
            </div>
          </div>
        </section>

        <section className="info-section">
          <div className="info-card-grid">
            {sections.map((section) => (
              <article className="info-card" key={section.title}>
                <div className="info-card-icon">{section.icon}</div>

                <h3>{section.title}</h3>

                <p>{section.text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
      <section className="info-cta">
      <div>
      <h2>Explore AgeVerse Calculators</h2>
      <p>
      Explore Age, Date, Health, Financial and everyday calculators
      available on AgeVerse.
      </p>
      </div>

      <Link className="info-cta-button" to="/#calculators">
      Explore Calculators
    </Link>
    </section>
    </main>
  );
}

export default Disclaimer;
