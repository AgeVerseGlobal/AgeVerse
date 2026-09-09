import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("ageverse-dark-mode") === "true";
  });

  useEffect(() => {

    document.documentElement.classList.toggle(
      "dark-mode",
      darkMode
    );

    localStorage.setItem(
      "ageverse-dark-mode",
      darkMode
    );

  }, [darkMode]);


  const toggleTheme = () => {
    setDarkMode((current) => !current);
  };


  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}


export function useTheme() {

  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}