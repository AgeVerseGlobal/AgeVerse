import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./AgeCalculatorSEOContent.css";

export default function AgeCalculatorSEOContent() {
  const { t } = useTranslation();
  const data = t("seo_content.age_calculator", { returnObjects: true });

  return (
    <section className="age-seo-content">
      <div className="age-seo-inner">
        <header className="age-seo-header">
          <span className="age-seo-eyebrow">{data.eyebrow}</span>
          <h2>{data.title}</h2>
          <p>{data.intro}</p>
        </header>

        <article className="age-seo-card">
          <h2>{data.sections[0][0]}</h2>
          {data.sections[0][1].map((paragraph, i) => <p key={i}>{paragraph}</p>)}
        </article>

        <article className="age-seo-card">
          <h2>{data.stepsTitle}</h2>
          <p>{data.stepsIntro}</p>
          <ol className="age-seo-steps">
            {data.steps.map(([title, text], i) => (
              <li key={i}><strong>{title}</strong><span>{text}</span></li>
            ))}
          </ol>
        </article>

        <article className="age-seo-card">
          <h2>{data.sections[1][0]}</h2>
          {data.sections[1][1].map((paragraph, i) => <p key={i}>{paragraph}</p>)}
        </article>

        <article className="age-seo-card">
          <h2>{data.examplesTitle}</h2>
          <p>{data.examplesIntro}</p>
          <div className="age-seo-table-wrap">
            <table className="age-seo-table">
              <thead><tr>{data.tableHeaders.map((heading) => <th scope="col" key={heading}>{heading}</th>)}</tr></thead>
              <tbody>{data.examples.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <p className="age-seo-note">{data.examplesNote}</p>
        </article>

        <article className="age-seo-card">
          <h2>{data.featuresTitle}</h2>
          <ul className="age-seo-feature-list">
            {data.features.map(([title, text]) => <li key={title}><strong>{title}:</strong> {text}</li>)}
          </ul>
        </article>

        <article className="age-seo-card">
          <h2>{data.sections[2][0]}</h2>
          {data.sections[2][1].map((paragraph, i) => <p key={i}>{paragraph}</p>)}
        </article>

        <section className="age-seo-faq" aria-labelledby="age-seo-faq-title">
          <header className="age-seo-section-header">
            <span className="age-seo-eyebrow">{data.faqEyebrow}</span>
            <h2 id="age-seo-faq-title">{data.faqTitle}</h2>
            <p>{data.faqIntro}</p>
          </header>
          <div className="age-seo-faq-list">
            {data.faqs.map(([question, answer]) => (
              <details className="age-seo-faq-item" key={question}>
                <summary><span>{question}</span><span className="age-seo-faq-icon" aria-hidden="true">+</span></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="age-seo-related">
          <h2>{data.relatedTitle}</h2>
          <p>{data.relatedIntro}</p>
          <div className="age-seo-related-links">
            {data.related.map(([label, path]) => <Link to={path} key={path}>{label}</Link>)}
          </div>
        </section>
      </div>
    </section>
  );
}
