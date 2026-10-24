import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./PregnancySEO.css";

export default function PregnancySEOContent() {
  const { t } = useTranslation();
  const data = t("seo_content.pregnancy", { returnObjects: true });
  return (
    <section className="pregnancy-seo-content">
      <div className="pregnancy-seo-inner">
        <header className="pregnancy-seo-header">
          <span className="pregnancy-seo-eyebrow">{data.eyebrow}</span>
          <h2>{data.title}</h2>
          <p>{data.intro}</p>
        </header>
        {data.sections.slice(0, 3).map((section) => (
          <article className="pregnancy-seo-card" key={section[0]}>
            <h2>{section[0]}</h2>
            {section[1].map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </article>
        ))}
        <article className="pregnancy-seo-card">
          <h2>{data.examplesTitle}</h2>
          <p>{data.examplesIntro}</p>
          <div className="pregnancy-seo-table-wrap">
            <table className="pregnancy-seo-table">
              <thead><tr>{data.tableHeaders.map((h) => <th scope="col" key={h}>{h}</th>)}</tr></thead>
              <tbody>{data.examples.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <p className="pregnancy-seo-note">{data.examplesNote}</p>
        </article>
        <article className="pregnancy-seo-card">
          <h2>{data.featuresTitle}</h2>
          <ul className="pregnancy-seo-feature-list">{data.features.map(([title, text]) => <li key={title}><strong>{title}:</strong> {text}</li>)}</ul>
        </article>
        <article className="pregnancy-seo-card">
          <h2>{data.sections[3][0]}</h2>
          {data.sections[3][1].map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </article>
        <section className="pregnancy-seo-faq" aria-labelledby={`${data.name}-faq-title`}>
          <header className="pregnancy-seo-section-header">
            <span className="pregnancy-seo-eyebrow">{data.faqEyebrow}</span>
            <h2 id={`${data.name}-faq-title`}>{data.faqTitle}</h2>
            <p>{data.faqIntro}</p>
          </header>
          <div className="pregnancy-seo-faq-list">{data.faqs.map(([question, answer]) => (
            <details className="pregnancy-seo-faq-item" key={question}>
              <summary><span>{question}</span><span className="pregnancy-seo-faq-icon" aria-hidden="true">+</span></summary>
              <p>{answer}</p>
            </details>
          ))}</div>
        </section>
        <section className="pregnancy-seo-related">
          <h2>{data.relatedTitle}</h2>
          <p>{data.relatedIntro}</p>
          <div className="pregnancy-seo-related-links">{data.related.map(([label, path]) => <Link to={path} key={path}>{label}</Link>)}</div>
        </section>
      </div>
    </section>
  );
}
