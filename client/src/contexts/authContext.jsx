import { createContext, useState, useEffect } from "react";
export const AuthContext = createContext();
import { makeRequest } from "../utils/axios.js";
import { connectWithFacebook } from "../../../api/middlewares/configureAuthServiceStrategy.js";

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

  const connectViaAuthProvider = async (provider) => {
    try {
      const res = await makeRequest.get(
        `http://localhost:8080/auth/login/${provider}/callback`
      );
      setCurrentUser(res.data);
    } catch (error) {
      console.error(
        `Error connecting with ${provider.charAt(0) + provider.slice(1)}`
      );
    }
  };

  useEffect(() => {
    if (currentUser) localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  const value = { currentUser, setCurrentUser, login, connectViaAuthProvider };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
