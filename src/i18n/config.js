import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Keep English in the first JavaScript bundle. Other locales are loaded only
// when selected, preventing the 3 MB locale collection from delaying startup.
const localeModules = import.meta.glob("../locales/*.json");
const englishModule = await import("../locales/en.json");

const supportedLngs = Object.keys(localeModules)
  .map((path) => path.match(/\/([^/]+)\.json$/)?.[1])
  .filter(Boolean);

const savedLanguage = localStorage.getItem("ageverse-language") || "en";
const initialLanguage = supportedLngs.includes(savedLanguage) ? savedLanguage : "en";

const resources = {
  en: { translation: englishModule.default },
};

export async function loadLanguage(language) {
  if (!supportedLngs.includes(language)) return false;
  if (i18n.hasResourceBundle(language, "translation")) return true;

  const path = `../locales/${language}.json`;
  const loader = localeModules[path];
  if (!loader) return false;

  const module = await loader();
  i18n.addResourceBundle(language, "translation", module.default, true, true);
  return true;
}

await i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    supportedLngs,
    initImmediate: false,
    react: { useSuspense: false },
    interpolation: { escapeValue: false },
    returnEmptyString: false,
    cleanCode: true,
    load: "languageOnly",
  });

if (initialLanguage !== "en") {
  await loadLanguage(initialLanguage);
  await i18n.changeLanguage(initialLanguage);
}

export { supportedLngs };
export default i18n;
