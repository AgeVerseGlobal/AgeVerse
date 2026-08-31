import React from "react";
import ReactDOM from "react-dom/client";

import "./i18n/config";
import App from "./App";

import "./styles/global.css";
import "./styles/theme.css";
import "./styles/dark-mode.css";

import { ThemeProvider } from "./context/ThemeContext";
import TranslationBridge from "./components/TranslationBridge";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <TranslationBridge />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);