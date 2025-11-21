import { useEffect, useContext, useState } from "react";
import "./login.scss";
import { Link, useNavigate } from "react-router-dom";

// Components
import LazyLoadImage from "../../components/lazyLoadImage/LazyLoadImage.jsx";
import Loader from "../../components/loader/Loader.jsx";

// Images
import google from "../../assets/images/auth/google.png";
import facebook from "../../assets/images/auth/facebook.png";

// Context
import { AuthContext } from "../../contexts/AuthContext.jsx";

export default function Login() {
  const { login, connectWithToken, clearSession } = useContext(AuthContext);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [authChecking, setAuthChecking] = useState(true); // Initial auth check on page load
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputsValues, setInputsValues] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Auto-login if user is already authenticated
  useEffect(() => {
    const autoLogin = async () => {
      const stored = localStorage.getItem("user");

      // Skip auto-login if no stored user
      if (!stored) {
        setAuthChecking(false);
        return;
      }

      try {
        await connectWithToken();
        navigate("/home", { replace: true });
      } catch (error) {
        console.error("Auto-login failed:", error);
        clearSession();
      } finally {
        setAuthChecking(false);
      }
    };

    autoLogin();
  }, []);

  // Handle responsive
  useEffect(() => {
    window.addEventListener("resize", changeWindowWidth);
    return () => {
      window.removeEventListener("resize", changeWindowWidth);
    };
  }, []);

  const changeWindowWidth = () => setWindowWidth(window.innerWidth);

  // Handle inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputsValues((prev) => ({ ...prev, [name]: value }));
  };

  const clearForm = () =>
    setInputsValues({
      email: "",
      password: "",
    });

  // Submit login form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await login(inputsValues);
      clearForm();
      navigate("/home", { replace: true });
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const connectViaAuthProvider = (provider) => {
    window.location.href = `${
      import.meta.env.VITE_API_URL
    }/auth/login/${provider}`;
  };

  return (
    <div className="login">
      <div className="card">
        <div className="left">
          <h1>Welcome to Jessbook</h1>

          <div className="container">
            <p>
              Jessbook is a social media app that helps you stay connected with
              your family and friends.
            </p>
            <span>Don't have any account ?</span>&nbsp;
            <Link to="/register">
              <button> Register</button>
            </Link>
          </div>
        </div>

        <div className="right">
          {windowWidth <= 1150 ? (
            <h1 className="title-mob">Welcome&nbsp;to Jessbook</h1>
          ) : (
            <h1>Login</h1>
          )}

          <form name="login-form" onSubmit={handleSubmit}>
            {/* Display general API error message */}
            {error && <span className="error-msg">{error}</span>}

            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={inputsValues.email}
              autoComplete="off"
              onChange={handleChange}
            />

            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={inputsValues.password}
              autoComplete="off"
              onChange={handleChange}
            />

            {/* Login button */}
            <button type="submit" className="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>

            {/* Connect with Google */}
            <button
              type="button"
              className="google"
              onClick={() => connectViaAuthProvider("google")}
            >
              Connect with&nbsp;
              {windowWidth <= 500 ? (
                <span>
                  <LazyLoadImage src={google} alt="google" />
                </span>
              ) : (
                <span>
                  Google&nbsp;
                  <LazyLoadImage src={google} alt="google" />
                </span>
              )}
            </button>

            {/* Connect with Facebook */}
            {/* <button
              type="button"
              className="facebook"
              onClick={() => connectViaAuthProvider("facebook")}
            >
              Connect with&nbsp;
              {windowWidth <= 500 ? (
                <span>
                  <LazyLoadImage
                    src={facebook}
                    alt="facebook"
                    className="fb-icon"
                  />
                </span>
              ) : (
                <span>
                  Facebook&nbsp;
                  <LazyLoadImage
                    src={facebook}
                    alt="facebook"
                    className="fb-icon"
                  />
                </span>
              )}
            </button> */}

            <Link to="/forgot-password">
              <span className="password">Forgot your password ?</span>
            </Link>

            {windowWidth <= 1150 && (
              <Link to="/register">
                <button type="button" className="register-btn">
                  Register
                </button>
              </Link>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
