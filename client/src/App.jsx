import { useContext } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

// Pages
import Home from "./pages/home/Home.jsx";
import Profile from "./pages/profile/Profile.jsx";
import Login from "./pages/login/Login.jsx";
import Register from "./pages/register/Register.jsx";
import ForgotPassword from "./pages/forgotPassword/ForgotPassword.jsx";
import ResetPassword from "./pages/resetPassword/ResetPassword.jsx";

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
      path: "/",
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
      path: "/login",
      element: <Login />,
    },
    {
      path: "/forgot-password",
      element: <ForgotPassword />,
    },
    {
      path: "/reset-password/:token",
      element: <ResetPassword />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "*",
      element: <Login />,
    },
  ]);

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastContainer autoClose={1500} />
    </QueryClientProvider>
  );
}

export default App;
