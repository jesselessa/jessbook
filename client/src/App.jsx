import { useContext, useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

// Component
import Overlay from "./components/overlay/Overlay.jsx";

// Context
import { AuthContext } from "./contexts/authContext.jsx";

function App() {
  const { currentUser } = useContext(AuthContext);

  // Handle navigation
  const ProtectedRoute = ({ children }) => {
    if (!currentUser) return <Login />;
    return children;
  };

  const router = createBrowserRouter([
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
    {
      path: "/",
      element: <Login />,
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
      path: "/register",
      element: <Register />,
    },
    {
      path: "/privacy",
      element: <Privacy />,
    },
    {
      path: "/terms-of-use",
      element: <TermsOfUse />,
    },
    {
      path: "*",
      element: <Login />,
    },
  ]);

  const queryClient = new QueryClient();

  return (
    <div className="App">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ToastContainer autoClose={1500} style={{ fontSize: "1.6rem" }} />
      </QueryClientProvider>

      <Overlay />
    </div>
  );
}

export default App;
