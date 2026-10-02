import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "./InformationPages.css";

function NotFound() {
  const { t } = useTranslation();

  return (
    <main className="info-page">
      <section className="info-hero">
        <div className="info-eyebrow">
          {t("not_found_page.eyebrow")}
        </div>

        <h1>{t("not_found_page.title")}</h1>

        <p className="info-hero-text">
          {t("not_found_page.description")}
        </p>

        <div style={{ marginTop: "24px" }}>
          <Link className="info-cta-button" to="/">
            {t("not_found_page.home_button")}
          </Link>
        </div>
      </section>
    </main>
  );
}

export default NotFound;