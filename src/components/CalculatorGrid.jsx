import "./CalculatorGrid.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const categories = [
  {
    title: "🎂 Age & Date",
    color: "age",
    calculators: [
      { key: "age_calculator", icon: "🎂", desc: "Calculate exact age in years, months and days.", route: "/age-calculator" },
      { key: "event_calculator", icon: "🎉", desc: "Countdown for birthdays, anniversaries, exams and more.", route: "/event-calculator" },
      { key: "date_difference", icon: "📅", desc: "Find exact difference between two dates.", route: "/date-difference" },
      { key: "retirement_calculator", icon: "👴", desc: "Calculate retirement timeline and remaining period.", route: "/retirement-calculator" }
    ]
  },
  {
    title: "🏥 Health Suite", color: "health",
    calculators: [
      { key: "health_profile", icon: "🏥", desc: "BMI, BMR, Calories, Nutrition, Water & Diet Plan.", route: "/health-profile" },
      ]
  },
  {
    title: "👶 Family", color: "family",
    calculators: [{ key: "pregnancy_calculator", icon: "🤰", desc: "Track pregnancy weeks and expected due date.", route: "/pregnancy-calculator" }]
  },
  {
    title: "🧮 Utility", color: "utility",
    calculators: [
      ["unit_converter","📏","Convert length, weight, temperature, volume and more.","/utility/unit-converter"],
      ["percentage_calculator","📊","Calculate percentages, increases, decreases and differences.","/utility/percentage-calculator"],
      ["gst_calculator","🧾","Calculate GST amount, inclusive and exclusive prices.","/utility/gst-calculator"],
      ["emi_calculator","💳","Calculate loan EMI, interest and total repayment.","/utility/emi-calculator"],
      ["discount_calculator","🏷️","Calculate discounts, savings and final selling price.","/utility/discount-calculator"],
      ["sip_calculator","📈","Estimate SIP investment growth and expected returns.","/utility/sip-calculator"],
      ["fd_calculator","🏦","Calculate fixed deposit maturity and interest.","/utility/fd-calculator"],
      ["rd_calculator","💰","Calculate recurring deposit maturity and interest.","/utility/rd-calculator"]
    ].map(([key,icon,desc,route]) => ({key,icon,desc,route}))
  },
  {
    title: "🐶 Pet", color: "pet",
    calculators: [{ key: "dog_age_calculator", icon: "🐶", desc: "Calculate your dog's age and human-age equivalent.", route: "/pet/dog-age-calculator" }]
  }
];

function CalculatorGrid() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="calculator-section" id="calculators">
      {categories.map((category) => (
        <div className="category-block" key={category.color}>
          <h2 className="category-title">{t(`category_names.${category.color}`, { defaultValue: category.title })}</h2>
          <div className="calculator-grid">
            {category.calculators.map((item) => (
              <div className={`calc-card ${category.color} featured`} key={item.route}>
                <div className="calc-icon">{item.icon}</div>
                <h3>{t(`calculator_names.${item.key}`)}</h3>
                <p>{t(`calculator_desc.${item.key}`, { defaultValue: item.desc })}</p>
                <span className="featured-badge">{t("home.new")}</span>
                <span className="live-badge">🟢 {t("common.live")}</span>
                <button type="button" onClick={() => navigate(item.route)}>
                  {t("common.open_calculator")}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export default CalculatorGrid;
