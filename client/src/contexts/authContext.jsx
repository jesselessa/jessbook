import { createContext, useState, useEffect } from "react";
import { makeRequest } from "../utils/axios.js";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  // children = props.chidren

  const storedUser = localStorage.getItem("user");
  const [currentUser, setCurrentUser] = useState(
    storedUser ? JSON.parse(storedUser) : null
  );

  const login = async (inputsValues) => {
    const res = await makeRequest.post(
      `http://localhost:8000/auth/login`,
      inputsValues
    );
    setCurrentUser(res.data); // User data fetched from API
  };

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser)); // Cannot store objects in localStorage, it has to be a string
  }, [currentUser]);

  const value = { currentUser, setCurrentUser, login };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
