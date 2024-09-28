import { useEffect, useContext, useState } from "react";
import "./login.scss";
import { Link, useNavigate } from "react-router-dom";

// Context
import { AuthContext } from "../../contexts/authContext";

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
  }, [windowWidth]);

  const changeWindowWidth = () => setWindowWidth(window.innerWidth);

  // Handle inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputsValues((prevFields) => ({ ...prevFields, [name]: value }));
  };

  // Login feature
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(inputsValues);

      // Reset API error message
      setError("");

      // Clear form
      setInputsValues({
        email: "",
        password: "",
      });

      // Navigate to homepage
      navigate("/");
    } catch (error) {
      // Handle errors from API
      setError(error.response.data);
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
              name="email"
              id="email"
              placeholder="Email"
              required
              value={inputsValues.email}
              onChange={handleChange}
              autoComplete="off"
            />

            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              required
              value={inputsValues.password}
              onChange={handleChange}
              autoComplete="off"
            />

            <button type="submit">Sign in</button>

            {/* <span>Forgot your password ?</span> */}

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
