import { createContext, useState, useEffect } from "react";
export const AuthContext = createContext();
import { makeRequest } from "../utils/axios.js";

export const AuthContextProvider = ({ children }) => {
  const storedUser = localStorage.getItem("user");
  const [currentUser, setCurrentUser] = useState(
    storedUser ? JSON.parse(storedUser) : null
  );

  const login = async (inputsValues) => {
    try {
      const res = await makeRequest.post(
        `http://localhost:8080/auth/login`,
        inputsValues
      );
      setCurrentUser(res.data); // User data fetched from API
    } catch (error) {
      console.error("Error during login process.");
    }
  };

  useEffect(() => {
    if (currentUser) localStorage.setItem("user", JSON.stringify(currentUser)); // We don't want 'currentUser' to have the value 'null'
  }, [currentUser]);

  const value = { currentUser, setCurrentUser, login };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
