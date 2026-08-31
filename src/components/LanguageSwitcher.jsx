import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/config";

function getLanguageName(code) {
  const name = i18n.getResource(code, "translation", "language_name");
  return name || code.toUpperCase();
}

function LanguageSwitcher() {
  const { i18n: currentI18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const currentLanguage =
    currentI18n.resolvedLanguage || currentI18n.language || "en";

  const languages = (currentI18n.options.supportedLngs || [])
    .filter((code) => code && code !== "cimode")
    .map((code) => [code, getLanguageName(code)]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function changeLanguage(language) {
    if (!language || language === currentLanguage) {
      setOpen(false);
      return;
    }

    await currentI18n.changeLanguage(language);
    localStorage.setItem("ageverse-language", language);
    setOpen(false);
  }

  const currentName = getLanguageName(currentLanguage);

  return (
    <div
      ref={rootRef}
      className={`language-switcher${open ? " is-open" : ""}`}
      data-translation-bridge-skip="true"
    >
      <button
        type="button"
        className="language-switcher-trigger"
        aria-label={t("theme.language")}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="language-switcher-current">{currentName}</span>
        <span className="language-switcher-chevron" aria-hidden="true">
          {open ? "⌃" : "⌄"}
        </span>
      </button>

      {open && (
        <div
          className="language-switcher-menu"
          role="listbox"
          aria-label={t("theme.language")}
        >
          {languages.map(([value, label]) => (
            <button
              type="button"
              role="option"
              aria-selected={value === currentLanguage}
              className={`language-switcher-option${
                value === currentLanguage ? " is-selected" : ""
              }`}
              key={value}
              onClick={() => changeLanguage(value)}
            >
              <span>{label}</span>
              {value === currentLanguage && (
                <span className="language-switcher-check" aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSwitcher;
