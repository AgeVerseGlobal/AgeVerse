import { Routes, Route, Navigate } from "react-router-dom";

import DateDifferenceCalculator from "../pages/DateDifferenceCalculator";
import Home from "../pages/Home";
import AgeCalculator from "../pages/ageCalculator";
import EventCalculator from "../pages/EventCalculator";
import RetirementCalculator from "../pages/RetirementCalculator";
import HealthProfileCalculator from "../pages/HealthProfileCalculator";
import PregnancyCalculator from "../pages/PregnancyCalculator";
import UnitConverter from "../pages/UnitConverter";
import PercentageCalculator from "../pages/PercentageCalculator";
import GstCalculator from "../components/GstCalculator";
import EmiCalculator from "../components/EmiCalculator";
import DiscountCalculator from "../components/DiscountCalculator";
import SipCalculator from "../pages/SipCalculator";
import FdCalculator from "../pages/FdCalculator";
import RdCalculator from "../pages/RdCalculator";
import DogAgeCalculator from "../pages/DogAgeCalculator";
import About from "../pages/About";
import Contact from "../pages/Contact";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import Terms from "../pages/Terms";
import Disclaimer from "../pages/Disclaimer";

function AppRoutes() {
  return (
    <Routes>

      {/* =========================
          HOME
      ========================= */}
      <Route
        path="/"
        element={<Home />}
      />

      {/* =========================
          AGE & DATE
      ========================= */}
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

      {/* =========================
          HEALTH
      ========================= */}

      <Route
        path="/health-profile"
        element={<HealthProfileCalculator />}
      />

      {/* =========================
          FAMILY
      ========================= */}
      <Route
        path="/pregnancy-calculator"
        element={<PregnancyCalculator />}
      />

      {/* =========================
          UTILITY
      ========================= */}
      <Route
        path="/utility/unit-converter"
        element={<UnitConverter />}
      />

      {/* Percentage Calculator */}
      <Route
        path="/utility/percentage-calculator"
        element={<PercentageCalculator />}
      />

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

      {/* SIP Calculator */}
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

      <Route
        path="/pet/dog-age-calculator"
        element={<DogAgeCalculator />}
      />
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
    </Routes>
  );
}

export default AppRoutes;
