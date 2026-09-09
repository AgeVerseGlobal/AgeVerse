import "./TestimonialSection.css";
import { useTranslation } from "react-i18next";

function TestimonialSection() {
  const { t } = useTranslation();
  const testimonials = [
    { name: "Rahul Sharma", key: "rahul", rating: 5, avatar: "RS" },
    { name: "Priya Singh", key: "priya", rating: 5, avatar: "PS" },
    { name: "Amit Kumar", key: "amit", rating: 5, avatar: "AK" },
  ];

  return (
    <section className="testimonial-section">
      <div className="testimonial-header">
        <span className="testimonial-eyebrow">{t("home.testimonials_eyebrow")}</span>
        <h2>{t("home.testimonials_title")}</h2>
        <p className="testimonial-subtitle">{t("home.testimonials_subtitle")}</p>
      </div>

      <div className="testimonial-grid">
        {testimonials.map((item) => (
          <article className="testimonial-card" key={item.key}>
            <div className="testimonial-top">
              <div className="user-avatar">{item.avatar}</div>
              <div className="user-details">
                <h3>{item.name}</h3>
                <span>{t(`home.testimonial_roles.${item.key}`)}</span>
              </div>
              <div className="verified-badge">✓</div>
            </div>
            <div className="rating">{"★".repeat(item.rating)}</div>
            <div className="quote-mark">“</div>
            <p className="testimonial-review">{t(`home.testimonial_reviews.${item.key}`)}</p>
            <div className="testimonial-footer">
              <span>{t("home.verified_user")}</span>
              <span>✓</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default TestimonialSection;
