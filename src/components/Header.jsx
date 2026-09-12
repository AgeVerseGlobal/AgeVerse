import "./Header.css";
import { useEffect, useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";

const navigationLinks = [
  { key: "home", path: "/" },
  { key: "about", path: "/about" },
  { key: "contact", path: "/contact" },
  { key: "privacy", path: "/privacy-policy" },
  { key: "terms", path: "/terms" },
  { key: "disclaimer", path: "/disclaimer" },
];

const calculatorLinks = [
  { key: "age_calculator", path: "/age-calculator", icon: "🎂" },
  { key: "event_calculator", path: "/event-calculator", icon: "🎉" },
  { key: "date_difference", path: "/date-difference", icon: "📅" },
  { key: "retirement_calculator", path: "/retirement-calculator", icon: "👴" },
  { key: "health_profile", path: "/health-profile", icon: "🏥" },
  { key: "pregnancy_calculator", path: "/pregnancy-calculator", icon: "🤰" },
  { key: "unit_converter", path: "/utility/unit-converter", icon: "📏" },
  { key: "percentage_calculator", path: "/utility/percentage-calculator", icon: "📊" },
  { key: "gst_calculator", path: "/utility/gst-calculator", icon: "🧾" },
  { key: "emi_calculator", path: "/utility/emi-calculator", icon: "💳" },
  { key: "discount_calculator", path: "/utility/discount-calculator", icon: "🏷️" },
  { key: "sip_calculator", path: "/utility/sip-calculator", icon: "📈" },
  { key: "fd_calculator", path: "/utility/fd-calculator", icon: "🏦" },
  { key: "rd_calculator", path: "/utility/rd-calculator", icon: "💰" },
  { key: "dog_age_calculator", path: "/pet/dog-age-calculator", icon: "🐶" },
];

function isPathActive(currentPath, targetPath) {
  if (targetPath === "/") return currentPath === "/";
  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
}

function Header() {
  const { darkMode, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);


  return (
    <header className="header">
      <Link className="brand" to="/" aria-label="AgeVerseGlobal">
        <img
          className="logo"
          src="/branding/ageverse-logo.webp"
          alt=""
          width="46"
          height="46"
          decoding="async"
          fetchPriority="high"
        />
        <div>
          <div className="brand-title" data-translation-bridge-skip="true">
            Age<span>VerseGlobal</span>
          </div>

          <p>{t("header.tagline")}</p>
        </div>
      </Link>

      <div className="header-actions">
        <LanguageSwitcher />
        <button
          type="button"
          className="theme-toggle"
          aria-label={darkMode ? t("theme.light_mode") : t("theme.dark_mode")}
          title={darkMode ? t("theme.light_mode") : t("theme.dark_mode")}
          onClick={toggleTheme}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        <button
          type="button"
          className={`menu-toggle${menuOpen ? " is-open" : ""}`}
          aria-label={t("footer.quick_links")}
          aria-expanded={menuOpen}
          aria-controls="ageverse-global-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true">☰</span>
        </button>
      </div>

      {menuOpen && typeof document !== "undefined" && createPortal(
        <div
          className="global-menu-backdrop"
          role="presentation"
          onClick={() => setMenuOpen(false)}
        >
          <nav
            id="ageverse-global-menu"
            className="global-menu"
            aria-label={t("footer.quick_links")}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="global-menu-header">
              <div className="global-menu-title">{t("footer.quick_links")}</div>
              <button
                type="button"
                className="global-menu-close"
                aria-label={t("footer.quick_links")}
                onClick={() => setMenuOpen(false)}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="global-menu-list">
              <div className="global-menu-section">
                {navigationLinks.map(({ key, path }) => (
                  <Link
                    key={path}
                    className={`global-menu-item${isPathActive(location.pathname, path) ? " is-active" : ""}`}
                    to={path}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="global-menu-item-icon" aria-hidden="true">
                      {key === "home" ? "⌂" : key === "about" ? "ⓘ" : key === "contact" ? "✉" : key === "privacy" ? "◈" : key === "terms" ? "▤" : "⚠"}
                    </span>
                    <span>{t(`footer.${key}`)}</span>
                  </Link>
                ))}
              </div>

              <div className="global-menu-divider" />

              <div className="global-menu-section">
                {calculatorLinks.map(({ key, path, icon }) => (
                  <Link
                    key={path}
                    className={`global-menu-item${isPathActive(location.pathname, path) ? " is-active" : ""}`}
                    to={path}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="global-menu-item-icon" aria-hidden="true">{icon}</span>
                    <span>{t(`calculator_names.${key}`)}</span>
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>,
        document.body
      )}
    </header>
  );
}

export default Header;
