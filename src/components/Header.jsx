import "./Header.css";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

function Header() {
  const { darkMode, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <header className="header">
      <Link className="brand" to="/" aria-label="AgeVerse">
        <div className="logo">AV</div>
        <div>
          <h1>{t("common.app_name")}</h1>
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
      </div>
    </header>
  );
}

export default Header;
