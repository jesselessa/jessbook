//************************** AuthCallback.jsx *****************************
// Handles OAuth callback redirection
// Uses connectWithToken() from AuthContext to finalize authentication
//*************************************************************************

import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./authCallback.scss";
import { toast } from "react-toastify";

// Component
import Loader from "../../components/loader/Loader.jsx";

// Context
import { AuthContext } from "../../contexts/AuthContext.jsx";

export default function AuthCallback() {
  const { connectWithToken } = useContext(AuthContext);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isRedirecting, setIsRedirecting] = useState(true);

  const navigate = useNavigate();

  // Handle responsive
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Handle OAuth redirection
  useEffect(() => {
    const redirectAfterAuth = async () => {
      try {
        await connectWithToken();
        navigate("/home", { replace: true });
      } catch (error) {
        navigate("/", { replace: true });
        toast.error(
          error.response?.data?.message ||
            error.response?.data?.error ||
            error.message
        );
      } finally {
        setIsRedirecting(false);
      }
    };

    redirectAfterAuth();
  }, []);

  return (
    <div className="authCallback">
      <span className="logo">{windowWidth <= 425 ? "j" : "jessbook"}</span>
      {isRedirecting && <Loader />}
    </div>
  );
}
