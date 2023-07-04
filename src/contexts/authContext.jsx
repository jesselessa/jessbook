import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const login = () => {
    // TODO : Replace dummy data
    setCurrentUser({
      id: 1,
      firstName: "John",
      lastName: "Doe",
      profilePic:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    });
  };

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser)); // Cannot store objects is LS, it has to be a string
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login }}>
      {children}
    </AuthContext.Provider>
  );
};
