import { useState } from "react";
import "./FAQSection.css";
import { useTranslation } from "react-i18next";

function FAQSection() {
  const { t } = useTranslation();
  const faqs = Array.from({ length: 6 }, (_, index) => ({
    q: t(`home.faqs.q${index + 1}`),
    a: t(`home.faqs.a${index + 1}`),
  }));
  const [openIndex, setOpenIndex] = useState(null);
  const toggleFAQ = (index) => setOpenIndex(openIndex === index ? null : index);

  return (
    <section className="faq-section">
      <div className="faq-header">
        <span className="faq-eyebrow">{t("home.faq_eyebrow")}</span>
        <h2>{t("home.faq_title")}</h2>
        <p>{t("home.faq_subtitle")}</p>
      </div>

      <div className="faq-container">
        {faqs.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div className={`faq-card ${isOpen ? "faq-open" : ""}`} key={index}>
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
                aria-expanded={isOpen}
              >
                <span className="faq-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="faq-question-text">{item.q}</span>
                <span className="faq-toggle">{isOpen ? "−" : "+"}</span>
              </button>
              <div className="faq-answer">
                <div className="faq-answer-inner">{item.a}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="faq-footer">
        <div className="faq-footer-icon">💡</div>
        <div>
          <strong>{t("home.faq_footer_question")}</strong>
          <span>{t("home.faq_footer_action")}</span>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
