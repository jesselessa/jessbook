import { useContext, useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

// Pages
import Home from "./pages/home/Home.jsx";
import Profile from "./pages/profile/Profile.jsx";
import Login from "./pages/login/Login.jsx";
import Register from "./pages/register/Register.jsx";

// Context
import { AuthContext } from "./contexts/authContext.jsx";

function App() {
  const { currentUser } = useContext(AuthContext);
  const [showOverlay, setShowOverlay] = useState(false);

  // Force portrait mode for mobile devices on component mounting
  useEffect(() => {
    const handleOrientationChange = () => {
      const isLandscape = window.matchMedia("(orientation: landscape)").matches;
      const isSmallScreen = window.innerWidth <= 992;

      if (isLandscape && isSmallScreen) {
        setShowOverlay(true);
      } else {
        setShowOverlay(false);
      }
    };

    handleOrientationChange(); // Initial check
    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleOrientationChange); // Handle size changes

    // Cleanup on unmount
    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleOrientationChange);
    };
  }, []);

  // Handle navigation
  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Login />;
    }

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
      {showOverlay && (
        <div style={overlayStyles}>
          <p style={messageStyles}>Please, turn your device.</p>
        </div>
      )}
      <ToastContainer autoclose={2000} draggable={false} />
    </QueryClientProvider>
  );
}

// Styles for overlay and message
const overlayStyles = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.9)",
  color: "white",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const messageStyles = {
  fontSize: "1.8rem",
  textAlign: "center",
  padding: "20px",
  maxWidth: "80%",
};

export default App;
