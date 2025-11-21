import { createContext, useEffect, useState } from "react";
import { makeRequest } from "../utils/axios.js";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const storedUser = localStorage.getItem("user");
  const [currentUser, setCurrentUser] = useState(
    storedUser ? JSON.parse(storedUser) : null
  );

  // Clean current session
  const clearSession = () => {
    setCurrentUser(null);
    localStorage.removeItem("user");
  };

  // Login with credentials
  const login = async (inputsValues) => {
    try {
      const res = await makeRequest.post(`/auth/login`, inputsValues);
      setCurrentUser(res.data);
    } catch (error) {
      clearSession();
      throw error;
    }
  };

  // Login using JWT cookie
  const connectWithToken = async () => {
    try {
      const res = await makeRequest.post(`/auth/connect-with-token`);
      setCurrentUser(res.data);
    } catch (error) {
      clearSession();
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await makeRequest.post(`/auth/logout`);
    } catch (error) {
      throw error;
    } finally {
      clearSession();
    }
  };

  // Sync currentUser state with localStorage on app load and when it changes
  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  // Values provided by AuthContext to App
  const values = {
    currentUser,
    setCurrentUser,
    login,
    connectWithToken,
    clearSession,
    logout,
  };

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>;
};
