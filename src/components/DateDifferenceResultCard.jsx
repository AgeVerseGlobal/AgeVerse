import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import "./DateDifferenceResultCard.css";

function DateDifferenceResultCard({ result, fromDate, toDate }) {
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "en";

  const dateFormatter = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return new Intl.DateTimeFormat("en", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  }, [locale]);

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date);
  };

  if (!result) return null;

  return (
    <section className="date-difference-result-card" aria-live="polite">
      <header className="date-difference-result-header">
        <span className="date-difference-result-eyebrow">CALCULATION RESULT</span>
        <h2>Date Difference</h2>
        <p>{formatDate(fromDate)} <span aria-hidden="true">→</span> {formatDate(toDate)}</p>
      </header>

      <div className="date-difference-result-primary">
        <span className="date-difference-result-label">Elapsed time</span>
        <strong>
          {result.years} {result.years === 1 ? "year" : "years"}, {result.months} {result.months === 1 ? "month" : "months"}, {result.days} {result.days === 1 ? "day" : "days"}
        </strong>
      </div>

      <div className="date-difference-result-grid">
        <div className="date-difference-result-metric"><span>Total days</span><strong>{Number(result.totalDays || 0).toLocaleString(locale)}</strong></div>
        <div className="date-difference-result-metric"><span>Total weeks</span><strong>{Number(result.totalWeeks || 0).toLocaleString(locale)}</strong></div>
        <div className="date-difference-result-metric"><span>Total months</span><strong>{Number(result.totalMonths || 0).toLocaleString(locale)}</strong></div>
        <div className="date-difference-result-metric"><span>Total years (approx.)</span><strong>{Number(result.totalYears || 0).toLocaleString(locale)}</strong></div>
        <div className="date-difference-result-metric"><span>Total hours</span><strong>{Number(result.totalHours || 0).toLocaleString(locale)}</strong></div>
        <div className="date-difference-result-metric"><span>Total minutes</span><strong>{Number(result.totalMinutes || 0).toLocaleString(locale)}</strong></div>
      </div>
      <p className="date-difference-result-note">Elapsed days exclude the start date. For official deadlines, check whether inclusive counting is required.</p>
    </section>
  );
}

export default DateDifferenceResultCard;
