import { useContext, useEffect, useState } from "react";
import "./authCallback.scss";
import { useNavigate, Link } from "react-router-dom";

// Component
import Loader from "../../components/loader/Loader.jsx";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

export default function AuthCallback() {
  const { connectWithToken } = useContext(AuthContext);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Check window object width for responsive design
  useEffect(() => {
    window.addEventListener("resize", changeWindowWidth);
    return () => {
      window.removeEventListener("resize", changeWindowWidth);
    };
  }, [windowWidth]);

  const changeWindowWidth = () => setWindowWidth(window.innerWidth);

  // Handle redirection after authentication
  useEffect(() => {
    const handleRedirectionAfterAuth = async () => {
      setLoading(true);

      try {
        await connectWithToken();
        navigate("/home");
      } catch (error) {
        console.error("Error connecting with token:", error);
        navigate("/"); // Redirect to login page
      } finally {
        setLoading(false);
      }
    };

    handleRedirectionAfterAuth();
  }, [navigate, connectWithToken]);

  return (
    <div className="authCallback">
      {/* Logo - Back to Login page */}
      <Link to="/">
        <span className="logo">{windowWidth <= 425 ? "j" : "jessbook"}</span>
      </Link>

      {loading && <Loader />}
    </div>
  );
}
