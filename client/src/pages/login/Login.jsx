import { useEffect, useContext, useState } from "react";
import "./login.scss";
import { Link, useNavigate } from "react-router-dom";

// Component
import LazyLoadImage from "../../components/lazyLoadImage/LazyLoadImage.jsx";

// Images
import google from "../../assets/images/auth/google.png";
import facebook from "../../assets/images/auth/facebook.png";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

export default function Login() {
  const { login, connectViaAuthProvider } = useContext(AuthContext);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [inputsValues, setInputsValues] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Check window object width when loading page (for responsive)
  useEffect(() => {
    window.addEventListener("resize", changeWindowWidth);
    return () => {
      window.removeEventListener("resize", changeWindowWidth);
    };
  }, [windowWidth]);

  const changeWindowWidth = () => setWindowWidth(window.innerWidth);

  // Handle inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputsValues((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const clearForm = () =>
    setInputsValues({
      email: "",
      password: "",
    });

  // Login feature
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(inputsValues);

      // Clear form and API error message
      clearForm();
      setError("");

      // Navigate to homepage
      navigate("/");
    } catch (error) {
      setError(error.response?.data.message || error.message);

      // Clear error message after 5 seconds
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  };

  const connectViaOAuth = async (provider) => {
    window.location.href = `http://localhost:8080/auth/login/${provider}`;

    try {
      await connectViaAuthProvider(provider);
      navigate("/");
    } catch (error) {
      console.error(
        `Error connecting with ${provider.charAt(0) + provider.slice(1)}`,
        error
      );
    }
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
            {/* Handle error from API */}
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

            {/* Buttons to connect to the app */}
            <button type="submit" className="submit">
              Sign in
            </button>

            {/* <Link to="http://localhost:8080/auth/login/google"> */}
            <button
              type="button"
              className="google"
              onClick={() => connectViaOAuth("google")}
            >
              Connect with&nbsp;
              {windowWidth <= 500 ? (
                <span>
                  <LazyLoadImage src={google} alt="google" />{" "}
                </span>
              ) : (
                <span>
                  Google&nbsp;
                  <LazyLoadImage src={google} alt="google" />{" "}
                </span>
              )}
            </button>
            {/* </Link> */}

            {/* <Link to="http://localhost:8080/auth/login/facebook"> */}
            <button
              type="button"
              className="facebook"
              onClick={() => connectViaOAuth("facebook")}
            >
              Connect with&nbsp;
              {windowWidth <= 500 ? (
                <span>
                  <LazyLoadImage src={facebook} alt="facebook" />{" "}
                </span>
              ) : (
                <span>
                  Facebook&nbsp;
                  <LazyLoadImage src={facebook} alt="facebook" />{" "}
                </span>
              )}
            </button>
            {/* </Link> */}

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
