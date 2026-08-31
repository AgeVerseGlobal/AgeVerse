import { useTranslation } from "react-i18next";
import "./InformationPages.css";
import { Link } from "react-router-dom";

function PrivacyPolicy() {
  const { t } = useTranslation();

  const sections = [
    {
      title: t("privacy_page.information_title"),
      text: t("privacy_page.information_text"),
    },
    {
      title: t("privacy_page.data_storage_title"),
      text: t("privacy_page.data_storage_text"),
    },
    {
      title: t("privacy_page.analytics_title"),
      text: t("privacy_page.analytics_text"),
    },
    {
      title: t("privacy_page.cookies_title"),
      text: t("privacy_page.cookies_text"),
    },
    {
      title: t("privacy_page.third_party_title"),
      text: t("privacy_page.third_party_text"),
    },
    {
      title: t("privacy_page.security_title"),
      text: t("privacy_page.security_text"),
    },
    {
      title: t("privacy_page.changes_title"),
      text: t("privacy_page.changes_text"),
    },
    {
      title: t("privacy_page.contact_title"),
      text: t("privacy_page.contact_text"),
    },
  ];

  return (
    <main className="info-page">
      <section className="info-hero">
        <div className="info-eyebrow">
          ✦ {t("privacy_page.eyebrow")}
        </div>

        <h1>{t("privacy_page.title")}</h1>

        <p className="info-hero-text">
          {t("privacy_page.intro")}
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

export default PrivacyPolicy;
