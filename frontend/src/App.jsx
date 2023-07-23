import { useContext } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import "./style.scss";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

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
import LeftMenu from "./components/leftMenu/LeftMenu.jsx";
import RightMenu from "./components/rightMenu/RightMenu.jsx";

function App() {
  const { currentUser } = useContext(AuthContext);
  const { darkMode } = useContext(DarkModeContext);

  //* Create a Layout component for a conditional rendering with Outlet
  const Layout = () => {
    return (
      <div className={`theme-${darkMode ? "dark" : "light"}`}>
        <Navbar />

        <div style={{ display: "flex" }}>
          <LeftMenu />
          <Outlet />
          <RightMenu />
        </div>
      </div>
    );
  };

  //* Protect routes for unauthenticated users
  const ProtectedRoute = ({ children }) => {
    // children => any page or layout
    if (!currentUser) {
      return <Navigate to="/login" />;
    }

    return children;
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        // Everything written inside ProtectedRoute ill be checked by the same name function
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      ),
      children: [
        { path: "/", element: <Home /> },
        { path: "/profile/:id", element: <Profile /> },
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "*",
      element: <Navigate to="/login" />,
    },
  ]);

  return (
    <div className="App">
      <RouterProvider router={router} />
      <ToastContainer />
    </div>
  );
}

export default App;
