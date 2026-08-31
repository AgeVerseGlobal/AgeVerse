import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/config";

const TRANSLATABLE_ATTRIBUTES = ["placeholder", "title", "aria-label"];
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"]);
const BRAND_TOKENS = ["AgeVerse.Global", "AgeVerse"];

function flattenStrings(value, prefix = "", output = {}) {
  Object.entries(value || {}).forEach(([key, entry]) => {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      flattenStrings(entry, nextKey, output);
    } else if (typeof entry === "string" && entry.trim()) {
      output[nextKey] = entry;
    }
  });
  return output;
}

function localeCodes() {
  return (i18n.options.supportedLngs || []).filter(
    (code) => code && code !== "cimode"
  );
}

function englishStrings() {
  return flattenStrings(i18n.getResourceBundle("en", "translation"));
}

function dedupePairs(pairs) {
  const seen = new Set();
  return pairs.filter((pair) => {
    const id = `${pair.from}\u0000${pair.to}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

/*
 * TranslationBridge is only a compatibility layer for legacy hard-coded
 * strings.  The important rule is that translations must never be applied
 * to arbitrary substrings of another word.  Doing that causes corruption
 * such as "Date" becoming part of "Update" or repeated mixed-language text.
 */
function buildTargetMap(language) {
  const english = englishStrings();
  const translated = flattenStrings(
    i18n.getResourceBundle(language, "translation")
  );

  const pairs = Object.keys(english).map((key) => ({
    from: english[key],
    to: translated[key] || english[key],
  }));

  const bridge =
    i18n.getResourceBundle(language, "translation")?.bridge || {};

  Object.entries(bridge).forEach(([from, to]) => {
    if (typeof from === "string" && typeof to === "string") {
      pairs.push({ from, to });
    }
  });

  return dedupePairs(pairs)
    .filter(({ from, to }) => from && to && from !== to)
    .sort((a, b) => b.from.length - a.from.length);
}

function buildRestoreMap() {
  const english = englishStrings();
  const pairs = [];

  localeCodes().forEach((language) => {
    const locale = flattenStrings(
      i18n.getResourceBundle(language, "translation")
    );

    Object.keys(english).forEach((key) => {
      const source = english[key];
      const translated = locale[key];

      if (translated && translated !== source) {
        pairs.push({ from: translated, to: source });
      }
    });

    const bridge =
      i18n.getResourceBundle(language, "translation")?.bridge || {};

    Object.entries(bridge).forEach(([from, to]) => {
      if (from && to && from !== to) {
        pairs.push({ from: to, to: from });
      }
    });
  });

  return dedupePairs(pairs).sort((a, b) => b.from.length - a.from.length);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isAsciiWordChar(char) {
  return !!char && /[A-Za-z0-9_]/.test(char);
}

/*
 * Safe replacement:
 * - first tries an exact whole-value match;
 * - only then allows phrase replacement when the matched phrase is not
 *   embedded inside an ASCII word.
 * This keeps future languages safe even when they contain English words.
 */
function replacePairs(source, pairs) {
  if (!source || !pairs.length) return source;

  const exact = pairs.find(({ from }) => from === source);
  if (exact) return exact.to;

  const lookup = new Map();
  const sources = [];

  pairs.forEach(({ from, to }) => {
    if (!from || lookup.has(from)) return;
    lookup.set(from, to);
    sources.push(from);
  });

  if (!sources.length) return source;

  const pattern = new RegExp(sources.map(escapeRegExp).join("|"), "g");

  return source.replace(pattern, (match, offset, whole) => {
    const before = whole[offset - 1];
    const after = whole[offset + match.length];

    // Never replace a source phrase when it is embedded inside an ASCII word.
    if (isAsciiWordChar(before) || isAsciiWordChar(after)) {
      return match;
    }

    // Single-character/unit keys such as "g" and "L" must be surrounded
    // by whitespace (or the start/end of a value). This prevents a unit
    // translation from corrupting punctuation in strings such as "e.g.".
    if (match.length <= 2) {
      const hasValidBefore = !before || /\s/.test(before);
      const hasValidAfter = !after || /\s/.test(after);
      if (!hasValidBefore || !hasValidAfter) {
        return match;
      }
    }

    return lookup.get(match) ?? match;
  });
}

function protectBrands(value) {
  let source = value;
  const protectedValues = [];

  BRAND_TOKENS.forEach((brand, index) => {
    const token = `__AGEVERSE_BRAND_${index}__`;
    const pattern = new RegExp(escapeRegExp(brand), "g");

    if (pattern.test(source)) {
      source = source.replace(pattern, token);
      protectedValues.push([token, brand]);
    }
  });

  return { source, protectedValues };
}

function restoreBrands(value, protectedValues) {
  return protectedValues.reduce(
    (text, [token, brand]) => text.replaceAll(token, brand),
    value
  );
}

function translateValue(value, restoreMap, targetMap) {
  if (!value?.trim()) return value;

  const language = i18n.resolvedLanguage || i18n.language || "en";
  const trimmed = value.trim();

  // Resolve an accidental raw i18next key first.
  if (trimmed === value && /^[A-Za-z0-9_.-]+$/.test(trimmed)) {
    const resolved = i18n.t(trimmed, { lng: language, defaultValue: "" });
    if (resolved && resolved !== trimmed) return resolved;
  }

  const { source, protectedValues } = protectBrands(value);

  // Exact restore first. This is the key protection against repeated
  // Hindi -> English -> Hindi substring corruption.
  const canonicalEnglish = replacePairs(source, restoreMap);
  const translated = replacePairs(canonicalEnglish, targetMap);

  return restoreBrands(translated, protectedValues);
}

function translateTextNode(node, restoreMap, targetMap) {
  const parent = node.parentElement;

  if (
    !parent ||
    SKIP_TAGS.has(parent.tagName) ||
    parent.closest('[data-translation-bridge-skip="true"]')
  ) {
    return;
  }

  const current = node.nodeValue;
  if (!current?.trim()) return;

  const translated = translateValue(current, restoreMap, targetMap);
  if (translated !== current) node.nodeValue = translated;
}

function translateAttributes(element, restoreMap, targetMap) {
  if (SKIP_TAGS.has(element.tagName)) return;

  TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
    const current = element.getAttribute(attribute);
    if (!current?.trim()) return;

    const translated = translateValue(current, restoreMap, targetMap);
    if (translated !== current) element.setAttribute(attribute, translated);
  });
}

function translateSelectOptions(restoreMap, targetMap) {
  document.querySelectorAll("select option").forEach((option) => {
    if (option.closest('[data-translation-bridge-skip="true"]')) return;

    const current = option.textContent;
    if (!current?.trim()) return;

    const translated = translateValue(current, restoreMap, targetMap);
    if (translated !== current) option.textContent = translated;
  });
}

function translatePage(restoreMap, targetMap) {
  if (!document.body) return;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach((node) => translateTextNode(node, restoreMap, targetMap));

  document
    .querySelectorAll("[placeholder], [title], [aria-label]")
    .forEach((element) => translateAttributes(element, restoreMap, targetMap));

  translateSelectOptions(restoreMap, targetMap);
}

function TranslationBridge() {
  const { i18n: currentI18n } = useTranslation();

  useEffect(() => {
    let frame = 0;
    let disposed = false;
    let queued = false;

    const schedule = () => {
      if (disposed || queued) return;

      queued = true;
      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        queued = false;
        if (disposed) return;

        const language =
          currentI18n.resolvedLanguage || currentI18n.language || "en";

        document.documentElement.lang = language;

        const restoreMap = buildRestoreMap();
        const targetMap = buildTargetMap(language);

        translatePage(restoreMap, targetMap);
      });
    };

    schedule();

    const handleLanguageChanged = (language) => {
      document.documentElement.lang = language;
      schedule();
    };

    currentI18n.on("languageChanged", handleLanguageChanged);

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRIBUTES,
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      currentI18n.off("languageChanged", handleLanguageChanged);
      observer.disconnect();
    };
  }, [currentI18n]);

  return null;
}

export default TranslationBridge;
