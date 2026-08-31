import { BrowserRouter } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AppRoutes from "./routes/AppRoutes";
import SEO from "./components/SEO";

function App() {
  return (
    <BrowserRouter>
      <SEO/>
      
      <MainLayout>
        <AppRoutes />
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
