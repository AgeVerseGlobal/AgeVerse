import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./GstSEO.css";

export default function GstSEOContent() {
  const { t } = useTranslation();
  const data = t("seo_content.gst", { returnObjects: true });
  return (
    <section className="gst-seo-content">
      <div className="gst-seo-inner">
        <header className="gst-seo-header">
          <span className="gst-seo-eyebrow">{data.eyebrow}</span>
          <h2>{data.title}</h2>
          <p>{data.intro}</p>
        </header>
        {data.sections.slice(0, 3).map((section) => (
          <article className="gst-seo-card" key={section[0]}>
            <h2>{section[0]}</h2>
            {section[1].map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </article>
        ))}
        <article className="gst-seo-card">
          <h2>{data.examplesTitle}</h2>
          <p>{data.examplesIntro}</p>
          <div className="gst-seo-table-wrap">
            <table className="gst-seo-table">
              <thead><tr>{data.tableHeaders.map((h) => <th scope="col" key={h}>{h}</th>)}</tr></thead>
              <tbody>{data.examples.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <p className="gst-seo-note">{data.examplesNote}</p>
        </article>
        <article className="gst-seo-card">
          <h2>{data.featuresTitle}</h2>
          <ul className="gst-seo-feature-list">{data.features.map(([title, text]) => <li key={title}><strong>{title}:</strong> {text}</li>)}</ul>
        </article>
        <article className="gst-seo-card">
          <h2>{data.sections[3][0]}</h2>
          {data.sections[3][1].map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </article>
        <section className="gst-seo-faq" aria-labelledby={`${data.name}-faq-title`}>
          <header className="gst-seo-section-header">
            <span className="gst-seo-eyebrow">{data.faqEyebrow}</span>
            <h2 id={`${data.name}-faq-title`}>{data.faqTitle}</h2>
            <p>{data.faqIntro}</p>
          </header>
          <div className="gst-seo-faq-list">{data.faqs.map(([question, answer]) => (
            <details className="gst-seo-faq-item" key={question}>
              <summary><span>{question}</span><span className="gst-seo-faq-icon" aria-hidden="true">+</span></summary>
              <p>{answer}</p>
            </details>
          ))}</div>
        </section>
        <section className="gst-seo-related">
          <h2>{data.relatedTitle}</h2>
          <p>{data.relatedIntro}</p>
          <div className="gst-seo-related-links">{data.related.map(([label, path]) => <Link to={path} key={path}>{label}</Link>)}</div>
        </section>
      </div>
    </section>
  );
}
