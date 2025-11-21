import { useContext } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

// Pages
import Home from "./pages/home/Home.jsx";
import Profile from "./pages/profile/Profile.jsx";
import Login from "./pages/login/Login.jsx";
import AuthCallback from "./pages/authCallback/AuthCallback.jsx";
import Register from "./pages/register/Register.jsx";
import ForgotPassword from "./pages/forgotPassword/ForgotPassword.jsx";
import ResetPassword from "./pages/resetPassword/ResetPassword.jsx";
import Privacy from "./pages/privacy/Privacy.jsx";
import TermsOfUse from "./pages/termsOfUse/TermsOfUse.jsx";

// Context
import { AuthContext } from "./contexts/AuthContext.jsx";

// Custom component to protect routes
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  return currentUser ? children : <Navigate to="/" replace />;
};

function App() {
  const router = createBrowserRouter([
    // Public routes (no authentication required)
    {
      path: "/",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/login/auth-provider/callback",
      element: <AuthCallback />,
    },
    {
      path: "/forgot-password",
      element: <ForgotPassword />,
    },
    {
      path: "/reset-password",
      element: <ResetPassword />,
    },
    {
      path: "/privacy",
      element: <Privacy />,
    },
    {
      path: "/terms-of-use",
      element: <TermsOfUse />,
    },

    // Authenticated user routes
    {
      path: "/home",
      element: (
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      ),
    },
    {
      path: "/profile/:userId",
      element: (
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      ),
    },

    // Fallback route for undefined paths
    {
      path: "*",
      element: <Login />,
    },
  ]);

  return (
    <div className="App">
      <RouterProvider router={router} />
      <ToastContainer autoClose={1500} style={{ fontSize: "1.6rem" }} />
    </div>
  );
}

export default App;
