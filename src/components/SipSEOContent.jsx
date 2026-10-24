import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./SipSEO.css";

export default function SipSEOContent() {
  const { t } = useTranslation();
  const data = t("seo_content.sip", { returnObjects: true });
  return (
    <section className="sip-seo-content">
      <div className="sip-seo-inner">
        <header className="sip-seo-header">
          <span className="sip-seo-eyebrow">{data.eyebrow}</span>
          <h2>{data.title}</h2>
          <p>{data.intro}</p>
        </header>
        {data.sections.slice(0, 3).map((section) => (
          <article className="sip-seo-card" key={section[0]}>
            <h2>{section[0]}</h2>
            {section[1].map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </article>
        ))}
        <article className="sip-seo-card">
          <h2>{data.examplesTitle}</h2>
          <p>{data.examplesIntro}</p>
          <div className="sip-seo-table-wrap">
            <table className="sip-seo-table">
              <thead><tr>{data.tableHeaders.map((h) => <th scope="col" key={h}>{h}</th>)}</tr></thead>
              <tbody>{data.examples.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <p className="sip-seo-note">{data.examplesNote}</p>
        </article>
        <article className="sip-seo-card">
          <h2>{data.featuresTitle}</h2>
          <ul className="sip-seo-feature-list">{data.features.map(([title, text]) => <li key={title}><strong>{title}:</strong> {text}</li>)}</ul>
        </article>
        <article className="sip-seo-card">
          <h2>{data.sections[3][0]}</h2>
          {data.sections[3][1].map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </article>
        <section className="sip-seo-faq" aria-labelledby={`${data.name}-faq-title`}>
          <header className="sip-seo-section-header">
            <span className="sip-seo-eyebrow">{data.faqEyebrow}</span>
            <h2 id={`${data.name}-faq-title`}>{data.faqTitle}</h2>
            <p>{data.faqIntro}</p>
          </header>
          <div className="sip-seo-faq-list">{data.faqs.map(([question, answer]) => (
            <details className="sip-seo-faq-item" key={question}>
              <summary><span>{question}</span><span className="sip-seo-faq-icon" aria-hidden="true">+</span></summary>
              <p>{answer}</p>
            </details>
          ))}</div>
        </section>
        <section className="sip-seo-related">
          <h2>{data.relatedTitle}</h2>
          <p>{data.relatedIntro}</p>
          <div className="sip-seo-related-links">{data.related.map(([label, path]) => <Link to={path} key={path}>{label}</Link>)}</div>
        </section>
      </div>
    </section>
  );
}
