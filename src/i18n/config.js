import i18n from "i18next";
import { initReactI18next } from "react-i18next";

/*
 * =========================================================
 * LOAD ALL LOCALES
 * =========================================================
 *
 * All locale JSON files are loaded eagerly so language
 * switching does not need an additional network request.
 *
 * Future languages:
 * Simply add another JSON file inside /locales.
 * Example:
 *   en.json
 *   hi.json
 *   bho.json
 *   mr.json
 *   etc.
 */
const localeModules = import.meta.glob(
  "../locales/*.json",
  {
    eager: true,
    import: "default",
  }
);

/*
 * =========================================================
 * BUILD I18N RESOURCES
 * =========================================================
 */
const resources = Object.fromEntries(
  Object.entries(localeModules)
    .map(([path, translation]) => {
      const match =
        path.match(/\/([^/]+)\.json$/);

      const code =
        match?.[1]?.trim();

      if (!code) {
        return null;
      }

      return [
        code,
        {
          translation,
        },
      ];
    })
    .filter(Boolean)
);

/*
 * =========================================================
 * SUPPORTED LANGUAGES
 * =========================================================
 */
const supportedLngs =
  Object.keys(resources);

/*
 * =========================================================
 * SAVED LANGUAGE
 * =========================================================
 */
const savedLanguage =
  localStorage.getItem(
    "ageverse-language"
  ) || "en";

/*
 * Only use a language that actually exists.
 */
const initialLanguage =
  supportedLngs.includes(
    savedLanguage
  )
    ? savedLanguage
    : "en";

/*
 * =========================================================
 * INITIALIZE I18N
 * =========================================================
 *
 * IMPORTANT:
 *
 * fallbackLng is disabled intentionally.
 *
 * Reason:
 * When Hindi is selected, missing keys must NOT temporarily
 * fall back to English and create a visible Hindi → English
 * flash.
 *
 * Every locale should contain the common translation keys.
 *
 * This also makes future language additions predictable:
 * add the required keys to the new locale JSON instead of
 * relying on an English fallback.
 */
i18n
  .use(initReactI18next)
  .init({
    resources,

    lng: initialLanguage,

    supportedLngs,

    /*
     * Prevent temporary English fallback during a language
     * change.
     */
    fallbackLng: false,

    /*
     * Locale files are already eagerly loaded.
     */
    initImmediate: false,

    /*
     * Prevent Suspense from temporarily replacing the UI
     * while the language state changes.
     */
    react: {
      useSuspense: false,
    },

    interpolation: {
      escapeValue: false,
    },

    /*
     * Do not silently render an empty translation.
     */
    returnEmptyString: false,

    /*
     * Keep language codes exactly as defined by the
     * locale filenames.
     */
    cleanCode: true,

    /*
     * Do not automatically convert language codes into
     * another locale during lookup.
     */
    load: "languageOnly",
  });

export default i18n;