const LANGUAGE_REGION_FALLBACKS = {
  ar: "SA", as: "IN", bho: "IN", bn: "BD", de: "DE", en: "US", es: "ES",
  fr: "FR", gu: "IN", hi: "IN", id: "ID", it: "IT", ja: "JP", kn: "IN",
  ko: "KR", mai: "IN", ml: "IN", mr: "IN", ms: "MY", or: "IN", pa: "IN",
  pt: "BR", ru: "RU", ta: "IN", te: "IN", th: "TH", tr: "TR", ur: "PK",
};

const REGION_CURRENCIES = {
  AE: "AED", AR: "ARS", AT: "EUR", AU: "AUD", BD: "BDT", BE: "EUR", BG: "BGN",
  BH: "BHD", BR: "BRL", CA: "CAD", CH: "CHF", CN: "CNY", CO: "COP", CZ: "CZK",
  DE: "EUR", DK: "DKK", EG: "EGP", ES: "EUR", FI: "EUR", FR: "EUR", GB: "GBP",
  GR: "EUR", HK: "HKD", HR: "EUR", HU: "HUF", ID: "IDR", IE: "EUR", IL: "ILS",
  IN: "INR", IS: "ISK", IT: "EUR", JP: "JPY", KE: "KES", KR: "KRW", KW: "KWD",
  LK: "LKR", MA: "MAD", MX: "MXN", MY: "MYR", NG: "NGN", NL: "EUR", NO: "NOK",
  NP: "NPR", NZ: "NZD", OM: "OMR", PK: "PKR", PL: "PLN", PT: "EUR", QA: "QAR",
  RO: "RON", RU: "RUB", SA: "SAR", SE: "SEK", SG: "SGD", TH: "THB", TR: "TRY",
  TW: "TWD", TZ: "TZS", UA: "UAH", US: "USD", VN: "VND", ZA: "ZAR",
};

const regionFromLocale = (locale) => {
  if (!locale) return "";
  try {
    const maximized = new Intl.Locale(locale).maximize();
    return maximized.region || "";
  } catch {
    return locale.split("-")[1]?.toUpperCase() || "";
  }
};

const regionFromTimeZone = (timeZone) => {
  if (!timeZone) return "";
  if (/^Asia\/(Calcutta|Kolkata)$/.test(timeZone)) return "IN";
  if (/^Asia\/(Karachi)$/.test(timeZone)) return "PK";
  if (/^Asia\/(Dhaka)$/.test(timeZone)) return "BD";
  if (/^Asia\/(Kathmandu)$/.test(timeZone)) return "NP";
  if (/^Asia\/(Colombo)$/.test(timeZone)) return "LK";
  if (/^Asia\/(Tokyo)$/.test(timeZone)) return "JP";
  if (/^Asia\/(Seoul)$/.test(timeZone)) return "KR";
  if (/^Asia\/(Bangkok)$/.test(timeZone)) return "TH";
  if (/^Asia\/(Kuala_Lumpur)$/.test(timeZone)) return "MY";
  if (/^Asia\/(Jakarta|Makassar|Pontianak|Jayapura)$/.test(timeZone)) return "ID";
  if (/^Asia\/(Shanghai|Chongqing|Harbin|Kashgar|Urumqi)$/.test(timeZone)) return "CN";
  if (/^Asia\/(Dubai)$/.test(timeZone)) return "AE";
  if (/^Asia\/(Riyadh)$/.test(timeZone)) return "SA";
  if (/^Europe\/(London)$/.test(timeZone)) return "GB";
  if (/^Europe\/Berlin$/.test(timeZone)) return "DE";
  if (/^Europe\/Paris$/.test(timeZone)) return "FR";
  if (/^Europe\/Rome$/.test(timeZone)) return "IT";
  if (/^Europe\/Madrid$/.test(timeZone)) return "ES";
  if (/^Europe\/Lisbon$/.test(timeZone)) return "PT";
  if (/^Europe\/(Moscow)$/.test(timeZone)) return "RU";
  if (/^America\/(New_York|Detroit|Indianapolis|Louisville)$/.test(timeZone)) return "US";
  if (/^America\/(Chicago|Winnipeg)$/.test(timeZone)) return "US";
  if (/^America\/(Denver|Phoenix)$/.test(timeZone)) return "US";
  if (/^America\/(Los_Angeles|Vancouver)$/.test(timeZone)) return timeZone === "America/Vancouver" ? "CA" : "US";
  if (/^America\/(Toronto)$/.test(timeZone)) return "CA";
  if (/^Australia\//.test(timeZone)) return "AU";
  return "";
};

export function getCurrencyContext(language) {
  const browserLocale = typeof navigator !== "undefined" ? navigator.language : "en-US";
  const requestedLanguage = String(language || "en").split("-")[0].toLowerCase();
  const browserRegion = regionFromLocale(browserLocale);
  const timeZone = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";
  const timeZoneRegion = regionFromTimeZone(timeZone);
  const region = timeZoneRegion || browserRegion || LANGUAGE_REGION_FALLBACKS[requestedLanguage] || "US";
  const currency = REGION_CURRENCIES[region] || "USD";
  const locale = browserLocale || `${requestedLanguage}-${region}`;
  return { locale, region, currency };
}

export function formatCurrency(value, language) {
  if (!Number.isFinite(Number(value))) return "—";
  const { locale, currency } = getCurrencyContext(language);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function currencyExample(value, language) {
  return formatCurrency(value, language);
}
