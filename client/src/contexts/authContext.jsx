import { createContext, useState, useEffect } from "react";
export const AuthContext = createContext();
import { makeRequest } from "../utils/axios.jsx";

export const AuthContextProvider = ({ children }) => {
  // children = props.chidren
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const login = async (inputsValues) => {
    const response = await makeRequest.post(
      `http://localhost:8000/auth/login`,
      inputsValues
    );
    setCurrentUser(response.data); // User data fetched from API
  };

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser)); // Cannot store objects in localStorage, it has to be a string
  }, [currentUser]);

  const value = { currentUser, login };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
