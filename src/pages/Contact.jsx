import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import ContactWidget from "../components/ContactWidget";
import "./InformationPages.css";

function Contact() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);

  const contactCards = [
    { icon: "💡", title: t("contact_page.feedback_title"), text: t("contact_page.feedback_text") },
    { icon: "🛠️", title: t("contact_page.support_title"), text: t("contact_page.support_text") },
    { icon: "💬", title: t("contact_page.contact_title"), text: t("contact_page.contact_text") },
  ];

  return (
    <main className="info-page">
      <section className="info-hero">
        <div className="info-eyebrow">✦ {t("contact_page.eyebrow")}</div>
        <h1>{t("contact_page.title")}</h1>
        <p className="info-hero-text">{t("contact_page.intro")}</p>
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

        <section className="info-cta">
          <div>
            <h2>{t("contact_page.form_title")}</h2>
            <p>{t("contact_page.form_intro")}</p>
          </div>
          <button type="button" className="info-cta-button" onClick={() => setOpen(true)}>
            {t("contact_page.open_form")}
          </button>
        </section>

        <section className="info-cta">
          <div>
            <h2>{t("common.explore_calculators_title")}</h2>
            <p>{t("common.explore_calculators_text")}</p>
          </div>
          <Link className="info-cta-button" to="/#calculators">
            {t("common.explore_calculators_button")}
          </Link>
        </section>
      </div>

      <ContactWidget open={open} onClose={() => setOpen(false)} />
    </main>
  );
}

export default Contact;
