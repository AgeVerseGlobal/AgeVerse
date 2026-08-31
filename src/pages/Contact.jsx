import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "./InformationPages.css";

function Contact() {
  const { t } = useTranslation();

  const contactCards = [
    {
      icon: "💡",
      title: t("contact_page.feedback_title"),
      text: t("contact_page.feedback_text"),
    },
    {
      icon: "🛠️",
      title: t("contact_page.support_title"),
      text: t("contact_page.support_text"),
    },
    {
      icon: "💬",
      title: t("contact_page.contact_title"),
      text: t("contact_page.contact_text"),
    },
  ];

  return (
    <main className="info-page">
      <section className="info-hero">
        <div className="info-eyebrow">
          ✦ {t("contact_page.eyebrow")}
        </div>

        <h1>{t("contact_page.title")}</h1>

        <p className="info-hero-text">
          {t("contact_page.intro")}
        </p>
      </section>

      <div className="info-content">
        <section className="info-section">
          <div className="info-card-grid info-category-grid">
            {contactCards.map((card) => (
              <article className="info-card" key={card.title}>
                <div className="info-card-icon">{card.icon}</div>

                <h3>{card.title}</h3>

                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="info-section info-contact-card">
          <div className="info-section-heading">
            <span className="info-section-icon">📧</span>

            <div>
              <h2>{t("contact_page.email_title")}</h2>

              <p>{t("contact_page.email_text")}</p>

              <div className="info-contact-email">
                {t("contact_page.email_placeholder")}
              </div>
            </div>
          </div>
        </section>

        <section className="info-cta">
          <div>
            <h2>{t("contact_page.cta_title")}</h2>
            <p>{t("contact_page.cta_text")}</p>
          </div>

          <Link className="info-cta-button" to="/">
            {t("contact_page.cta_button")}
          </Link>
        </section>
      </div>
    </main>
  );
}

export default Contact;
