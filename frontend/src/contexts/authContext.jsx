import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  // children = props.chidren
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const login = async (inputsValues) => {
    const res = await axios.post(
      `http://localhost:8000/api/auth/login`,
      inputsValues,
      { withCredentials: true } // Because we use cookies
    );

    setCurrentUser(res.data); // User data fetched from API
  };

  const value = { currentUser, login };

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser)); // Cannot store objects is localStorage, it has to be a string
  }, [currentUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
