import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";

// Route-level code splitting: calculator and information pages
// load only when they are visited.
const DateDifferenceCalculator = lazy(() =>
  import("../pages/DateDifferenceCalculator")
);

const AgeCalculator = lazy(() =>
  import("../pages/ageCalculator")
);

const EventCalculator = lazy(() =>
  import("../pages/EventCalculator")
);

const RetirementCalculator = lazy(() =>
  import("../pages/RetirementCalculator")
);

const HealthProfileCalculator = lazy(() =>
  import("../pages/HealthProfileCalculator")
);

const PregnancyCalculator = lazy(() =>
  import("../pages/PregnancyCalculator")
);

const UnitConverter = lazy(() =>
  import("../pages/UnitConverter")
);

const PercentageCalculator = lazy(() =>
  import("../pages/PercentageCalculator")
);

const GstCalculator = lazy(() =>
  import("../components/GstCalculator")
);

const EmiCalculator = lazy(() =>
  import("../components/EmiCalculator")
);

const DiscountCalculator = lazy(() =>
  import("../components/DiscountCalculator")
);

const SipCalculator = lazy(() =>
  import("../pages/SipCalculator")
);

const FdCalculator = lazy(() =>
  import("../pages/FdCalculator")
);

const RdCalculator = lazy(() =>
  import("../pages/RdCalculator")
);

const DogAgeCalculator = lazy(() =>
  import("../pages/DogAgeCalculator")
);

const About = lazy(() =>
  import("../pages/About")
);

const Contact = lazy(() =>
  import("../pages/Contact")
);

const PrivacyPolicy = lazy(() =>
  import("../pages/PrivacyPolicy")
);

const Terms = lazy(() =>
  import("../pages/Terms")
);

const Disclaimer = lazy(() =>
  import("../pages/Disclaimer")
);

const NotFound = lazy(() =>
  import("../pages/NotFound")
);

function AppRoutes() {
  return (
    <Suspense fallback={<div className="route-loading" aria-hidden="true" />}>
      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={<Home />}
        />

        {/* AGE & DATE */}
        <Route
          path="/age-calculator"
          element={<AgeCalculator />}
        />

        <Route
          path="/event-calculator"
          element={<EventCalculator />}
        />

        <Route
          path="/date-difference"
          element={<DateDifferenceCalculator />}
        />

        <Route
          path="/retirement-calculator"
          element={<RetirementCalculator />}
        />

        {/* HEALTH */}
        <Route
          path="/health-profile"
          element={<HealthProfileCalculator />}
        />

        {/* FAMILY */}
        <Route
          path="/pregnancy-calculator"
          element={<PregnancyCalculator />}
        />

        {/* UTILITY */}
        <Route
          path="/utility/unit-converter"
          element={<UnitConverter />}
        />

        <Route
          path="/utility/percentage-calculator"
          element={<PercentageCalculator />}
        />

        {/* OLD PERCENTAGE URL REDIRECT */}
        <Route
          path="/percentage-calculator"
          element={
            <Navigate
              to="/utility/percentage-calculator"
              replace
            />
          }
        />

        <Route
          path="/utility/gst-calculator"
          element={<GstCalculator />}
        />

        <Route
          path="/utility/emi-calculator"
          element={<EmiCalculator />}
        />

        <Route
          path="/utility/discount-calculator"
          element={<DiscountCalculator />}
        />

        <Route
          path="/utility/sip-calculator"
          element={<SipCalculator />}
        />

        <Route
          path="/utility/fd-calculator"
          element={<FdCalculator />}
        />

        <Route
          path="/utility/rd-calculator"
          element={<RdCalculator />}
        />

        {/* PET */}
        <Route
          path="/pet/dog-age-calculator"
          element={<DogAgeCalculator />}
        />

        {/* INFORMATION PAGES */}
        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        <Route
          path="/privacy-policy"
          element={<PrivacyPolicy />}
        />

        <Route
          path="/terms"
          element={<Terms />}
        />

        <Route
          path="/disclaimer"
          element={<Disclaimer />}
        />

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </Suspense>
  );
}

export default AppRoutes;