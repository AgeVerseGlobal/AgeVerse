import "./Footer.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const calculatorLinks = [
  ["age_calculator", "/age-calculator"],
  ["event_calculator", "/event-calculator"],
  ["date_difference", "/date-difference"],
  ["retirement_calculator", "/retirement-calculator"],
  ["health_profile", "/health-profile"],
  ["pregnancy_calculator", "/pregnancy-calculator"],
  ["unit_converter", "/utility/unit-converter"],
  ["percentage_calculator", "/utility/percentage-calculator"],
  ["gst_calculator", "/utility/gst-calculator"],
  ["emi_calculator", "/utility/emi-calculator"],
  ["discount_calculator", "/utility/discount-calculator"],
  ["sip_calculator", "/utility/sip-calculator"],
  ["fd_calculator", "/utility/fd-calculator"],
  ["rd_calculator", "/utility/rd-calculator"],
  ["dog_age_calculator", "/pet/dog-age-calculator"]
];

function Footer() {
  const { t } = useTranslation();

  const handleCalculatorNavigation = () => {
    // React Router renders the next route asynchronously.
    // Scroll after that render so the user never remains at the footer.
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToTop);
    });

    window.setTimeout(scrollToTop, 120);
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link className="footer-logo" to="/" aria-label={t("common.app_name")}>
            <span className="footer-logo-mark">AV</span>
             <span className="footer-logo-text" data-translation-bridge-skip="true">Age<span>Verse</span></span>
          </Link>
          <p>{t("footer.description")}</p>
          <div className="footer-trust">{t("footer.trust")}</div>
        </div>

        <div className="footer-column">
          <h3>{t("footer.quick_links")}</h3>
          <Link to="/">{t("footer.home")}</Link>
          <Link to="/#calculators">{t("common.calculators")}</Link>
          <Link to="/about">{t("footer.about")}</Link>
          <Link to="/contact">{t("footer.contact")}</Link>
        </div>

        <div className="footer-column footer-calculators">
          <h3>{t("common.calculators")}</h3>
          {calculatorLinks.map(([key, route]) => (
            <Link key={route} to={route} onClick={handleCalculatorNavigation}>{t(`calculator_names.${key}`)}</Link>
          ))}
        </div>

        <div className="footer-column">
          <h3>{t("footer.information")}</h3>
          <Link to="/privacy-policy">{t("footer.privacy")}</Link>
          <Link to="/terms">{t("footer.terms")}</Link>
          <Link to="/disclaimer">{t("footer.disclaimer")}</Link>
          <a href="#languages">{t("footer.languages")}</a>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-divider" />
        <div className="footer-bottom-content">
          <p>© 2026 <strong data-translation-bridge-skip="true">AgeVerse</strong>. {t("footer.rights")}</p>
          <p className="footer-powered">✨ {t("footer.powered")}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
