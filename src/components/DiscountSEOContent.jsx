import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./DiscountSEO.css";

export default function DiscountSEOContent() {
  const { t } = useTranslation();
  const data = t("seo_content.discount", { returnObjects: true });
  return (
    <section className="discount-seo-content">
      <div className="discount-seo-inner">
        <header className="discount-seo-header">
          <span className="discount-seo-eyebrow">{data.eyebrow}</span>
          <h2>{data.title}</h2>
          <p>{data.intro}</p>
        </header>
        {data.sections.slice(0, 3).map((section) => (
          <article className="discount-seo-card" key={section[0]}>
            <h2>{section[0]}</h2>
            {section[1].map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </article>
        ))}
        <article className="discount-seo-card">
          <h2>{data.examplesTitle}</h2>
          <p>{data.examplesIntro}</p>
          <div className="discount-seo-table-wrap">
            <table className="discount-seo-table">
              <thead><tr>{data.tableHeaders.map((h) => <th scope="col" key={h}>{h}</th>)}</tr></thead>
              <tbody>{data.examples.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <p className="discount-seo-note">{data.examplesNote}</p>
        </article>
        <article className="discount-seo-card">
          <h2>{data.featuresTitle}</h2>
          <ul className="discount-seo-feature-list">{data.features.map(([title, text]) => <li key={title}><strong>{title}:</strong> {text}</li>)}</ul>
        </article>
        <article className="discount-seo-card">
          <h2>{data.sections[3][0]}</h2>
          {data.sections[3][1].map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </article>
        <section className="discount-seo-faq" aria-labelledby={`${data.name}-faq-title`}>
          <header className="discount-seo-section-header">
            <span className="discount-seo-eyebrow">{data.faqEyebrow}</span>
            <h2 id={`${data.name}-faq-title`}>{data.faqTitle}</h2>
            <p>{data.faqIntro}</p>
          </header>
          <div className="discount-seo-faq-list">{data.faqs.map(([question, answer]) => (
            <details className="discount-seo-faq-item" key={question}>
              <summary><span>{question}</span><span className="discount-seo-faq-icon" aria-hidden="true">+</span></summary>
              <p>{answer}</p>
            </details>
          ))}</div>
        </section>
        <section className="discount-seo-related">
          <h2>{data.relatedTitle}</h2>
          <p>{data.relatedIntro}</p>
          <div className="discount-seo-related-links">{data.related.map(([label, path]) => <Link to={path} key={path}>{label}</Link>)}</div>
        </section>
      </div>
    </section>
  );
}
