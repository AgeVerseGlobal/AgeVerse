import Header from "../components/Header";
import FeatureBar from "../components/FeatureBar";
import Footer from "../components/Footer";
import GlobalResultActions from "../components/GlobalResultActions";
import ExploreMoreCalculators from "../components/ExploreMoreCalculators";
import FeedbackWidget from "../components/FeedbackWidget";
import { useLocation } from "react-router-dom";

function MainLayout({ children }) {
  const location = useLocation();
  const calculatorPaths = [
    "/age-calculator", "/event-calculator", "/date-difference",
    "/retirement-calculator", "/health-profile", "/pregnancy-calculator",
    "/utility/unit-converter", "/utility/percentage-calculator",
    "/utility/gst-calculator", "/utility/emi-calculator",
    "/utility/discount-calculator", "/utility/sip-calculator",
    "/utility/fd-calculator", "/utility/rd-calculator",
  ];
  const isCalculatorPage = calculatorPaths.includes(location.pathname);

  return (
    <>
      <Header />
      <FeatureBar />

      {children}
      {isCalculatorPage && <ExploreMoreCalculators />}
      <GlobalResultActions />
      <FeedbackWidget />
      <Footer />
    </>
  );
}

export default MainLayout;
