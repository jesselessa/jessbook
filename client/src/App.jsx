import { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Components
import Navbar from "./components/navbar/Navbar.jsx";
import LeftBar from "./components/leftBar/LeftBar.jsx";
import RightBar from "./components/rightBar/RightBar.jsx";
import Home from "./pages/home/Home.jsx";
import Profile from "./pages/profile/Profile.jsx";
import Login from "./pages/login/Login.jsx";
import Register from "./pages/register/Register.jsx";

// Contexts
import { AuthContext } from "./contexts/authContext.jsx";
import { DarkModeContext } from "./contexts/darkModeContext.jsx";

function App() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);

  const queryClient = new QueryClient();

  const Layout = () => {
    return (
      <QueryClientProvider client={queryClient}>
        <div className={`theme-${darkMode ? "dark" : "light"}`}>
          <Navbar />
          <div style={{ display: "flex" }}>
            <LeftBar />
            <Outlet />
            <RightBar />
          </div>
        </div>
      </QueryClientProvider>
    );
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {currentUser ? (
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="profile/:id" element={<Profile />} />
            </Route>
          ) : (
            <Route path="/login" element={<Login />} />
          )}
          <Route path="/login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
      <ToastContainer autoclose={3000} draggable={false} />
    </Router>
  );
}

export default App;
