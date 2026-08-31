import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  copyResultImage,
  downloadResultPdf,
  shareResultPdf,
  printResultPdf,
  getSafeName,
} from "../utils/resultExport";
import "./GlobalResultActions.css";

const ROUTE_NAMES = {
  "/age-calculator": "Age_Calculator",
  "/event-calculator": "Event_Calculator",
  "/date-difference": "Date_Difference",
  "/retirement-calculator": "Retirement_Calculator",
  "/health-profile": "Health_Profile",
  "/pregnancy-calculator": "Pregnancy_Calculator",
  "/utility/unit-converter": "Unit_Converter",
  "/utility/percentage-calculator": "Percentage_Calculator",
  "/percentage-calculator": "Percentage_Calculator",
  "/utility/gst-calculator": "GST_Calculator",
  "/utility/emi-calculator": "EMI_Calculator",
  "/utility/discount-calculator": "Discount_Calculator",
  "/utility/sip-calculator": "SIP_Calculator",
  "/utility/fd-calculator": "FD_Calculator",
  "/utility/rd-calculator": "RD_Calculator",
  "/pet/dog-age-calculator": "Dog_Age_Calculator",
};

function findResultTarget() {
  // Some calculators render inside <main>, while the shared
  // CalculatorLayout pages use .calculator-page. Support both so the
  // common five-button action bar is available everywhere.
  const page =
    document.querySelector("main") ||
    document.querySelector(".calculator-page");

  if (!page) return null;

  // Prefer the actual result card so exports contain only the prepared result.
  const resultCard = page.querySelector(
    '[class*="result-card"]:not([class*="empty-result"])'
  );

  if (resultCard) return resultCard;

  /*
   * IMPORTANT:
   * Do not fall back to .calculator-right.
   *
   * Before a calculation, CalculatorLayout intentionally contains
   * an empty/result placeholder. Targeting the whole right panel
   * here would make the five global action buttons appear before
   * a result exists.
   *
   * The common action bar must attach ONLY to an actual result card.
   */
  return null;
}

function findResetButton() {
  const page =
    document.querySelector("main") ||
    document.querySelector(".calculator-page");

  if (!page) return null;

  return (
    page.querySelector('[class*="reset-button"]') ||
    page.querySelector('[class*="calculator-reset"]') ||
    page.querySelector('[class*="-reset"]') ||
    [...page.querySelectorAll("button")].find((button) =>
      /\breset\b/i.test(button.textContent || "")
    )
  );
}

function GlobalResultActions() {
  const location = useLocation();
  const { t } = useTranslation();

  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  const fileName = useMemo(() => {
    const name =
      ROUTE_NAMES[location.pathname] ||
      "AgeVerse_Result";

    return `${getSafeName(name)}.pdf`;
  }, [location.pathname]);

  const refreshTarget = useCallback(() => {
    const next = findResultTarget();

    setTarget((current) => (current === next ? current : next));
  }, []);

  useEffect(() => {
    let frame = 0;

    const scan = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(refreshTarget);
    };

    scan();

    const observer = new MutationObserver(scan);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [location.pathname, refreshTarget]);

  useEffect(() => {
    if (!target) return undefined;

    target.classList.add("ageverse-global-action-target");

    return () => {
      target.classList.remove("ageverse-global-action-target");
    };
  }, [target]);

  useEffect(() => {
    if (!message) return undefined;

    const timer = setTimeout(() => setMessage(""), 3000);

    return () => clearTimeout(timer);
  }, [message]);

  if (!target) return null;

  const run = async (type, action) => {
    if (busy) return;

    setBusy(type);
    setMessage("");

    try {
      const result = await action();

      if (type === "copy") {
        setMessage(
          result === "copied"
            ? t("result_actions.copy_success")
            : t("result_actions.copy_fallback")
        );
      } else if (type === "share") {
        setMessage(t("result_actions.share_success"));
      } else {
        setMessage("");
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        setMessage(
          error?.message ||
            t("result_actions.generic_error")
        );
      }
    } finally {
      setBusy("");
    }
  };

  const handleNew = () => {
    const reset = findResetButton();

    if (reset) {
      reset.click();
      setMessage(t("result_actions.new_success"));
    } else {
      window.location.reload();
    }
  };

  return createPortal(
    <div
      className="ageverse-global-result-actions"
      data-ageverse-result-actions
      aria-label={t("result_actions.aria_label")}
    >
      <button
        type="button"
        disabled={Boolean(busy)}
        onClick={() =>
          run("copy", () => copyResultImage(target))
        }
      >
        <span aria-hidden="true">📋</span>
        {t("result_actions.copy_image")}
      </button>

      <button
        type="button"
        disabled={Boolean(busy)}
        onClick={() =>
          run("download", () =>
            downloadResultPdf(target, fileName)
          )
        }
      >
        <span aria-hidden="true">📄</span>
        {t("result_actions.download_pdf")}
      </button>

      <button
        type="button"
        disabled={Boolean(busy)}
        onClick={() =>
          run("share", () =>
            shareResultPdf(
              target,
              fileName,
              t("common.app_name")
            )
          )
        }
      >
        <span aria-hidden="true">📤</span>
        {t("result_actions.share_pdf")}
      </button>

      <button
        type="button"
        disabled={Boolean(busy)}
        onClick={() =>
          run("print", () => printResultPdf(target))
        }
      >
        <span aria-hidden="true">🖨️</span>
        {t("result_actions.print")}
      </button>

      <button
        type="button"
        disabled={Boolean(busy)}
        onClick={handleNew}
      >
        <span aria-hidden="true">🔄</span>
        {t("result_actions.new")}
      </button>

      {message && (
        <span
          className="ageverse-result-action-message"
          role="status"
        >
          {message}
        </span>
      )}
    </div>,
    target
  );
}

export default GlobalResultActions;
