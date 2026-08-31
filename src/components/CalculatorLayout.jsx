import "./CalculatorLayout.css";

function CalculatorLayout({
  title,
  subtitle,
  children,
  result
}) {
  return (
    <div className="calculator-page age-calculator-layout">

      <div className="calculator-container">

        {/* =========================
            LEFT — INPUT PANEL
        ========================= */}

        <div className="calculator-left">

          <h1>{title}</h1>

          <p>{subtitle}</p>

          {children}

        </div>


        {/* =========================
            RIGHT — RESULT PANEL
        ========================= */}

        <div className="calculator-right age-calculator-result-area">

          {result}

        </div>

      </div>

    </div>
  );
}

export default CalculatorLayout;