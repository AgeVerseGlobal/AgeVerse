import "./FeedbackWidget.css";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const pageNames = {
  "/": "Home",
  "/age-calculator": "Age Calculator",
  "/event-calculator": "Event Calculator",
  "/date-difference": "Date Difference",
  "/retirement-calculator": "Retirement Calculator",
  "/health-profile": "Health Profile",
  "/pregnancy-calculator": "Pregnancy Calculator",
  "/utility/unit-converter": "Unit Converter",
  "/utility/percentage-calculator": "Percentage Calculator",
  "/utility/gst-calculator": "GST Calculator",
  "/utility/emi-calculator": "EMI Calculator",
  "/utility/discount-calculator": "Discount Calculator",
  "/utility/sip-calculator": "SIP Calculator",
  "/utility/fd-calculator": "FD Calculator",
  "/utility/rd-calculator": "RD Calculator",
  "/pet/dog-age-calculator": "Dog Age Calculator",
  "/about": "About",
  "/contact": "Contact",
  "/privacy-policy": "Privacy Policy",
  "/terms": "Terms & Conditions",
  "/disclaimer": "Disclaimer",
};

function FeedbackWidget() {
  const { t } = useTranslation();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const page = useMemo(
    () => pageNames[location.pathname] || location.pathname || "Website",
    [location.pathname]
  );

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  useEffect(() => {
    setMessage("");
    setError("");
  }, [location.pathname]);

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!rating) {
      setError(t("common.feedback_rating_required"));
      return;
    }
    if (!feedback.trim()) {
      setError(t("common.feedback_message_required"));
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          feedback: feedback.trim().slice(0, 2000),
          page,
          dateTime: new Date().toISOString(),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || t("common.feedback_error"));
      setMessage(t("common.feedback_success"));
      setRating(0);
      setFeedback("");
    } catch (submitError) {
      setError(submitError.message || t("common.feedback_error"));
    } finally {
      setSending(false);
    }
  };

  return createPortal(
    <>
      <button
        type="button"
        className="ageverse-feedback-trigger"
        onClick={() => { setOpen(true); setMessage(""); setError(""); }}
        aria-label={t("common.feedback")}
      >
        <span aria-hidden="true">💬</span>
        <span>{t("common.feedback")}</span>
      </button>

      {open && (
        <div className="ageverse-feedback-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <section
            className="ageverse-feedback-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ageverse-feedback-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="ageverse-feedback-header">
              <div>
                <div id="ageverse-feedback-title" className="ageverse-feedback-title">{t("common.feedback_title")}</div>
                <div className="ageverse-feedback-page">{page}</div>
              </div>
              <button type="button" className="ageverse-feedback-close" onClick={() => setOpen(false)} aria-label={t("common.feedback_close")}>×</button>
            </div>

            <form onSubmit={submit} className="ageverse-feedback-form">
              <fieldset className="ageverse-feedback-rating">
                <legend>{t("common.feedback_rating")}</legend>
                <div className="ageverse-feedback-stars" aria-label={t("common.feedback_rating")}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={value <= rating ? "is-selected" : ""}
                      onClick={() => setRating(value)}
                      aria-label={`${value} ${t("common.feedback_rating")}`}
                      aria-pressed={value === rating}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="ageverse-feedback-label" htmlFor="ageverse-feedback-message">
                {t("common.feedback_feedback")}
              </label>
              <textarea
                id="ageverse-feedback-message"
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder={t("common.feedback_placeholder")}
                maxLength={2000}
                rows={5}
              />

              <p className="ageverse-feedback-privacy">{t("common.feedback_privacy_notice")}</p>

              {error && <div className="ageverse-feedback-status is-error" role="alert">{error}</div>}
              {message && <div className="ageverse-feedback-status is-success" role="status">{message}</div>}

              <button type="submit" className="ageverse-feedback-submit" disabled={sending}>
                {sending ? t("common.feedback_sending") : t("common.submit")}
              </button>
            </form>
          </section>
        </div>
      )}
    </>,
    document.body
  );
}

export default FeedbackWidget;
