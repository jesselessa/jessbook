import { useEffect, useContext, useState } from "react";
import "./login.scss";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// Context
import { AuthContext } from "../../contexts/authContext.jsx";

export default function Login() {
  const { login } = useContext(AuthContext);
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
      toast.error("Login failed.");

      // Clear error message after 5 seconds
      setTimeout(() => {
        setError("");
      }, 5000);
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
            <span>Don't have any account ?</span>{" "}
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
              maxLength={320}
              value={inputsValues.email}
              autoComplete="off"
              required
              onChange={handleChange}
            />

            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              maxLength={200}
              value={inputsValues.password}
              autoComplete="off"
              required
              onChange={handleChange}
            />

            <button type="submit">Sign in</button>

            <Link to="/forgot-password">
              <span>Forgot your password ?</span>
            </Link>

            {windowWidth <= 1150 && (
              <Link to="/register">
                <button className="register-btn">Register</button>
              </Link>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
