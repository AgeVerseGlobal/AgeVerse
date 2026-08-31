import Header from "../components/Header";
import FeatureBar from "../components/FeatureBar";
import Footer from "../components/Footer";
import GlobalResultActions from "../components/GlobalResultActions";

function MainLayout({ children }) {
  return (
    <>
      <Header />
      <FeatureBar />

      {children}
      <GlobalResultActions />
      <Footer />
    </>
  );
}

export default MainLayout;