import i18n from "../i18n/config";

const LOCALE_MAP = {
  en: "en-IN",
  hi: "hi-IN",
  bn: "bn-IN",
  mr: "mr-IN",
  te: "te-IN",
  ta: "ta-IN",
  gu: "gu-IN",
  ml: "ml-IN",
  kn: "kn-IN",
  pa: "pa-IN",
  or: "or-IN",
  as: "as-IN",
  bho: "bho-IN",
  mai: "mai-IN",
  ur: "ur-IN",
  es: "es-ES",
  pt: "pt-BR",
  ms: "ms-MY",
  id: "id-ID",
  th: "th-TH",
  fr: "fr-FR",
  tr: "tr-TR",
  ru: "ru-RU",
  ja: "ja-JP",
  ko: "ko-KR",
  de: "de-DE",
  it: "it-IT",
  ar: "ar-SA",
};

export function getCurrentLocale() {
  const language =
    i18n.resolvedLanguage ||
    i18n.language ||
    "en";

  return LOCALE_MAP[language] || "en-IN";
}

export function formatLocalizedDate(
  date,
  options = {}
) {
  if (!date) return "";

  const value =
    date instanceof Date
      ? date
      : new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    getCurrentLocale(),
    options
  ).format(value);
}

export function formatLocalizedDateLong(date) {
  return formatLocalizedDate(date, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatLocalizedDateShort(date) {
  return formatLocalizedDate(date, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatLocalizedWeekday(date) {
  return formatLocalizedDate(date, {
    weekday: "long",
  });
}

export function formatLocalizedMonth(date) {
  return formatLocalizedDate(date, {
    month: "long",
  });
}