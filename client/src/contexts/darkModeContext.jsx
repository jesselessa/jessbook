import { createContext, useState, useEffect } from "react";

export const DarkModeContext = createContext();

export const DarkModeContextProvider = ({ children }) => {
  const storedDarkTheme = localStorage.getItem("darkMode");
  const [darkMode, setDarkMode] = useState(
    storedDarkTheme ? JSON.parse(storedDarkTheme) : false
  );

  const toggleTheme = () => setDarkMode(!darkMode);

  // Sync darkMode state with localStorage on app load and when it changes
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Values provided by DarkModeContext to App
  const values = { darkMode, toggleTheme };

  return (
    <DarkModeContext.Provider value={values}>
      {children}
    </DarkModeContext.Provider>
  );
};
