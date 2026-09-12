import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../i18n/config";

const ATTRIBUTES = ["placeholder", "title", "aria-label"];
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"]);
const BRAND_TOKENS = ["AgeVerseGlobal"];

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


function dedupePairs(pairs) {
  const seen = new Set();
  return pairs.filter((pair) => {
    const id = `${pair.from}\u0000${pair.to}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function buildTargetMap(language) {
  const english = flattenStrings(i18n.getResourceBundle("en", "translation"));
  const translated = flattenStrings(i18n.getResourceBundle(language, "translation"));
  const pairs = Object.keys(english).map((key) => ({
    from: english[key],
    to: translated[key] || english[key],
  }));
  const bridge = i18n.getResourceBundle(language, "translation")?.bridge || {};
  Object.entries(bridge).forEach(([from, to]) => {
    if (typeof from === "string" && typeof to === "string") pairs.push({ from, to });
  });
  return dedupePairs(pairs)
    .filter(({ from, to }) => from && to && from !== to)
    .sort((a, b) => b.from.length - a.from.length);
}

function buildRestoreMap(language) {
  if (!language || language === "en") return [];

  const english = flattenStrings(i18n.getResourceBundle("en", "translation"));
  const locale = flattenStrings(i18n.getResourceBundle(language, "translation"));
  const pairs = [];

  Object.keys(english).forEach((key) => {
    if (locale[key] && locale[key] !== english[key]) {
      pairs.push({ from: locale[key], to: english[key] });
    }
  });

  const bridge = i18n.getResourceBundle(language, "translation")?.bridge || {};
  Object.entries(bridge).forEach(([from, to]) => {
    if (from && to && from !== to) pairs.push({ from: to, to: from });
  });

  return dedupePairs(pairs).sort((a, b) => b.from.length - a.from.length);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function isAsciiWordChar(char) { return !!char && /[A-Za-z0-9_]/.test(char); }

function replacePairs(source, pairs) {
  if (!source || !pairs.length) return source;
  const exact = pairs.find(({ from }) => from === source);
  if (exact) return exact.to;
  const lookup = new Map();
  const sources = [];
  pairs.forEach(({ from, to }) => {
    if (from && !lookup.has(from)) { lookup.set(from, to); sources.push(from); }
  });
  if (!sources.length) return source;
  const pattern = new RegExp(sources.map(escapeRegExp).join("|"), "g");
  return source.replace(pattern, (match, offset, whole) => {
    const before = whole[offset - 1];
    const after = whole[offset + match.length];
    if (isAsciiWordChar(before) || isAsciiWordChar(after)) return match;
    if (match.length <= 2) {
      if ((!before || /\s/.test(before)) && (!after || /\s/.test(after))) return lookup.get(match) ?? match;
      return match;
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
    if (pattern.test(source)) { source = source.replace(pattern, token); protectedValues.push([token, brand]); }
  });
  return { source, protectedValues };
}
function restoreBrands(value, protectedValues) {
  return protectedValues.reduce((text, [token, brand]) => text.replaceAll(token, brand), value);
}

function translateValue(value, restoreMap, targetMap) {
  if (!value?.trim()) return value;
  const language = i18n.resolvedLanguage || i18n.language || "en";
  const trimmed = value.trim();
  if (trimmed === value && /^[A-Za-z0-9_.-]+$/.test(trimmed)) {
    const resolved = i18n.t(trimmed, { lng: language, defaultValue: "" });
    if (resolved && resolved !== trimmed) return resolved;
  }
  const { source, protectedValues } = protectBrands(value);
  return restoreBrands(replacePairs(replacePairs(source, restoreMap), targetMap), protectedValues);
}

function shouldSkip(element) {
  return !element || SKIP_TAGS.has(element.tagName) || element.closest?.('[data-translation-bridge-skip="true"]');
}
function translateTextNode(node, restoreMap, targetMap, bridgeMutations) {
  const parent = node.parentElement;
  if (shouldSkip(parent)) return;
  const current = node.nodeValue;
  if (!current?.trim()) return;
  const translated = translateValue(current, restoreMap, targetMap);
  if (translated !== current) {
    bridgeMutations?.add(node);
    node.nodeValue = translated;
  }
}
function translateAttributes(element, restoreMap, targetMap, bridgeMutations) {
  if (shouldSkip(element)) return;
  ATTRIBUTES.forEach((attribute) => {
    const current = element.getAttribute?.(attribute);
    if (!current?.trim()) return;
    const translated = translateValue(current, restoreMap, targetMap);
    if (translated !== current) {
      bridgeMutations?.add(element);
      element.setAttribute(attribute, translated);
    }
  });
}
function translateSubtree(root, restoreMap, targetMap, bridgeMutations) {
  if (!root) return;
  if (root.nodeType === Node.TEXT_NODE) { translateTextNode(root, restoreMap, targetMap, bridgeMutations); return; }
  if (root.nodeType !== Node.ELEMENT_NODE || shouldSkip(root)) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => translateTextNode(node, restoreMap, targetMap, bridgeMutations));
  if (root.matches?.("[placeholder], [title], [aria-label]")) translateAttributes(root, restoreMap, targetMap, bridgeMutations);
  root.querySelectorAll?.("[placeholder], [title], [aria-label]").forEach((element) => translateAttributes(element, restoreMap, targetMap, bridgeMutations));
}
function translatePage(restoreMap, targetMap, bridgeMutations) { translateSubtree(document.body, restoreMap, targetMap, bridgeMutations); }

function TranslationBridge() {
  const { i18n: currentI18n } = useTranslation();
  useEffect(() => {
    let disposed = false;
    let frame = 0;
    let queued = false;
    const pending = new Set();
    const bridgeMutations = new WeakSet();
    let activeLanguage = currentI18n.resolvedLanguage || currentI18n.language || "en";
    let previousLanguage = "en";
    let restoreMap = buildRestoreMap(previousLanguage);
    let targetMap = buildTargetMap(activeLanguage);

    const flush = () => {
      queued = false;
      if (disposed) return;
      const roots = Array.from(pending); pending.clear();
      roots.forEach((root) => translateSubtree(root, restoreMap, targetMap, bridgeMutations));
    };
    const schedule = (root) => {
      if (root) pending.add(root);
      if (disposed || queued) return;
      queued = true;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(flush);
    };
    const applyLanguage = (language) => {
      previousLanguage = language === activeLanguage ? "en" : activeLanguage;
      activeLanguage = language;
      document.documentElement.lang = language;
      restoreMap = buildRestoreMap(previousLanguage);
      targetMap = buildTargetMap(language);
      pending.clear();

      // One immediate pass handles the current DOM; one animation-frame pass
      // handles React's result-card commit after i18next changes. Avoiding the
      // previous full-page third pass keeps language switching responsive.
      translatePage(restoreMap, targetMap, bridgeMutations);
      requestAnimationFrame(() => {
        if (disposed) return;
        translatePage(restoreMap, targetMap, bridgeMutations);
      });
    };

    applyLanguage(activeLanguage);
    const handleLanguageChanged = (language) => applyLanguage(language);
    currentI18n.on("languageChanged", handleLanguageChanged);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "characterData") {
          if (bridgeMutations.has(mutation.target)) {
            bridgeMutations.delete(mutation.target);
            return;
          }
          schedule(mutation.target);
        } else if (mutation.type === "attributes") {
          if (bridgeMutations.has(mutation.target)) {
            bridgeMutations.delete(mutation.target);
            return;
          }
          schedule(mutation.target);
        } else {
          mutation.addedNodes.forEach((node) => schedule(node));
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTES });

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
