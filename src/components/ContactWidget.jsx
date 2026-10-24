import "./ContactWidget.css";
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

function ContactWidget({ open, onClose }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const page = useMemo(
    () => pageNames[location.pathname] || location.pathname || "Website",
    [location.pathname]
  );

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !sending) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, sending, onClose]);

  useEffect(() => {
    if (!open) return;
    setStatus("");
    setError("");
  }, [open]);

  if (!open) return null;

  const submit = async (event) => {
    event.preventDefault();
    setStatus("");
    setError("");

    if (!name.trim()) {
      setError(t("contact_page.name_required"));
      return;
    }
    if (!email.trim()) {
      setError(t("contact_page.email_required"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(t("contact_page.email_invalid"));
      return;
    }
    if (!subject.trim()) {
      setError(t("contact_page.subject_required"));
      return;
    }
    if (!message.trim()) {
      setError(t("contact_page.message_required"));
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim().slice(0, 120),
          email: email.trim().slice(0, 200),
          subject: subject.trim().slice(0, 200),
          message: message.trim().slice(0, 4000),
          page,
          dateTime: new Date().toISOString(),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        throw new Error(data.error || t("contact_page.error"));
      }
      setStatus(t("contact_page.success"));
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (submitError) {
      setError(submitError.message || t("contact_page.error"));
    } finally {
      setSending(false);
    }
  };

  return createPortal(
    <div className="ageverse-contact-backdrop" role="presentation" onClick={() => !sending && onClose()}>
      <section
        className="ageverse-contact-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ageverse-contact-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ageverse-contact-header">
          <div>
            <h2 id="ageverse-contact-title">{t("contact_page.form_title")}</h2>
            <p>{t("contact_page.form_intro")}</p>
          </div>
          <button
            type="button"
            className="ageverse-contact-close"
            onClick={onClose}
            disabled={sending}
            aria-label={t("contact_page.close")}
          >
            ×
          </button>
        </div>

        <form className="ageverse-contact-form" onSubmit={submit}>
          <div className="ageverse-contact-grid">
            <label>
              <span>{t("contact_page.name")}</span>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" />
            </label>
            <label>
              <span>{t("contact_page.email")}</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} autoComplete="email" />
            </label>
          </div>

          <label>
            <span>{t("contact_page.subject")}</span>
            <select value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="">{t("contact_page.subject_required")}</option>
              <option value="General Enquiry">{t("contact_page.subject_general_enquiry")}</option>
              <option value="Calculator Issue">{t("contact_page.subject_calculator_issue")}</option>
              <option value="Calculation / Result Issue">{t("contact_page.subject_calculation_result_issue")}</option>
              <option value="Translation / Language Issue">{t("contact_page.subject_translation_language_issue")}</option>
              <option value="Website Problem">{t("contact_page.subject_website_problem")}</option>
              <option value="Suggestion">{t("contact_page.subject_suggestion")}</option>
              <option value="Business / Partnership">{t("contact_page.subject_business_partnership")}</option>
              <option value="Other">{t("contact_page.subject_other")}</option>
            </select>
          </label>

          <label>
            <span>{t("contact_page.message")}</span>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={4000} rows={6} />
          </label>

          <p className="ageverse-contact-notice">{t("contact_page.privacy_notice")}</p>
          <p className="ageverse-contact-page">{t("contact_page.page_label")}: {page}</p>

          {error && <div className="ageverse-contact-status is-error" role="alert">{error}</div>}
          {status && <div className="ageverse-contact-status is-success" role="status">{status}</div>}

          <button type="submit" className="ageverse-contact-submit" disabled={sending}>
            {sending ? t("contact_page.sending") : t("contact_page.submit")}
          </button>
        </form>
      </section>
    </div>,
    document.body
  );
}

export default ContactWidget;
