import { createContext, useState, useEffect } from "react";

export const DarkModeContext = createContext();

export const DarkModeContextProvider = ({ children }) => {
  const storedDarkTheme = localStorage.getItem("darkMode");
  const [darkMode, setDarkMode] = useState(
    storedDarkTheme ? JSON.parse(storedDarkTheme) : false
  );

  const toggleTheme = () => setDarkMode(!darkMode);

  const values = { darkMode, toggleTheme };

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <DarkModeContext.Provider value={values}>
      {children}
    </DarkModeContext.Provider>
  );
};
