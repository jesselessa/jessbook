import { useContext } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./style.scss";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Contexts
import { DarkModeContext } from "./contexts/darkModeContext.jsx";
import { AuthContext } from "./contexts/authContext.jsx";

// Pages
import Login from "./pages/login/Login.jsx";
import Register from "./pages/register/Register.jsx";
import Home from "./pages/home/Home.jsx";
import Profile from "./pages/profile/Profile.jsx";

// Components
import Navbar from "./components/navbar/Navbar.jsx";
import LeftBar from "./components/leftBar/LeftBar.jsx";
import RightBar from "./components/rightBar/RightBar.jsx";

function App() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`App theme-${darkMode ? "dark" : "light"}`}>
        <Router>
          <Navbar />

          <div style={{ display: "flex" }}>
            <LeftBar />

            <Routes>
              <Route path="/" element={currentUser ? <Home /> : <Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="*" element={<Login />} />
            </Routes>

            <RightBar />
          </div>
        </Router>

        <ToastContainer autoclose={3000} draggable={false} />
        {/* draggable = false => to remove error message from browser : "Unable to preventDefault inside passive event listener invocation"  */}
      </div>
    </QueryClientProvider>
  );
}

export default App;
