import { useTranslation } from "react-i18next";
import "./InformationPages.css";

function Terms() {
  const { t } = useTranslation();

  const sections = [
    {
      title: t("terms_page.calculator_title"),
      text: t("terms_page.calculator_text"),
    },
    {
      title: t("terms_page.accuracy_title"),
      text: t("terms_page.accuracy_text"),
    },
    {
      title: t("terms_page.health_title"),
      text: t("terms_page.health_text"),
    },
    {
      title: t("terms_page.financial_title"),
      text: t("terms_page.financial_text"),
    },
    {
      title: t("terms_page.pet_title"),
      text: t("terms_page.pet_text"),
    },
    {
      title: t("terms_page.availability_title"),
      text: t("terms_page.availability_text"),
    },
    {
      title: t("terms_page.responsibility_title"),
      text: t("terms_page.responsibility_text"),
    },
    {
      title: t("terms_page.changes_title"),
      text: t("terms_page.changes_text"),
    },
    {
      title: t("terms_page.contact_title"),
      text: t("terms_page.contact_text"),
    },
  ];

  return (
    <main className="info-page">
      <section className="info-hero">
        <div className="info-eyebrow">
          ✦ {t("terms_page.eyebrow")}
        </div>

        <h1>{t("terms_page.title")}</h1>

        <p className="info-hero-text">
          {t("terms_page.intro")}
        </p>
      </section>

      <div className="info-content">
        <section className="info-section">
          <div className="info-card-grid">
            {sections.map((section, index) => (
              <article className="info-card" key={section.title}>
                <div className="info-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <h3>{section.title}</h3>

                <p>{section.text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Terms;
