import { createContext, useState, useEffect } from "react";
import { makeRequest } from "../utils/axios.js";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const storedUser = localStorage.getItem("user");
  const [currentUser, setCurrentUser] = useState(
    storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null
  );

  const login = async (inputsValues) => {
    try {
      const res = await makeRequest.post(
        `http://localhost:8080/auth/login`,
        inputsValues
      );
      // Update 'currentUser' with data fetched from API and store them in localStorage
      setCurrentUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (error) {
      throw error; // Propagate error to calling component
    }
  };

  const connectWithToken = async () => {
    try {
      const res = await makeRequest.post(
        "http://localhost:8080/auth/connect-with-token"
      );
      setCurrentUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    } catch (error) {
      throw error;
    }
  };

  // Ensure user data stored in 'currentUser' are always synchronized with localStorage, therefore available even after reloading or re-opening the app
  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  const values = {
    currentUser,
    setCurrentUser,
    login,
    connectWithToken,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};
